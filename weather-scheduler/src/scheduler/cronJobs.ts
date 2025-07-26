import cron from "node-cron";
import { UserService } from "../services/userService";
import { WeatherFetcherService } from "../services/weatherFetcherService";
import { NotificationMessage } from "../types/notification";
import { queueService } from "../server";

const weatherService = new WeatherFetcherService();
const userService = new UserService();

export async function startScheduler(): Promise<void> {
    console.log("Starting weather scheduler...");

    cron.schedule("0 * * * *", async () => {
        console.log("Running hourly weather check...");
        await processWeatherForUsers("hourly");
    });

    cron.schedule("* * * * *", async () => {
        console.log("Running daily weather check...");
        await processWeatherForUsers("daily");
    });
}

async function processWeatherForUsers(frequency: "hourly" | "daily"): Promise<void> {
    try {
        const isHealthy = await weatherService.checkHealthStatus();
        if (!isHealthy) {
            console.error("Weather Fetcher service is not available, skipping this run");

            return;
        }

        const subscriptions = await userService.getUsersToProcess(frequency);

        console.log(`Found ${subscriptions.length} confirmed subscriptions for ${frequency} notifications`);

        if (subscriptions.length === 0) {
            console.log("No confirmed subscriptions found for processing");

            return;
        }

        const subscriptionsByCity = userService.groupUsersByCity(subscriptions);

        console.log(`Processing ${Object.keys(subscriptionsByCity).length} unique cities`);

        for (const [city, citySubscriptions] of Object.entries(subscriptionsByCity)) {
            try {
                const weatherData = await weatherService.getWeatherForCity(city);

                if (weatherData) {
                    for (const subscription of citySubscriptions) {
                        const activeChannels = userService.getActiveChannelsForUser(subscription.channels);

                        for (const channel of activeChannels) {
                            let recipient: string;

                            switch (channel) {
                                case "email":
                                    recipient = subscription.channels.email!;
                                    break;
                                case "telegram":
                                    recipient = subscription.channels.telegram!;
                                    break;
                                case "whatsapp":
                                    recipient = subscription.channels.whatsapp!;
                                    break;
                                default:
                                    console.warn(`Unknown channel: ${channel}`);
                                    continue;
                            }

                            const notificationMessage: NotificationMessage = {
                                type: "weather_notification",
                                channel,
                                data: {
                                    recipient,
                                    city: subscription.city,
                                    frequency: subscription.frequency,
                                    weather: {
                                        temperature: weatherData.temperature,
                                        description: weatherData.description,
                                        timestamp: weatherData.timestamp,
                                    },
                                },
                                timestamp: new Date().getTime(),
                                priority: "normal",
                            };

                            const success = await queueService.publishNotification(notificationMessage);
                            if (!success) {
                                console.error(`Failed to queue ${channel} notification for ${recipient} (${city})`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing city ${city}:`, error);
            }
        }

        console.log(`Completed ${frequency} weather processing`);
    } catch (error) {
        console.error(`Error in processWeatherForUsers (${frequency}):`, error);
    }
}
