export type NotificationChannel = "email" | "telegram" | "whatsapp";

export interface NotificationMessage {
    type: "weather_notification";
    channel: NotificationChannel;
    data: {
        subscription_id: string;
        recipient: string;
        city: string;
        frequency: "hourly" | "daily";
        weather: {
            temperature: number;
            description: string;
            timestamp: string;
        };
    };
    timestamp: number;
    priority: "normal" | "high";
}

export interface QueueConfig {
    exchangeName: string;
    queueName: string;
    routingKey: string;
}

export interface ChannelQueueConfig {
    [key: string]: QueueConfig;
}

export interface UserNotificationPreference {
    email?: string;
    telegram?: string;
    whatsapp?: string;
}
