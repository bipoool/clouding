import os
import json
import logging
import threading
from dotenv import load_dotenv
import pika
from pika.exceptions import AMQPConnectionError

from ansibleWorker import ansibleGenerator
from ansibleWorker.ansibleRunner import AnsibleRunner
from models import plan as planModel

from repositories import host as hostRepository
from repositories.vault import getCredentialsByName
import asyncio

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RabbitMQConsumer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queueName = 'clouding-plan'
        
        # RabbitMQ credentials from environment
        self.rabbitmqHost = os.getenv('RABBITMQ_HOST', 'localhost')
        self.rabbitmqPort = int(os.getenv('RABBITMQ_PORT', '5672'))
        self.rabbitmqUser = os.getenv('RABBITMQ_USER', 'guest')
        self.rabbitmqPassword = os.getenv('RABBITMQ_PASSWORD', 'guest')
        self.rabbitmqVhost = os.getenv('RABBITMQ_VHOST', '/')

        self.lokiEndPoint = os.getenv('LOKI_ENDPOINT')

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(self.rabbitmqUser, self.rabbitmqPassword)
            parameters = pika.ConnectionParameters(
                host=self.rabbitmqHost,
                port=self.rabbitmqPort,
                virtual_host=self.rabbitmqVhost,
                credentials=credentials
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare the queue
            self.channel.queue_declare(queue=self.queueName, durable=True)
            logger.info(f"Connected to RabbitMQ and declared queue: {self.queueName}")
            
        except AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    def callback(self, ch, method, properties, body):
        """Process incoming messages"""
        try:
            logger.info(f"Received message: {body}")
            
            # TODO: add validation for the message
            # Parse the message
            messageData = json.loads(body)

            # Validate required fields
            if messageData.get('jobId') == None or messageData.get('hostIds') == None or messageData.get('blueprintId') == None or messageData.get('userId') == None or messageData.get('type') == None:
                logger.error(f"Invalid message: {messageData}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            if messageData.get("type") != 'plan' and messageData.get("type") != 'deploy':
                logger.error(f"Invalid message: {messageData}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            # Validate hostIds is a list of integers
            hostIds = messageData.get('hostIds')
            if not isinstance(hostIds, list):
                logger.error("hostIds must be a list")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
                
            if not all(isinstance(hostId, int) for hostId in hostIds):
                logger.error("All hostIds must be integers")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            
            # Convert to Plan model
            planPayload = planModel.Plan(
                jobId=messageData.get('jobId'),
                hostIds=messageData.get('hostIds'),
                blueprintId=messageData.get('blueprintId'),
                userId=messageData.get('userId')
            )
            
            hostsWithCredentials = hostRepository.getHostsWithCredentials(planPayload.hostIds)
            
            # Populate credential values from Vault
            for host, credential in hostsWithCredentials:
                if credential and credential.name:
                    vaultValue = getCredentialsByName(f"{credential.name}-{planPayload.userId}")
                    credential.value = vaultValue
            
            logger.info(f"Fetched {len(hostsWithCredentials)} hosts with credentials")
            
            # Process the plan using the existing controller
            playbookInfo = ansibleGenerator.generateNotebook(planPayload)
            ansibleGenerator.generateInventory(payload=planPayload, hostsAndCreds=hostsWithCredentials)
            ansibleRunner = AnsibleRunner(self.lokiEndPoint, playbookInfo.get("jobId"), playbookInfo.get("playbookName"), playbookInfo.get("playbookDir"), True)
            thread = threading.Thread(target=ansibleRunner.run)
            thread.start()
            
            logger.info(f"Plan processed successfully: {playbookInfo}")
            
            # Acknowledge the message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse message as JSON: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def startConsuming(self):
        """Start consuming messages from the queue"""
        try:
            # Set up consumer
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(
                queue=self.queueName,
                on_message_callback=self.callback
            )
            
            logger.info(f"Starting to consume messages from queue: {self.queueName}")
            logger.info("Press CTRL+C to stop")
            
            # Start consuming
            self.channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info("Stopping consumer...")
            self.stop()
        except Exception as e:
            logger.error(f"Error in consumer: {e}")
            self.stop()

    def stop(self):
        """Stop the consumer and close connections"""
        if self.channel:
            self.channel.stop_consuming()
        if self.connection:
            self.connection.close()
        logger.info("Consumer stopped")

def main():
    """Main function to start the RabbitMQ consumer"""
    consumer = RabbitMQConsumer()
    
    try:
        consumer.connect()
        consumer.startConsuming()
    except Exception as e:
        logger.error(f"Failed to start consumer: {e}")
        consumer.stop()

if __name__ == "__main__":
    main()