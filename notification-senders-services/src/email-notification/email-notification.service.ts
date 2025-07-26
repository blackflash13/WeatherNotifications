import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUE_CONFIGS } from "../config/rabbitmq.config";
import { NotificationMessage } from "../types/notification.dto";

@Injectable()
export class EmailNotificationService implements OnModuleInit {
    private readonly logger = new Logger(EmailNotificationService.name);

    constructor(private readonly rabbitMQService: RabbitMQService) {}

    async onModuleInit() {
        this.logger.log("Initializing Email Notification Service...🚀 ");

        await this.setupEmailQueue();
        await this.startConsumingEmailNotifications();

        this.logger.log("Email Notification Service is ready!");
    }

    private async setupEmailQueue() {
        try {
            const emailConfig = QUEUE_CONFIGS.email;
            await this.rabbitMQService.setupQueue(emailConfig);

            this.logger.log(`Email queue setup completed: ${emailConfig.queueName}`);
        } catch (error) {
            this.logger.error("Failed to setup email queue:", error);
            throw error;
        }
    }

    private async startConsumingEmailNotifications() {
        try {
            const emailConfig = QUEUE_CONFIGS.email;

            //await this.rabbitMQService.consumeMessages(emailConfig.queueName, this.processEmailNotification.bind(this));
        } catch (error) {
            this.logger.error("❌ Failed to start consuming email messages:", error);
            throw error;
        }
    }

    private async processEmailNotification(message: NotificationMessage): Promise<void> {
        const startTime = Date.now();

        try {
            this.logger.log("📨 Processing email notification:", {
                recipient: message.data.recipient,
                city: message.data.city,
                temperature: message.data.weather.temperature,
                description: message.data.weather.description,
                frequency: message.data.frequency,
                priority: message.priority,
                timestamp: new Date(message.timestamp).toISOString(),
            });

            if (message.channel !== "email") {
                this.logger.warn(`⚠️ Received non-email message in email queue: ${message.channel}`);

                return;
            }

            if (message.type !== "weather_notification") {
                this.logger.warn(`⚠️ Unknown message type: ${message.type}`);

                return;
            }

            const processingTime = Date.now() - startTime;
            this.logger.log(`Email notification processed successfully for ${message.data.recipient} (${processingTime}ms)`);
        } catch (error) {
            this.logger.error("❌ Error processing email notification:", error);
            throw error;
        }
    }

    async sendEmail(to: string, subject: string, content: string): Promise<void> {
        this.logger.log(`TODO: Send email to ${to} with subject: ${subject}`);
    }
}
