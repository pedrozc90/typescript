import type { Settings } from "../types/settings.ts";

function readNumber(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

export function loadSettings(env: NodeJS.ProcessEnv = process.env): Settings {
    const databaseUrl = env["DATABASE_URL"];

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is required");
    }

    return {
        nodeEnv: env["NODE_ENV"] ?? "development",
        port: readNumber(env["PORT"], 3000),
        databaseUrl,
        tokenExpiresInSeconds: readNumber(env["TOKEN_EXPIRES_IN_SECONDS"], 3600),
        tokenSecret: env["TOKEN_SECRET"] ?? "development-token-secret",
    };
}

export const settings = loadSettings();
