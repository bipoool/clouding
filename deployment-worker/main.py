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
from repositories.vault import get_credentials_by_name
import asyncio

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RabbitMQConsumer:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queue_name = 'clouding-plan'
        
        # RabbitMQ credentials from environment
        self.rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        self.rabbitmq_port = int(os.getenv('RABBITMQ_PORT', '5672'))
        self.rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
        self.rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        self.rabbitmq_vhost = os.getenv('RABBITMQ_VHOST', '/')

        self.lokiEndPoint = os.getenv('LOKI_ENDPOINT')

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            credentials = pika.PlainCredentials(self.rabbitmq_user, self.rabbitmq_password)
            parameters = pika.ConnectionParameters(
                host=self.rabbitmq_host,
                port=self.rabbitmq_port,
                virtual_host=self.rabbitmq_vhost,
                credentials=credentials
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare the queue
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            logger.info(f"Connected to RabbitMQ and declared queue: {self.queue_name}")
            
        except AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    def callback(self, ch, method, properties, body):
        """Process incoming messages"""
        try:
            logger.info(f"Received message: {body}")
            
            # TODO: add validation for the message
            # Parse the message
            message_data = json.loads(body)

            # Validate required fields
            if message_data.get('jobId') == None or message_data.get('hostIds') == None or message_data.get('blueprintId') == None or message_data.get('userId') == None or message_data.get('type') == None:
                logger.error(f"Invalid message: {message_data}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            if message_data.get("type") != 'plan' and message_data != 'deploy':
                logger.error(f"Invalid message: {message_data}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            # Validate hostIds is a list of integers
            host_ids = message_data.get('hostIds')
            if not isinstance(host_ids, list):
                logger.error("hostIds must be a list")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
                
            if not all(isinstance(host_id, int) for host_id in host_ids):
                logger.error("All hostIds must be integers")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return
            
            # Convert to Plan model
            plan_payload = planModel.Plan(
                jobId=message_data.get('jobId'),
                hostIds=message_data.get('hostIds'),
                blueprintId=message_data.get('blueprintId'),
                userId=message_data.get('userId')
            )
            
            hosts_with_credentials = hostRepository.getHostsWithCredentials(plan_payload.hostIds)
            
            # Populate credential values from Vault
            for host, credential in hosts_with_credentials:
                if credential and credential.name:
                    vault_value = get_credentials_by_name(f"{credential.name}-{plan_payload.userId}")
                    credential.value = vault_value
            
            logger.info(f"Fetched {len(hosts_with_credentials)} hosts with credentials")
            
            # Process the plan using the existing controller
            playbookInfo = ansibleGenerator.genenrateNotebook(plan_payload)
            ansibleGenerator.generateInventory(payload=plan_payload, hosts_and_creds=hosts_with_credentials)
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

    def start_consuming(self):
        """Start consuming messages from the queue"""
        try:
            # Set up consumer
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=self.callback
            )
            
            logger.info(f"Starting to consume messages from queue: {self.queue_name}")
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
        consumer.start_consuming()
    except Exception as e:
        logger.error(f"Failed to start consumer: {e}")
        consumer.stop()

if __name__ == "__main__":
    main()