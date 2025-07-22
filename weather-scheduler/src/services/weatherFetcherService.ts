import axios from "axios";

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.WEATHER_FETCHER_URL || "http://localhost:3000";
  }

  async getWeatherForCity(city: string): Promise<WeatherData | null> {
    try {
      console.log(`Fetching weather for ${city}...`);

      const response = await axios.get<WeatherResponse>(
        `${this.baseUrl}/weather/${city}`,
        {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log(
          `Weather fetched for ${city}: ${response.data.data.temperature}°C`
        );
        return response.data.data;
      } else {
        console.error(
          `Weather fetch failed for ${city}:`,
          response.data.message
        );
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `HTTP error fetching weather for ${city}:`,
          error.message
        );
      } else {
        console.error(`Unexpected error fetching weather for ${city}:`, error);
      }
      return null;
    }
  }

  async checkHealthStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 3000,
      });
      return response.status === 200;
    } catch (error) {
      console.error("Weather Fetcher service is not available:", error);
      return false;
    }
  }
}
