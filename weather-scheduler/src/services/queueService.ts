import amqp from "amqplib";
import { randomUUID } from "crypto";

import { NotificationMessage, ChannelQueueConfig } from "../types/notification";

const RABBIT_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

export class QueueService {
    private connection: any = null;
    private channel: any = null;
    private channelConfigs: ChannelQueueConfig;
    private isConnected = false;

    constructor() {
        // TODO refactor this to use a more robust configuration system
        this.channelConfigs = {
            email: {
                exchangeName: process.env.RABBITMQ_EXCHANGE || "weather_notifications",
                queueName: process.env.RABBITMQ_EMAIL_QUEUE || "email_notifications",
                routingKey: process.env.RABBITMQ_EMAIL_ROUTING_KEY || "weather.email",
            },
            telegram: {
                exchangeName: process.env.RABBITMQ_EXCHANGE || "weather_notifications",
                queueName: process.env.RABBITMQ_TELEGRAM_QUEUE || "telegram_notifications",
                routingKey: process.env.RABBITMQ_TELEGRAM_ROUTING_KEY || "weather.telegram",
            },
            whatsapp: {
                exchangeName: process.env.RABBITMQ_EXCHANGE || "weather_notifications",
                queueName: process.env.RABBITMQ_WHATSAPP_QUEUE || "whatsapp_notifications",
                routingKey: process.env.RABBITMQ_WHATSAPP_ROUTING_KEY || "weather.whatsapp",
            },
        };
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(RABBIT_URL);
            this.channel = await this.connection.createChannel();

            for (const config of Object.values(this.channelConfigs)) {
                await this.channel.assertExchange(config.exchangeName, "direct", {
                    durable: true,
                });

                await this.channel.assertQueue(config.queueName, {
                    durable: true,
                });

                await this.channel.bindQueue(config.queueName, config.exchangeName, config.routingKey);
            }

            this.isConnected = true;
            console.log("Connected to Notification Queue RabbitMQ successfully ✅");

            this.connection.on("error", (err: Error) => {
                console.error("Notification Queue RabbitMQ connection failed:", err);
                this.isConnected = false;
            });

            this.connection.on("close", () => {
                console.log("RabbitMQ connection closed");
                this.isConnected = false;
            });
        } catch (error) {
            console.error("Failed to connect to RabbitMQ:", error);
            this.isConnected = false;
            throw error;
        }
    }

    async publishNotification(message: NotificationMessage): Promise<boolean> {
        if (!this.isConnected || !this.channel) {
            console.error("Notification Queue RabbitMQ not connected, attempting to reconnect...");
            try {
                await this.connect();
            } catch (error) {
                console.error("Failed to reconnect to Notification Queue RabbitMQ:", error);

                return false;
            }
        }

        try {
            if (!this.channel) {
                console.error("Channel not available");

                return false;
            }

            const channelConfig = this.channelConfigs[message.channel];
            if (!channelConfig) {
                console.error(`Unknown notification channel: ${message.channel}`);

                return false;
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));

            const published = this.channel.publish(channelConfig.exchangeName, channelConfig.routingKey, messageBuffer, {
                persistent: true,
                timestamp: Date.now(),
                messageId: randomUUID(),
                priority: message.priority === "high" ? 10 : 5,
                headers: {
                    channel: message.channel,
                    city: message.data.city,
                },
            });

            if (!published) {
                console.error(`Failed to publish ${message.channel} message to queue`);

                return false;
            }

            return true;
        } catch (error) {
            console.error("Error publishing notification:", error);

            return false;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }

            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            this.isConnected = false;
            console.log("Disconnected from RabbitMQ");
        } catch (error) {
            console.error("Error disconnecting from RabbitMQ:", error);
        }
    }

    get connected(): boolean {
        return this.isConnected;
    }
}
