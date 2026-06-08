import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_SIZE = 16;
const HASH_SIZE = 64;

function base64Url(value: string): string {
    return Buffer.from(value).toString("base64url");
}

export function hashPassword(password: string): string {
    const salt = randomBytes(SALT_SIZE).toString("hex");
    const hash = scryptSync(password, salt, HASH_SIZE).toString("hex");

    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
    const [salt, storedHash] = storedPassword.split(":");

    if (!salt || !storedHash) {
        return false;
    }

    const hash = scryptSync(password, salt, HASH_SIZE).toString("hex");

    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
}

export function generateSignedToken(userId: bigint, type: "access" | "refresh", expiresAt: Date, secret: string): string {
    const payload = {
        sub: userId,
        type,
        exp: Math.floor(expiresAt.getTime() / 1000),
        jti: randomBytes(16).toString("hex"),
    };

    const encodedPayload = base64Url(JSON.stringify(payload));
    const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");

    return `${encodedPayload}.${signature}`;
}
