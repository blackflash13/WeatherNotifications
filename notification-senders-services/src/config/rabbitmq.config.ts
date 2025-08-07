const config = require("config");

export interface QueueConfig {
    exchangeName: string;
    queueName: string;
    routingKey: string;
    prefetch?: number;
}

export interface ChannelQueueConfig {
    [key: string]: QueueConfig;
}

const getQueueConfigs = (): ChannelQueueConfig => {
    const notificationType = process.env.NOTIFICATION_TYPE;

    if (!["hourly", "daily"].includes(notificationType)) {
        throw new Error(`Invalid NOTIFICATION_TYPE: ${notificationType}. Must be 'hourly' or 'daily'`);
    }

    const baseExchange = config.get("rabbitmq.exchange");
    const notificationConfig = config.get(`notifications.${notificationType}`) as any;
    const exchange = process.env.RABBITMQ_EXCHANGE || baseExchange;

    return {
        email: {
            exchangeName: exchange,
            queueName: notificationConfig.email.queueName,
            routingKey: notificationConfig.email.routingKey,
            prefetch: notificationConfig.email.prefetch,
        },
        telegram: {
            exchangeName: exchange,
            queueName: notificationConfig.telegram.queueName,
            routingKey: notificationConfig.telegram.routingKey,
            prefetch: notificationConfig.telegram.prefetch,
        },
        whatsapp: {
            exchangeName: exchange,
            queueName: notificationConfig.whatsapp.queueName,
            routingKey: notificationConfig.whatsapp.routingKey,
            prefetch: notificationConfig.whatsapp.prefetch,
        },
    };
};

export const QUEUE_CONFIGS: ChannelQueueConfig = getQueueConfigs();

export const getRabbitMQUrl = (): string => {
    return config.get("rabbitmq.url");
};
