import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailNotificationModule } from "./email-notification/email-notification.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
        EmailNotificationModule,
    ],
})
export class AppModule {}
