import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.ts";
import { prisma } from "./prisma.ts";

type UserPayload = {
    id: string;
    email: string;
    inserted_at: string;
    updated_at: string;
    version: number;
    role: UserRole;
    last_login_timestamp: string | null;
};

type CreateUserBody = {
    email?: string;
    password?: string;
    role?: string;
    profile?: string;
};

type UpdateUserBody = {
    id?: string | number;
    email?: string;
    password?: string;
    role?: string;
    profile?: string;
};

type LoginBody = {
    email?: string;
    password?: string;
};

const isValidEmail = (email: string): boolean => {
    if (email.length > 254) {
        return false;
    }

    const atPosition = email.indexOf("@");

    if (atPosition <= 0 || atPosition !== email.lastIndexOf("@")) {
        return false;
    }

    const domain = email.slice(atPosition + 1);

    return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
};

const normalizeRole = (role?: string): UserRole | undefined => {
    if (role === undefined) {
        return undefined;
    }

    const normalized = role.toUpperCase();

    if (normalized !== UserRole.USER && normalized !== UserRole.ADMIN) {
        return undefined;
    }

    return normalized as UserRole;
};

const parseUserId = (id: string | number): bigint | null => {
    try {
        const value = BigInt(id);

        if (value <= 0n) {
            return null;
        }

        return value;
    } catch {
        return null;
    }
};

const toUserPayload = (user: {
    id: bigint;
    email: string;
    insertedAt: Date;
    updatedAt: Date;
    version: number;
    role: UserRole;
    lastLoginTimestamp: Date | null;
}): UserPayload => {
    return {
        id: user.id.toString(),
        email: user.email,
        inserted_at: user.insertedAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        version: user.version,
        role: user.role,
        last_login_timestamp: user.lastLoginTimestamp?.toISOString() ?? null,
    };
};

const isPrismaErrorCode = (error: unknown, code: string): boolean => {
    return typeof error === "object" && error !== null && "code" in error && error.code === code;
};

export const app = express();

app.use(express.json());

app.post("/users", async (request: Request<unknown, unknown, CreateUserBody>, response: Response) => {
    const { email, password } = request.body;
    const role = normalizeRole(request.body.role ?? request.body.profile);

    if (!email || !password) {
        return response.status(400).json({ error: "email and password are required" });
    }

    if (!isValidEmail(email)) {
        return response.status(400).json({ error: "invalid email" });
    }

    if (password.length < 8) {
        return response.status(400).json({ error: "password must have at least 8 characters" });
    }

    if ((request.body.role || request.body.profile) && !role) {
        return response.status(400).json({ error: "invalid role/profile" });
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role ?? UserRole.USER,
            },
        });

        return response.status(201).json(toUserPayload(user));
    } catch (error) {
        if (isPrismaErrorCode(error, "P2002")) {
            return response.status(409).json({ error: "email already exists" });
        }

        throw error;
    }
});

app.put("/users", async (request: Request<unknown, unknown, UpdateUserBody>, response: Response) => {
    const { id, email, password } = request.body;
    const role = normalizeRole(request.body.role ?? request.body.profile);

    if (id === undefined) {
        return response.status(400).json({ error: "id is required" });
    }

    const userId = parseUserId(id);

    if (userId === null) {
        return response.status(400).json({ error: "invalid id" });
    }

    if (email && !isValidEmail(email)) {
        return response.status(400).json({ error: "invalid email" });
    }

    if (password && password.length < 8) {
        return response.status(400).json({ error: "password must have at least 8 characters" });
    }

    if ((request.body.role || request.body.profile) && !role) {
        return response.status(400).json({ error: "invalid role/profile" });
    }

    const updates: {
        email?: string;
        password?: string;
        role?: UserRole;
        version: { increment: number };
    } = {
        version: { increment: 1 },
    };

    if (email) {
        updates.email = email;
    }

    if (password) {
        updates.password = await bcrypt.hash(password, config.bcryptSaltRounds);
    }

    if (role) {
        updates.role = role;
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        return response.status(200).json(toUserPayload(user));
    } catch (error) {
        if (isPrismaErrorCode(error, "P2002")) {
            return response.status(409).json({ error: "email already exists" });
        }

        if (isPrismaErrorCode(error, "P2025")) {
            return response.status(404).json({ error: "user not found" });
        }

        throw error;
    }
});

app.get("/users/:id", async (request: Request<{ id: string }>, response: Response) => {
    const userId = parseUserId(request.params.id);

    if (userId === null) {
        return response.status(400).json({ error: "invalid id" });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return response.status(404).json({ error: "user not found" });
    }

    return response.status(200).json(toUserPayload(user));
});

app.get("/users", async (_request: Request, response: Response) => {
    const users = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
    });

    return response.status(200).json(users.map(toUserPayload));
});

app.post("/login", async (request: Request<unknown, unknown, LoginBody>, response: Response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return response.status(401).json({ error: "invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return response.status(401).json({ error: "invalid credentials" });
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

    return response.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: accessTokenExpiresAt.toISOString(),
    });
});

app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    if (error instanceof SyntaxError) {
        return response.status(400).json({ error: "invalid json" });
    }

    console.error(error);

    return response.status(500).json({ error: "internal server error" });
});
