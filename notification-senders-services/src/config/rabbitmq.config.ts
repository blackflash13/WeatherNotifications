export interface QueueConfig {
    exchangeName: string;
    queueName: string;
    routingKey: string;
}

export interface ChannelQueueConfig {
    [key: string]: QueueConfig;
}

export const QUEUE_CONFIGS: ChannelQueueConfig = {
    email: {
        exchangeName: "notifications",
        queueName: "email_notifications",
        routingKey: "notification.email",
    },
    telegram: {
        exchangeName: "notifications",
        queueName: "telegram_notifications",
        routingKey: "notification.telegram",
    },
    whatsapp: {
        exchangeName: "notifications",
        queueName: "whatsapp_notifications",
        routingKey: "notification.whatsapp",
    },
};

export const getRabbitMQUrl = (): string => {
    return process.env.RABBITMQ_URL || "amqp://localhost:5672";
};
