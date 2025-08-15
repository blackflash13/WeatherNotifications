import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EmailNotificationLog, EmailNotificationLogDocument } from "../schemas/email-notification-log.schema";
import { EmailStatusCode } from "../types/email-status.enum";

export interface EmailLogData {
    subscription_id: string;
    status_code: EmailStatusCode;
    recipient: string;
    subject: string;
    error_message?: string;
    message_id?: string;
    response?: string;
}

@Injectable()
export class EmailLogService {
    private readonly logger = new Logger(EmailLogService.name);

    constructor(@InjectModel(EmailNotificationLog.name) private emailLogModel: Model<EmailNotificationLogDocument>) {}

    async saveEmailLog(logData: EmailLogData): Promise<void> {
        try {
            const emailLog = new this.emailLogModel(logData);

            await emailLog.save();
        } catch (error) {
            this.logger.error("❌ Failed to save email log:", error);
            throw error;
        }
    }
}
