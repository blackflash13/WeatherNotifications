import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUE_CONFIGS } from "../config/rabbitmq.config";
import { NotificationMessage } from "../types/notification.dto";

@Injectable()
export class EmailNotificationService implements OnModuleInit {
    private readonly logger = new Logger(EmailNotificationService.name);
    private readonly EMAIL_RATE_LIMIT_MS = parseInt(process.env.EMAIL_RATE_LIMIT_MS) || 300;
    private lastEmailTime = 0;

    constructor(private readonly rabbitMQService: RabbitMQService) {}

    async onModuleInit() {
        await this.setupEmailQueue();
        await this.startConsumingEmailNotifications();

        this.logger.log("Email Notification Service is ready!");
    }

    private async setupEmailQueue() {
        try {
            const emailConfig = QUEUE_CONFIGS.email;
            await this.rabbitMQService.setupQueue(emailConfig);
        } catch (error) {
            this.logger.error("Failed to setup email queue:", error);
            throw error;
        }
    }

    private async startConsumingEmailNotifications() {
        try {
            const emailConfig = QUEUE_CONFIGS.email;

            await this.rabbitMQService.consumeMessages(emailConfig.queueName, this.processEmailNotification.bind(this), emailConfig.prefetch);

            this.logger.log(`✅ Started consuming email notifications with prefetch: ${emailConfig.prefetch}`);
        } catch (error) {
            this.logger.error("❌ Failed to start consuming email messages:", error);
            throw error;
        }
    }

    private async processEmailNotification(message: NotificationMessage): Promise<void> {
        const startTime = Date.now();

        try {
            // Rate limiting: ensure minimum time between emails
            const now = Date.now();
            const timeSinceLastEmail = now - this.lastEmailTime;

            if (timeSinceLastEmail < this.EMAIL_RATE_LIMIT_MS) {
                const waitTime = this.EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;

                await this.timeout(waitTime);
            }

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

            // Send email
            await this.sendEmail(
                message.data.recipient,
                `Weather Update for ${message.data.city}`,
                `Current weather in ${message.data.city}: ${message.data.weather.temperature}°C, ${message.data.weather.description}`
            );

            // Update last email time
            this.lastEmailTime = Date.now();

            const processingTime = Date.now() - startTime;
            this.logger.log(`✅ Email notification processed successfully for ${message.data.recipient} (${processingTime}ms)`);
        } catch (error) {
            this.logger.error("❌ Error processing email notification:", error);
            throw error;
        }
    }

    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendEmail(to: string, subject: string, content: string): Promise<void> {
        this.logger.log(`📧 Sending email to ${to} with subject: ${subject}`);
        this.logger.log(`📧 Content: ${content}`);

        // TODO: Implement actual email sending logic (e.g., using Nodemailer, SendGrid, etc.)
        // For now, just simulate the email sending
        await this.timeout(100); // Simulate email service response time

        this.logger.log(`✅ Email sent successfully to ${to}`);
    }
}
