import axios from "axios";

const WEATHER_FETCHER_URL = process.env.WEATHER_FETCHER_URL || "http://localhost:3000";

export interface WeatherData {
    city: string;
    temperature: number;
    description: string;
    timestamp: string;
}

export interface WeatherResponse {
    success: boolean;
    data: WeatherData;
    message: string;
}

export class WeatherFetcherService {
    constructor() {}

    async getWeatherForCity(city: string): Promise<WeatherData | null> {
        try {
            const response = await axios.get<WeatherResponse>(`${WEATHER_FETCHER_URL}/weather/${city}`, {
                timeout: 5000,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.data.success) {
                console.error(`Weather fetch failed for ${city}:`, response.data.message);

                return null;
            }

            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`HTTP error fetching weather for ${city}:`, error.message);
            } else {
                console.error(`Unexpected error fetching weather for ${city}:`, error);
            }

            return null;
        }
    }

    async checkHealthStatus(): Promise<boolean> {
        try {
            const response = await axios.get(`${WEATHER_FETCHER_URL}/health`, {
                timeout: 3000,
            });

            return response.status === 200;
        } catch (error) {
            console.error("Weather Fetcher service is not available:", error);

            return false;
        }
    }
}
