import { Subscription, ISubscription } from "../models/User";

export interface SubscriptionPreferences {
  email: string;
  city: string;
  frequency: "hourly" | "daily";
}

export class UserService {
  /**
   * Get subscriptions that need weather notifications based on frequency
   */
  async getUsersToProcess(
    frequency: "hourly" | "daily"
  ): Promise<SubscriptionPreferences[]> {
    const subscriptions = await Subscription.find(
      {
        active: true,
        confirmed: true,
        frequency,
      },
      {
        email: true,
        city: true,
        frequency: true,
      }
    ).lean();

    return subscriptions.map((subscription) => ({
      email: subscription.email,
      city: subscription.city,
      frequency: subscription.frequency,
    }));
  }

  /**
   * Group subscriptions by city to optimize API calls
   */
  groupUsersByCity(
    subscriptions: SubscriptionPreferences[]
  ): Record<string, SubscriptionPreferences[]> {
    return subscriptions.reduce((groups, subscription) => {
      const city = subscription.city.toLowerCase().trim();
      if (!groups[city]) {
        groups[city] = [];
      }
      groups[city].push(subscription);
      return groups;
    }, {} as Record<string, SubscriptionPreferences[]>);
  }
}
