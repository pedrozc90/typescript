export interface JwtSettings {
    accessToken: {
        secret: string;
        expiresIn: string;
    };
    refreshToken: {
        secret: string;
        expiresIn: string;
    };
    salt: number;
}

export interface DatabaseSettings {
    url: string;
    user: string;
    pass: string;
}

export interface Settings {
    name: string;
    version: string;
    env: "production" | "development" | "test";
    port: number;
    jwt: JwtSettings;
    db: DatabaseSettings;
}
