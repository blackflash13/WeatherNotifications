import app from "./index";
import { connectDatabase } from "./database/connection";
import { startScheduler } from "./scheduler/cronJobs";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log("Starting Weather Scheduler service...");

    await connectDatabase();
    console.log("MongoDB connected successfully");

    startScheduler();
    console.log("Scheduler started");

    const server = app.listen(PORT, () => {
      console.log(`Weather Scheduler service is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start Weather Scheduler service:", error);
    process.exit(1);
  }
}

startServer();
