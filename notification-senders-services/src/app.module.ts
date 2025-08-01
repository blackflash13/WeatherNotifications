import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailNotificationModule } from "./email-notification/email-notification.module";
import { DatabaseModule } from "./database/database.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
        DatabaseModule,
        EmailNotificationModule,
    ],
})
export class AppModule {}
