import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailNotificationService } from "./email-notification.service";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";
import { EmailLogService } from "../services/email-log.service";
import { EmailNotificationLog, EmailNotificationLogSchema } from "../schemas/email-notification-log.schema";

@Module({
    imports: [RabbitMQModule, MongooseModule.forFeature([{ name: EmailNotificationLog.name, schema: EmailNotificationLogSchema }])],
    providers: [EmailNotificationService, EmailLogService],
    exports: [EmailNotificationService, EmailLogService],
})
export class EmailNotificationModule {}
