export const UNAUTH_ENDPOINTS = ["/health", "/", "/status", "/ping"] as const;

export const SERVICE_NAMES = {
    SCHEDULER: "scheduler",
} as const;

export const AUTH_HEADERS = {
    API_KEY: "x-api-key",
} as const;

export const getApiKeys = () => ({ scheduler: process.env.SCHEDULER_API_KEY });
