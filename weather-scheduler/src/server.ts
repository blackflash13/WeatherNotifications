import app from "./index";
import { connectDatabase } from "./database/connection";
import { startScheduler } from "./scheduler/cronJobs";
import { QueueService } from "./services/queueService";

const PORT = process.env.PORT || 3001;

export const queueService = new QueueService();

const startServer = async () => {
    try {
        console.log("Starting Weather Scheduler service...");

        await connectDatabase();
        await queueService.connect();
        await startScheduler();

        const server = app.listen(PORT, () => {
            console.log(`Weather Scheduler service is running on port ${PORT}`);
        });

        process.on("SIGTERM", () => {
            console.log("SIGTERM received, shutting down gracefully...");
            server.close(async () => {
                await queueService.disconnect();
                console.log("Server closed");
                process.exit(0);
            });
        });
    } catch (error) {
        console.error("Failed to start Weather Scheduler service:", error);
        process.exit(1);
    }
};

startServer();
