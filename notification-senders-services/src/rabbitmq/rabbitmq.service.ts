import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as amqp from "amqplib";
import { QueueConfig, getRabbitMQUrl } from "../config/rabbitmq.config";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: any;
    private channel: any;
    private readonly logger = new Logger(RabbitMQService.name);

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private async connect() {
        try {
            const rabbitMQUrl = getRabbitMQUrl();

            this.connection = await amqp.connect(rabbitMQUrl);
            this.channel = await this.connection.createChannel();

            this.logger.log("Connected to RabbitMQ");

            this.connection.on("error", (err: any) => {
                this.logger.error("RabbitMQ connection error:", err);
            });

            this.connection.on("close", () => {
                this.logger.warn("RabbitMQ connection closed");
            });
        } catch (error) {
            this.logger.error("Failed to connect to RabbitMQ:", error);
            throw error;
        }
    }

    private async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }

            this.logger.log("Disconnected from RabbitMQ");
        } catch (error) {
            this.logger.error("Error disconnecting from RabbitMQ:", error);
        }
    }

    async setupQueue(config: QueueConfig): Promise<void> {
        try {
            await this.channel.assertExchange(config.exchangeName, "direct", { durable: true });

            await this.channel.assertQueue(config.queueName, { durable: true });

            await this.channel.bindQueue(config.queueName, config.exchangeName, config.routingKey);

            if (config.prefetch) {
                await this.channel.prefetch(config.prefetch);
            }

            this.logger.log(`Queue setup completed for ${config.queueName}`);
        } catch (error) {
            this.logger.error(`Failed to setup queue ${config.queueName}:`, error);
            throw error;
        }
    }

    async consumeMessages(queueName: string, onMessage: (message: any) => Promise<void>, prefetch?: number): Promise<void> {
        try {
            if (prefetch) {
                await this.channel.prefetch(prefetch);
            }

            await this.channel.consume(queueName, async (msg: any) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());

                        await onMessage(content);

                        this.channel.ack(msg);
                    } catch (error) {
                        this.logger.error("Error processing message:", error);
                        this.channel.nack(msg, false, false);
                    }
                }
            });

            this.logger.log(`Started consuming messages from ${queueName}`);
        } catch (error) {
            this.logger.error(`Failed to consume messages from ${queueName}:`, error);
            throw error;
        }
    }

    getChannel(): any {
        return this.channel;
    }
}
