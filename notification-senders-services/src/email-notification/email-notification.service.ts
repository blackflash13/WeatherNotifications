import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { QUEUE_CONFIGS } from "../config/rabbitmq.config";
import { NotificationMessage } from "../types/notification.dto";
import { EmailLogService } from "../services/email-log.service";
import { EmailStatusCode } from "../types/email-status.enum";

@Injectable()
export class EmailNotificationService implements OnModuleInit {
    private readonly logger = new Logger(EmailNotificationService.name);
    private readonly EMAIL_RATE_LIMIT_MS = parseInt(process.env.EMAIL_RATE_LIMIT_MS) || 500;
    private lastEmailTime = 0;
    private transporter: nodemailer.Transporter;

    constructor(
        private readonly rabbitMQService: RabbitMQService,
        private readonly emailLogService: EmailLogService
    ) {
        this.initializeEmailTransporter();
    }

    private initializeEmailTransporter() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        this.logger.log("Email transporter initialized 📧 ");
    }

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
            const now = Date.now();
            const timeSinceLastEmail = now - this.lastEmailTime;

            if (timeSinceLastEmail < this.EMAIL_RATE_LIMIT_MS) {
                const waitTime = this.EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;

                await this.timeout(waitTime);
            }

            if (message.channel !== "email") {
                this.logger.warn(`⚠️ Received non-email message in email queue: ${message.channel}`);
                return;
            }

            if (message.type !== "weather_notification") {
                this.logger.warn(`⚠️ Unknown message type: ${message.type}`);
                return;
            }

            await this.sendEmail(
                message.data.recipient,
                `Weather Update for ${message.data.city}`,
                `Current weather in ${message.data.city}: ${message.data.weather.temperature}°C, ${message.data.weather.description}`,
                message.data.subscription_id
            );

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

    async sendEmail(to: string, subject: string, content: string, subscriptionId: string): Promise<void> {
        this.logger.log(`📧 Sending email to ${to} with subject: ${subject}`);

        let statusCode = EmailStatusCode.DELIVERED;
        let errorMessage: string | undefined;
        let messageId: string | undefined;
        let response: string | undefined;

        try {
            const mailOptions = {
                from: {
                    name: "Weather Notification",
                    address: process.env.SMTP_USER,
                },
                to,
                subject: subject,
                text: content,
                html: this.generateHtmlContent(content),
            };

            const result = await this.transporter.sendMail(mailOptions);
            messageId = result.messageId;
            response = result.response;

            this.logger.log(`✅ Email sent successfully to ${to}`, {
                messageId: result.messageId,
                response: result.response,
            });
        } catch (error) {
            statusCode = EmailStatusCode.FAILED;
            errorMessage = error.message;
            this.logger.error(`❌ Failed to send email to ${to}:`, error);
        } finally {
            try {
                await this.emailLogService.saveEmailLog({
                    subscription_id: subscriptionId,
                    status_code: statusCode,
                    recipient: to,
                    subject: subject,
                    error_message: errorMessage,
                    message_id: messageId,
                    response: response,
                });
            } catch (logError) {
                this.logger.error("❌ Failed to save email log:", logError);
                // Don't throw here to avoid failing the email sending process
            }
        }

        if (statusCode !== EmailStatusCode.DELIVERED) {
            throw new Error(`Failed to send email: ${errorMessage}`);
        }
    }

    private generateHtmlContent(textContent: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    .container {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .header {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: white;
                        padding: 20px;
                        border-radius: 0 0 5px 5px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🌤️ Weather Notification</h2>
                    </div>
                    <div class="content">
                        <p>${textContent.replace(/\n/g, "<br>")}</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated weather notification service.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}
