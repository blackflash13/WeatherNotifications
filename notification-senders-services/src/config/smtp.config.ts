import * as config from "config";

export interface SMTPConfig {
    service?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    senderName?: string;
    rateLimitMs?: number;
    auth: {
        user: string;
        pass: string;
    };
}

export const getSMTPConfig = (): SMTPConfig => {
    const smtpConfig = config.get("smtp") as SMTPConfig;

    const resolvedConfig: SMTPConfig = {
        ...smtpConfig,
        auth: {
            user: smtpConfig.auth.user,
            pass: smtpConfig.auth.pass,
        },
    };

    if (!resolvedConfig.auth.user || !resolvedConfig.auth.pass) {
        throw new Error("SMTP authentication credentials are missing. Please set SMTP_USER and SMTP_PASS environment variables.");
    }

    return resolvedConfig;
};
