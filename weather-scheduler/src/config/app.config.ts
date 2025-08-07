const config = require("config");

export interface RabbitMQConfig {
    url: string;
    prefetch?: number;
    exchange: string;
    emailQueue: string;
    telegramQueue: string;
    whatsappQueue: string;
    emailRoutingKey: string;
    telegramRoutingKey: string;
    whatsappRoutingKey: string;
}

export interface AppConfig {
    cronTime: string;
    mongo_url: string;
    rabbitConfig: RabbitMQConfig;
}

export interface Configurations {
    hourly: AppConfig;
    daily: AppConfig;
}

export const getConfig = (): AppConfig => {
    const notificationType = process.env.NOTIFICATION_TYPE as "hourly" | "daily";

    if (!notificationType || !["hourly", "daily"].includes(notificationType)) {
        throw new Error(`Invalid NOTIFICATION_TYPE: ${notificationType}.`);
    }

    const mongo_url = config.get("database.mongodb_uri");
    const rabbitUrl = config.get("rabbitmq.url");
    const exchange = config.get("rabbitmq.exchange");
    const notificationConfig = config.get(`notifications.${notificationType}`);
    const {
        cronTime,
        rabbitmq: { prefetch, queues, routingKeys },
    } = notificationConfig;

    return {
        cronTime,
        mongo_url,
        rabbitConfig: {
            url: rabbitUrl,
            prefetch,
            exchange,
            emailQueue: queues.email,
            telegramQueue: queues.telegram,
            whatsappQueue: queues.whatsapp,
            emailRoutingKey: routingKeys.email,
            telegramRoutingKey: routingKeys.telegram,
            whatsappRoutingKey: routingKeys.whatsapp,
        },
    };
};

export default config;
