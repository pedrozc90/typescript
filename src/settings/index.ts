import pkg from "../../package.json" with { type: "json" };
import { Settings } from "../types/index.ts";
import { toInt } from "../utils/index.ts";

const env = process.env["NODE_ENV"];
if (typeof env === "string" && !(env === "production" || env === "development" || env === "test")) {
    throw new Error(`Invalid NODE_ENV '${env}' value.`);
}

export const settings: Settings = {
    name: pkg.name,
    version: pkg.version,
    env: env ?? "development",
    port: toInt(process.env["PORT"]) ?? 4000,
    jwt: {
        accessToken: {
            secret: process.env["ACCESS_TOKEN_SECRET"] ?? "change-me-access-secret",
            expiresIn: process.env["ACCESS_TOKEN_EXPIRES_IN"] ?? "1s", //toInt(process.env["ACCESS_TOKEN_EXPIRES_IN_SECONDS"]) ?? 3600,
        },
        refreshToken: {
            secret: process.env["REFRESH_TOKEN_SECRET"] ?? "change-me-refresh-secret",
            expiresIn: process.env["REFRESH_TOKEN_EXPIRES_IN"] ?? "7d",
        },
        // bcryptSaltRounds: toInt(process.env["BCRYPT_SALT_ROUNDS"], 10),
        salt: 10,
    },
    db: {
        url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/typescript",
        user: process.env["DATABSE_USER"] ?? "postgres",
        pass: process.env["DATABSE_USER"] ?? "postgres",
    },
};

if (
    settings.env === "production" &&
    (settings.jwt.accessToken.secret === "change-me-access-secret" ||
        settings.jwt.refreshToken.secret === "change-me-refresh-secret")
) {
    throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in production");
}
