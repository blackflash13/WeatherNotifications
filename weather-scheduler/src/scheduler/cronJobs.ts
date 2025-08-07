import cron from "node-cron";
import { WeatherProcessorService } from "../services/weatherProcessorService";
import { getConfig } from "../config/app.config";

const weatherProcessor = new WeatherProcessorService();

export const startScheduler = async (): Promise<void> => {
    const config = getConfig();
    const notificationType = process.env.NOTIFICATION_TYPE as "hourly" | "daily";

    cron.schedule(config.cronTime, async () => {
        await weatherProcessor.processWeatherForUsers(notificationType);
    });

    console.log(`Starting weather scheduler for ${notificationType} notifications. Cron schedule: ${config.cronTime}`);
};
