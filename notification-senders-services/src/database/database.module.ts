import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>("MONGODB_URI") || "mongodb://localhost:27017/weather-app",
            }),
        }),
    ],
})
export class DatabaseModule {}
