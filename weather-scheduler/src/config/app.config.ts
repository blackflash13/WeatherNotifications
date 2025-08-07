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

const configs: Configurations = {
    hourly: {
        cronTime: "0 * * * *",
        mongo_url: process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app",
        rabbitConfig: {
            url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
            prefetch: 10,
            exchange: process.env.RABBITMQ_EXCHANGE || "weather_notifications",
            emailQueue: process.env.RABBITMQ_EMAIL_QUEUE || "email_notifications",
            telegramQueue: process.env.RABBITMQ_TELEGRAM_QUEUE || "telegram_notifications",
            whatsappQueue: process.env.RABBITMQ_WHATSAPP_QUEUE || "whatsapp_notifications",
            emailRoutingKey: process.env.RABBITMQ_EMAIL_ROUTING_KEY || "weather.email",
            telegramRoutingKey: process.env.RABBITMQ_TELEGRAM_ROUTING_KEY || "weather.telegram",
            whatsappRoutingKey: process.env.RABBITMQ_WHATSAPP_ROUTING_KEY || "weather.whatsapp",
        },
    },
    daily: {
        cronTime: "0 9 * * *",
        mongo_url: process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app",
        rabbitConfig: {
            url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
            prefetch: 1,
            exchange: process.env.RABBITMQ_EXCHANGE || "weather_notifications",
            emailQueue: process.env.RABBITMQ_EMAIL_QUEUE || "email_notifications",
            telegramQueue: process.env.RABBITMQ_TELEGRAM_QUEUE || "telegram_notifications",
            whatsappQueue: process.env.RABBITMQ_WHATSAPP_QUEUE || "whatsapp_notifications",
            emailRoutingKey: process.env.RABBITMQ_EMAIL_ROUTING_KEY || "weather.email",
            telegramRoutingKey: process.env.RABBITMQ_TELEGRAM_ROUTING_KEY || "weather.telegram",
            whatsappRoutingKey: process.env.RABBITMQ_WHATSAPP_ROUTING_KEY || "weather.whatsapp",
        },
    },
};

export const getConfig = (): AppConfig => {
    const notificationType = process.env.NOTIFICATION_TYPE as keyof Configurations;

    if (!notificationType || !configs[notificationType]) {
        throw new Error(`Invalid NOTIFICATION_TYPE: ${notificationType}. Must be 'hourly' or 'daily'`);
    }

    return configs[notificationType];
};

export default configs;
