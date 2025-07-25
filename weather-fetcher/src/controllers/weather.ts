import { Request, Response } from "express";
import { WeatherApiService } from "../services/weatherApiService";
import { CacheService } from "../services/cacheService";

export class WeatherController {
    private weatherService: WeatherApiService;

    constructor(cacheService: CacheService) {
        this.weatherService = new WeatherApiService(cacheService);
    }

    /**
     * Get weather data for the city
     * GET /weather/:city
     */
    async getSingleCityWeather(req: Request, res: Response): Promise<void> {
        try {
            const { city } = req.params;

            if (!city || city.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "City is required",
                });

                return;
            }

            const weatherData = await this.weatherService.getWeatherForCity(city);

            res.json({
                success: true,
                data: weatherData,
                message: `Weather data for ${weatherData.city}`,
            });
        } catch (error) {
            console.error(`Error getting weather for ${req.params.city}:`, error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch weather data",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
