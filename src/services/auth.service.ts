import { prisma } from "../libs/prisma.ts";
import { generateSignedToken, verifyPassword } from "../libs/crypto.ts";
import { settings } from "../../settings/index.ts";
import type { LoginInput, LoginResponse } from "../types/index.ts";

export async function login(input: LoginInput): Promise<LoginResponse | null> {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    if (!user || !verifyPassword(input.password, user.password)) {
        return null;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            loggedAt: new Date(),
            version: {
                increment: 1,
            },
        },
    });

    const now = Date.now();
    const accessExpiresAt = new Date(now + settings.tokenExpiresInSeconds * 1000);
    const refreshExpiresAt = new Date(now + settings.tokenExpiresInSeconds * 2 * 1000);

    return {
        access_token: generateSignedToken(user.id, "access", accessExpiresAt, settings.tokenSecret),
        refresh_token: generateSignedToken(user.id, "refresh", refreshExpiresAt, settings.tokenSecret),
        expires_at: accessExpiresAt.toISOString(),
    };
}
