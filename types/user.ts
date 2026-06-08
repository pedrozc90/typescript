export type UserRole = "user" | "admin";

export interface CreateUserInput {
    email: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserInput {
    email?: string;
    password?: string;
    role?: UserRole;
}

export interface UserResponse {
    id: number;
    email: string;
    inserted_at: string;
    updated_at: string;
    version: number;
    role: string;
    logged_at: string | null;
}
