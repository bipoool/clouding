# Clouding Ansible Server

This service processes clouding Deployment via RabbitMQ messages instead of HTTP API calls.

## Setup

### Dependencies

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file with the following RabbitMQ configuration:

```env
# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/
```

### Running the Consumer

Start the RabbitMQ consumer:

```bash
python main.py
```

The consumer will:
1. Connect to RabbitMQ using the credentials from `.env`
2. Listen to the `clouding` queue
3. Process incoming messages and generate deployments using the existing controller

### Message Format

Messages should be JSON with the following structure:

```json
{
  "jobId": "unique-job-id",
  "hostIds": [1, 2, 3],
  "blueprintId": 123,
  "userId": "user-123"
}
```

### Features

- **Durable Queue**: Messages are persisted across RabbitMQ restarts
- **Message Acknowledgment**: Messages are only acknowledged after successful processing
- **Error Handling**: Failed messages are requeued for retry
- **Graceful Shutdown**: Handles CTRL+C to stop the consumer cleanly
- **Logging**: Comprehensive logging for monitoring and debugging 