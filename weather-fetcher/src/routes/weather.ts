import express from "express";
import { WeatherController } from "../controllers/weather";
import { CacheService } from "../services/cacheService";

const router = express.Router();

const cacheService = new CacheService();
const weatherController = new WeatherController(cacheService);

router.get("/:city", weatherController.getSingleCityWeather.bind(weatherController));

export default router;

export { cacheService };
