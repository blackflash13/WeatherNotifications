import mongoose from "mongoose";

const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app";

export const connectDatabase = async (): Promise<void> => {
    try {
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
