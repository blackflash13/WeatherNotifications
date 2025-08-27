import { Request, Response, NextFunction } from "express";
import { UNAUTH_ENDPOINTS, getApiKeys, AUTH_HEADERS } from "../constants/auth.constants";

interface AuthenticatedRequest extends Request {
    service?: string;
}

export class AuthMiddleware {
    /**
     * Validates API key for internal services
     */
    static validateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
        const apiKey = req.headers[AUTH_HEADERS.API_KEY] as string;

        if (!apiKey) {
            res.status(401).json({
                error: "Missing API key",
                message: "Missing API key",
            });

            return;
        }

        const API_KEYS = getApiKeys();
        const service = Object.entries(API_KEYS).find(([_, key]) => key === apiKey)?.[0];

        if (!service) {
            res.status(403).json({
                error: "Bad API key",
                message: "Bad API key",
            });

            return;
        }

        req.service = service;

        next();
    }

    static serviceAuthentication(req: Request, res: Response, next: NextFunction): void {
        if (UNAUTH_ENDPOINTS.includes(req.path as any)) {
            next();

            return;
        }

        AuthMiddleware.validateApiKey(req as AuthenticatedRequest, res, next);
    }
}
