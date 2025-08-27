export const UNAUTH_ENDPOINTS = [
    "/health",
    "/",
    "/status",
    "/ping"
] as const;

export const API_KEYS = {
    scheduler: process.env.SCHEDULER_API_KEY || "scheduler_secret_key_456",
} as const;

export const SERVICE_NAMES = {
    SCHEDULER: "scheduler",
} as const;

export const AUTH_HEADERS = {
    API_KEY: "x-api-key",
} as const;
