import { Subscription } from "../models/User";
import { UserNotificationPreference, NotificationChannel } from "../types/notification";

export interface SubscriptionPreferences {
    _id: string;
    email: string;
    city: string;
    frequency: "hourly" | "daily";
    channels: UserNotificationPreference;
}

export class UserService {
    /**
     * Get subscriptions that need weather notifications based on frequency
     */
    async getUsersToProcess(frequency: "hourly" | "daily"): Promise<SubscriptionPreferences[]> {
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
                telegram_id: true,
                whatsapp_phone: true,
            }
        ).lean();

        return subscriptions.map(subscription => ({
            _id: subscription._id.toString(),
            email: subscription.email,
            city: subscription.city,
            frequency: subscription.frequency,
            channels: {
                email: subscription.email,
            },
        }));
    }

    /**
     * Group subscriptions by city to optimize API calls
     */
    groupUsersByCity(subscriptions: SubscriptionPreferences[]): Record<string, SubscriptionPreferences[]> {
        return subscriptions.reduce(
            (groups, subscription) => {
                const city = subscription.city.toLowerCase().trim();
                if (!groups[city]) {
                    groups[city] = [];
                }
                groups[city].push(subscription);

                return groups;
            },
            {} as Record<string, SubscriptionPreferences[]>
        );
    }

    /**
     * Get available notification channels for a user
     */
    getActiveChannelsForUser(channels: UserNotificationPreference): NotificationChannel[] {
        const activeChannels: NotificationChannel[] = [];

        if (channels.email) {
            activeChannels.push("email");
        }
        if (channels.telegram) {
            activeChannels.push("telegram");
        }
        if (channels.whatsapp) {
            activeChannels.push("whatsapp");
        }

        return activeChannels;
    }
}
