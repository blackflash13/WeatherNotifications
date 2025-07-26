import { IsString, IsNumber, IsIn, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export type NotificationChannel = "email" | "telegram" | "whatsapp";

export class WeatherData {
    @IsNumber()
    temperature: number;

    @IsString()
    description: string;

    @IsString()
    timestamp: string;
}

export class NotificationData {
    @IsString()
    recipient: string;

    @IsString()
    city: string;

    @IsIn(["hourly", "daily"])
    frequency: "hourly" | "daily";

    @ValidateNested()
    @Type(() => WeatherData)
    weather: WeatherData;
}

export class NotificationMessage {
    @IsIn(["weather_notification"])
    type: "weather_notification";

    @IsIn(["email", "telegram", "whatsapp"])
    channel: NotificationChannel;

    @ValidateNested()
    @Type(() => NotificationData)
    data: NotificationData;

    @IsNumber()
    timestamp: number;

    @IsIn(["normal", "high"])
    priority: "normal" | "high";
}
