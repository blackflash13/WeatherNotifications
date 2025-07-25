import { createClient, RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 1800; // 30 minutes

export interface WeatherCacheData {
    city: string;
    temperature: number;
    description: string;
    timestamp: string;
}

export class CacheService {
    private redisClient: RedisClientType;
    private isConnected = false;

    constructor() {
        this.redisClient = createClient({ url: REDIS_URL });

        this.redisClient.on("error", err => {
            console.error("Redis connection error:", err);
            this.isConnected = false;
        });

        this.redisClient.on("connect", () => {
            console.log("Connected to Redis successfully ✅ ");
            this.isConnected = true;
        });

        this.redisClient.on("disconnect", () => {
            console.log("Redis disconnected ❌");
            this.isConnected = false;
        });
    }

    async connect(): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.redisClient.connect();
            }
        } catch (error) {
            console.error("Failed to connect to Redis:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.isConnected) {
                await this.redisClient.disconnect();
                this.isConnected = false;
                console.log("Disconnected from Redis");
            }
        } catch (error) {
            console.error("Error disconnecting from Redis:", error);
        }
    }

    /**
     * Generate custom cache key for city weather data
     */
    private getCacheKey(city: string): string {
        const normalizedCity = city.toLowerCase().trim().replace(/\s+/g, "_");

        return `weather:city:${normalizedCity}`;
    }

    /**
     * Get cached weather data for a city
     */
    async getWeatherCache(city: string): Promise<WeatherCacheData | null> {
        try {
            if (!this.isConnected) {
                console.warn("Redis not connected, skipping cache read");

                return null;
            }

            const cacheKey = this.getCacheKey(city);
            const cachedData = await this.redisClient.get(cacheKey);

            if (!cachedData) {
                return null;
            }

            return JSON.parse(cachedData) as WeatherCacheData;
        } catch (error) {
            console.error(`Error reading cache for city ${city}:`, error);

            return null;
        }
    }

    /**
     * Cache weather data for a city with TTL
     */
    async setWeatherCache(city: string, data: WeatherCacheData): Promise<boolean> {
        try {
            if (!this.isConnected) {
                console.warn("Redis not connected, skipping cache write");

                return false;
            }

            const cacheKey = this.getCacheKey(city);
            const serializedData = JSON.stringify(data);

            await this.redisClient.setEx(cacheKey, TTL_SECONDS, serializedData);

            return true;
        } catch (error) {
            console.error(`Error caching data for city ${city}:`, error);

            return false;
        }
    }

    get connected(): boolean {
        return this.isConnected;
    }
}
