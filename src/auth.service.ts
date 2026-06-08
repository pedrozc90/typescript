import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.ts";
import { prisma } from "./prisma.ts";

export type LoginInput = {
    email?: string;
    password?: string;
};

export type LoginPayload = {
    access_token: string;
    refresh_token: string;
    expires_at: string;
};

export type AuthServiceErrorCode = "VALIDATION" | "UNAUTHORIZED";

export type AuthServiceError = {
    code: AuthServiceErrorCode;
    message: string;
};

export type AuthServiceResult =
    | {
          data: LoginPayload;
      }
    | {
          error: AuthServiceError;
      };

export const login = async (input: LoginInput): Promise<AuthServiceResult> => {
    const { email, password } = input;

    if (!email || !password) {
        return { error: { code: "VALIDATION", message: "email and password are required" } };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: { code: "UNAUTHORIZED", message: "invalid credentials" } };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: { code: "UNAUTHORIZED", message: "invalid credentials" } };
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            lastLoginTimestamp: new Date(),
            version: { increment: 1 },
        },
    });

    const accessTokenExpiresAt = new Date(Date.now() + config.accessTokenExpiresInSeconds * 1000);

    const accessToken = jwt.sign(
        {
            sub: updatedUser.id.toString(),
            email: updatedUser.email,
            role: updatedUser.role,
        },
        config.accessTokenSecret,
        {
            expiresIn: config.accessTokenExpiresInSeconds,
        },
    );

    const refreshToken = jwt.sign(
        {
            sub: updatedUser.id.toString(),
            type: "refresh",
        },
        config.refreshTokenSecret,
        {
            expiresIn: config.refreshTokenExpiresIn,
        },
    );

    return {
        data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: accessTokenExpiresAt.toISOString(),
        },
    };
};
