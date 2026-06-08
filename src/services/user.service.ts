import { prisma } from "../libs/prisma.ts";
import { hashPassword } from "../libs/crypto.ts";
import type { CreateUserInput, UpdateUserInput, UserResponse } from "../../types/user.ts";

export class EmailAlreadyExistsError extends Error {
    constructor() {
        super("email already exists");
    }
}

export class UserNotFoundError extends Error {
    constructor() {
        super("user not found");
    }
}

function toUserResponse(user: {
    id: number;
    email: string;
    insertedAt: Date;
    updatedAt: Date;
    version: number;
    role: string;
    loggedAt: Date | null;
}): UserResponse {
    return {
        id: user.id,
        email: user.email,
        inserted_at: user.insertedAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        version: user.version,
        role: user.role,
        logged_at: user.loggedAt ? user.loggedAt.toISOString() : null
    };
}

function hasPrismaCode(error: unknown, code: string): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === code
    );
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
    try {
        const user = await prisma.user.create({
            data: {
                email: input.email,
                password: hashPassword(input.password),
                role: input.role ?? "user"
            }
        });

        return toUserResponse(user);
    } catch (error) {
        if (hasPrismaCode(error, "P2002")) {
            throw new EmailAlreadyExistsError();
        }

        throw error;
    }
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserResponse> {
    const data: {
        email?: string;
        password?: string;
        role?: string;
        version: {
            increment: number;
        };
    } = {
        version: {
            increment: 1
        }
    };

    if (input.email) {
        data.email = input.email;
    }

    if (input.password) {
        data.password = hashPassword(input.password);
    }

    if (input.role) {
        data.role = input.role;
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data
        });

        return toUserResponse(user);
    } catch (error) {
        if (hasPrismaCode(error, "P2025")) {
            throw new UserNotFoundError();
        }

        throw error;
    }
}

export async function getUserById(id: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        return null;
    }

    return toUserResponse(user);
}

export async function listUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
        orderBy: {
            id: "asc"
        }
    });

    return users.map(toUserResponse);
}
