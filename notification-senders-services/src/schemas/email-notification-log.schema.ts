import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { EmailStatusCode } from "../types/email-status.enum";

export type EmailNotificationLogDocument = EmailNotificationLog & Document;

@Schema({ timestamps: true, collection: "email_notification_logs" })
export class EmailNotificationLog {
    @Prop({ required: true, trim: true })
    subscription_id: string;

    @Prop({ required: true, enum: EmailStatusCode })
    status_code: EmailStatusCode;

    @Prop({ required: true })
    recipient: string;

    @Prop({ required: true })
    subject: string;

    @Prop()
    error_message?: string;

    @Prop()
    message_id?: string;

    @Prop()
    response?: string;
}

export const EmailNotificationLogSchema = SchemaFactory.createForClass(EmailNotificationLog);
