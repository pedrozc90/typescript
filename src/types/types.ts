export interface DatabaseSettings {
    url: string;
}

export interface Settings {
    nodeEnv: string;
    port: number;
    tokenExpiresInSeconds: number;
    tokenSecret: string;
    db: DatabaseSettings;
}
