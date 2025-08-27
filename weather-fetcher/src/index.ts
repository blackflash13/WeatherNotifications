import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { AuthMiddleware } from "./middleware/authMiddleware";

dotenv.config();

const app = express();

const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS?.split(",") || false : true,
    credentials: true,
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(AuthMiddleware.serviceAuthentication);

app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
