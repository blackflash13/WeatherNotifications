import cron from "node-cron";
import { UserService, SubscriptionPreferences } from "../services/userService";
import { WeatherFetcherService } from "../services/weatherFetcherService";

const weatherService = new WeatherFetcherService();
const userService = new UserService();

export function startScheduler(): void {
  console.log("Starting weather scheduler...");

  cron.schedule("0 * * * *", async () => {
    console.log("Running hourly weather check...");
    await processWeatherForUsers("hourly");
  });

  cron.schedule("* * * * *", async () => {
    console.log("Running daily weather check...");
    await processWeatherForUsers("daily");
  });

  console.log("Scheduler configured:");
}

async function processWeatherForUsers(
  frequency: "hourly" | "daily"
): Promise<void> {
  try {
    const isHealthy = await weatherService.checkHealthStatus();
    if (!isHealthy) {
      console.error(
        "Weather Fetcher service is not available, skipping this run"
      );
      return;
    }

    const subscriptions = await userService.getUsersToProcess(frequency);

    console.log(
      `Found ${subscriptions.length} confirmed subscriptions for ${frequency} notifications`
    );

    if (subscriptions.length === 0) {
      console.log("ℹNo confirmed subscriptions found for processing");

      return;
    }

    const subscriptionsByCity = userService.groupUsersByCity(subscriptions);

    console.log(
      `Processing ${Object.keys(subscriptionsByCity).length} unique cities`
    );

    for (const [city, citySubscriptions] of Object.entries(
      subscriptionsByCity
    )) {
      try {
        const weatherData = await weatherService.getWeatherForCity(city);

        if (weatherData) {
          citySubscriptions.forEach((subscription) => {
            console.log(`→ ${subscription.email} (${city})`);
          });
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
