import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SALT_SIZE = 16;
const HASH_SIZE = 64;

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

export function generateToken(): string {
    return randomBytes(32).toString("hex");
}
