import bcrypt from "bcryptjs";
import { type User } from "../../prisma/generated/client.ts";
import { UserRole, type UserRole as UserRoleType } from "../../prisma/generated/enums.ts";

import { settings } from "../settings/index.ts";
import { prisma } from "../libs/prisma.ts";

export type UserPayload = {
    id: string;
    email: string;
    inserted_at: string;
    updated_at: string;
    version: number;
    role: UserRoleType;
    last_login_timestamp: string | null;
};

export type UserServiceErrorCode = "VALIDATION" | "CONFLICT" | "NOT_FOUND";

export type UserServiceError = {
    code: UserServiceErrorCode;
    message: string;
};

export type UserServiceResult<T> =
    | {
          data: T;
      }
    | {
          error: UserServiceError;
      };

export type CreateUserInput = {
    email?: string;
    password?: string;
    role?: string;
    profile?: string;
};

export type UpdateUserInput = {
    id?: string | number;
    email?: string;
    password?: string;
    role?: string;
    profile?: string;
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

const toUserPayload = (user: User): UserPayload => {
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

export const createUser = async (input: CreateUserInput): Promise<UserServiceResult<UserPayload>> => {
    const { email, password } = input;
    const role = normalizeRole(input.role ?? input.profile);

    if (!email || !password) {
        return { error: { code: "VALIDATION", message: "email and password are required" } };
    }

    if (!isValidEmail(email)) {
        return { error: { code: "VALIDATION", message: "invalid email" } };
    }

    if (password.length < 8) {
        return { error: { code: "VALIDATION", message: "password must have at least 8 characters" } };
    }

    if ((input.role || input.profile) && !role) {
        return { error: { code: "VALIDATION", message: "invalid role/profile" } };
    }

    const hashedPassword = await bcrypt.hash(password, settings.jwt.salt);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role ?? UserRole.USER,
            },
        });

        return { data: toUserPayload(user) };
    } catch (error) {
        if (isPrismaErrorCode(error, "P2002")) {
            return { error: { code: "CONFLICT", message: "email already exists" } };
        }

        throw error;
    }
};

export const updateUser = async (input: UpdateUserInput): Promise<UserServiceResult<UserPayload>> => {
    const { id, email, password } = input;
    const role = normalizeRole(input.role ?? input.profile);

    if (id === undefined) {
        return { error: { code: "VALIDATION", message: "id is required" } };
    }

    const userId = parseUserId(id);

    if (userId === null) {
        return { error: { code: "VALIDATION", message: "invalid id" } };
    }

    if (email && !isValidEmail(email)) {
        return { error: { code: "VALIDATION", message: "invalid email" } };
    }

    if (password && password.length < 8) {
        return { error: { code: "VALIDATION", message: "password must have at least 8 characters" } };
    }

    if ((input.role || input.profile) && !role) {
        return { error: { code: "VALIDATION", message: "invalid role/profile" } };
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
        updates.password = await bcrypt.hash(password, settings.jwt.salt);
    }

    if (role) {
        updates.role = role;
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: updates,
        });

        return { data: toUserPayload(user) };
    } catch (error) {
        if (isPrismaErrorCode(error, "P2002")) {
            return { error: { code: "CONFLICT", message: "email already exists" } };
        }

        if (isPrismaErrorCode(error, "P2025")) {
            return { error: { code: "NOT_FOUND", message: "user not found" } };
        }

        throw error;
    }
};

export const getUserById = async (id: string): Promise<UserServiceResult<UserPayload>> => {
    const userId = parseUserId(id);

    if (userId === null) {
        return { error: { code: "VALIDATION", message: "invalid id" } };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return { error: { code: "NOT_FOUND", message: "user not found" } };
    }

    return { data: toUserPayload(user) };
};

export const listUsers = async (): Promise<UserPayload[]> => {
    const users = await prisma.user.findMany({
        orderBy: {
            id: "asc",
        },
    });

    return users.map(toUserPayload);
};
