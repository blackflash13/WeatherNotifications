import { Request, Response } from "express";

export class AppController {
    async getHealthStatus(_req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({
                status: "OK",
                service: "weather-fetcher",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || "local",
            });
        } catch (error) {
            console.error("Error checking health status:", error);

            res.status(500).json({
                status: "ERROR",
                service: "weather-fetcher",
                message: "Health check failed",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            });
        }
    }
}
