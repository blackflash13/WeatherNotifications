import express from "express";
import weatherRoutes from "./weather";
import { WeatherController } from "../controllers/weather";
import { AppController } from "../controllers/app";

const router = express.Router();

const appController = new AppController();

router.use("/weather", weatherRoutes);

router.get("/health", appController.getHealthStatus.bind(appController));

export default router;
