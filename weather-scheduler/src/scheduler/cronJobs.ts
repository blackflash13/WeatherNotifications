import cron from "node-cron";
import { WeatherProcessorService } from "../services/weatherProcessorService";

const weatherProcessor = new WeatherProcessorService();

export const startScheduler = async (): Promise<void> => {
    console.log("Starting weather scheduler...");

    cron.schedule("0 * * * *", async () => {
        console.log("Running hourly weather check...");
        await weatherProcessor.processWeatherForUsers("hourly");
    });

    cron.schedule("* * * * *", async () => {
        console.log("Running daily weather check...");
        await weatherProcessor.processWeatherForUsers("daily");
    });
};
