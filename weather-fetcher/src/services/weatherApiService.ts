import axios from "axios";
import { CacheService, WeatherCacheData } from "./cacheService";

export interface WeatherApiResponse {
    city: string;
    temperature: number;
    description: string;
    timestamp: string;
}

export class WeatherApiService {
    private cacheService: CacheService;

    constructor(cacheService: CacheService) {
        this.cacheService = cacheService;
    }

    /**
     * Get weather data with cache-first approach
     */
    async getWeatherForCity(city: string): Promise<WeatherApiResponse> {
        try {
            const cachedData = await this.cacheService.getWeatherCache(city);
            if (cachedData) {
                return cachedData;
            }

            const freshData = await this.fetchFromExternalApi(city);

            await this.cacheService.setWeatherCache(city, freshData);

            return freshData;
        } catch (error) {
            console.error(`Error getting weather for ${city}:`, error);
            throw error;
        }
    }

    /**
     * Fetch weather data from external API
     */
    private async fetchFromExternalApi(city: string): Promise<WeatherCacheData> {
        try {
            const baseUrl = process.env.WEATHER_API_URL;
            const apiKey = process.env.WEATHER_API_KEY;
            if (!baseUrl || !apiKey) {
                throw new Error("No API key or base URL provided");
            }

            const response = await axios.get(`${baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`, {
                timeout: 5000,
            });

            const weatherData = response.data;

            return {
                city: weatherData.name,
                temperature: Math.round(weatherData.main.temp),
                description: weatherData.weather[0].description,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new Error(`City "${city}" not found`);
                }

                if (error.response?.status === 401) {
                    throw new Error("Invalid API key");
                }

                throw new Error(`Weather API error: ${error.message}`);
            }

            throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
