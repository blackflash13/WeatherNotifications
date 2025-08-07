import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// TODO refactor this to use a more robust configuration system
const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS?.split(",") || false : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
    res.status(200).json({
        status: "OK",
        service: "weather-scheduler",
        timestamp: new Date().toISOString(),
    });
});

export default app;
