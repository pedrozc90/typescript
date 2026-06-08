const parsePositiveInt = (value: string | undefined, defaultValue: number): number => {
    const parsed = Number.parseInt(value ?? "", 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return defaultValue;
    }

    return parsed;
};

export const config = {
    nodeEnv: process.env["NODE_ENV"] ?? "development",
    port: parsePositiveInt(process.env["PORT"], 3000),
    accessTokenSecret: process.env["ACCESS_TOKEN_SECRET"] ?? "change-me-access-secret",
    refreshTokenSecret: process.env["REFRESH_TOKEN_SECRET"] ?? "change-me-refresh-secret",
    accessTokenExpiresInSeconds: parsePositiveInt(process.env["ACCESS_TOKEN_EXPIRES_IN_SECONDS"], 3600),
    refreshTokenExpiresIn: process.env["REFRESH_TOKEN_EXPIRES_IN"] ?? "7d",
    bcryptSaltRounds: parsePositiveInt(process.env["BCRYPT_SALT_ROUNDS"], 10),
};

if (
    config.nodeEnv === "production" &&
    (config.accessTokenSecret === "change-me-access-secret" ||
        config.refreshTokenSecret === "change-me-refresh-secret")
) {
    throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in production");
}
