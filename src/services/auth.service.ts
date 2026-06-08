import { prisma } from "../libs/prisma.ts";
import { generateToken, verifyPassword } from "../libs/crypto.ts";
import { settings } from "../../settings/index.ts";
import type { LoginInput, LoginResponse } from "../../types/auth.ts";

export async function login(input: LoginInput): Promise<LoginResponse | null> {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email
        }
    });

    if (!user || !verifyPassword(input.password, user.password)) {
        return null;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            loggedAt: new Date(),
            version: {
                increment: 1
            }
        }
    });

    const now = Date.now();
    const expiresAt = new Date(now + settings.tokenExpiresInSeconds * 1000);

    return {
        access_token: generateToken(),
        refresh_token: generateToken(),
        expires_at: expiresAt.toISOString()
    };
}
