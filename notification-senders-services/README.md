# Email Notification Sender Service

This is an isolated NestJS microservice dedicated to processing email notifications from RabbitMQ queues. It's part of the Weather Notification system and specifically handles email delivery for weather updates.

## Features

- 🚀 NestJS-based microservice architecture
- 📬 RabbitMQ queue consumption for email notifications
- 📧 Email notification processing (sending logic to be implemented)
- 🔧 Environment-based configuration
- ⚡ Automatic queue setup and connection management

## Prerequisites

- Node.js (v18+)
- RabbitMQ server running on localhost:5672 (or configured URL)
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Copy the environment example file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3002

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

```

## Running the Service

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## Queue Configuration

The service connects to the following RabbitMQ configuration:

- **Exchange**: `notifications` (topic)
- **Queue**: `email_notifications` (durable)
- **Routing Key**: `notification.email`

## Message Format

The service expects messages in the following format:

```json
{
    "type": "weather_notification",
    "channel": "email",
    "data": {
        "recipient": "user@example.com",
        "city": "New York",
        "frequency": "daily",
        "weather": {
            "temperature": 22,
            "description": "Sunny",
            "timestamp": "2024-01-15T10:00:00Z"
        }
    },
    "timestamp": 1705312800000,
    "priority": "normal"
}
```

## Service Architecture

```
src/
├── main.ts                           # Application entry point
├── app.module.ts                     # Main application module
├── config/
│   └── rabbitmq.config.ts           # RabbitMQ configuration
├── types/
│   └── notification.dto.ts          # Message type definitions
├── rabbitmq/
│   ├── rabbitmq.service.ts          # RabbitMQ connection & queue management
│   └── rabbitmq.module.ts           # RabbitMQ module
└── email-notification/
    ├── email-notification.service.ts # Email processing logic
    └── email-notification.module.ts  # Email notification module
```

## Current Status

✅ **Implemented:**

- NestJS application setup
- RabbitMQ connection and queue consumption
- Message parsing and validation
- Logging and error handling

## Testing

You can test the service by publishing messages to the `email_notifications` queue in RabbitMQ. The service will consume and process them, logging the email details that would be sent.
