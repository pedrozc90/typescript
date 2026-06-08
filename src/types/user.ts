import type { User } from "../../prisma/generated/client.ts";

export type CreateUserInput = Pick<User, "email" | "password" | "role">;

export type UpdateUserInput = Partial<Pick<User, "email" | "password" | "role">>;

export interface UserResponse {
    id: number;
    email: string;
    inserted_at: string;
    updated_at: string;
    version: number;
    role: string;
    logged_at: string | null;
}
