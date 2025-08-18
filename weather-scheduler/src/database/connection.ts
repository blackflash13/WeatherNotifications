import mongoose from "mongoose";
import { getConfig } from "../config/app.config";

export const connectDatabase = async (): Promise<void> => {
    try {
        const config = getConfig();
        const MONGO_URL = config.mongo_url;

        await mongoose.connect(MONGO_URL);

        console.log("Connected to MongoDB ✅");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw error;
    }
};
