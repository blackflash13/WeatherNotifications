import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUrl =
      process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app";

    await mongoose.connect(mongoUrl);

    console.log("Connected to MongoDB:", mongoUrl);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}
