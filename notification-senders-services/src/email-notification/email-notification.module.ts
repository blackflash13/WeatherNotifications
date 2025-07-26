import { Module } from "@nestjs/common";
import { EmailNotificationService } from "./email-notification.service";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";

@Module({
    imports: [RabbitMQModule],
    providers: [EmailNotificationService],
    exports: [EmailNotificationService],
})
export class EmailNotificationModule {}
