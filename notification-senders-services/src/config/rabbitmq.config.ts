export interface QueueConfig {
    exchangeName: string;
    queueName: string;
    routingKey: string;
    prefetch?: number;
}

export interface ChannelQueueConfig {
    [key: string]: QueueConfig;
}

export const QUEUE_CONFIGS: ChannelQueueConfig = {
    email: {
        exchangeName: "notifications",
        queueName: "email_notifications",
        routingKey: "notification.email",
        prefetch: 100,
    },
    telegram: {
        exchangeName: "notifications",
        queueName: "telegram_notifications",
        routingKey: "notification.telegram",
        prefetch: 50,
    },
    whatsapp: {
        exchangeName: "notifications",
        queueName: "whatsapp_notifications",
        routingKey: "notification.whatsapp",
        prefetch: 30,
    },
};

export const getRabbitMQUrl = (): string => {
    return process.env.RABBITMQ_URL || "amqp://localhost:5672";
};
