import Router from "@koa/router";
import type Koa from "koa";

import { UserService } from "../services/index.ts";
import { type CreateUserInput, type UpdateUserInput, EmailAlreadyExistsError, UserNotFoundError } from "../types/index.ts";
import { toBigInt } from "@/utils/index.ts";

export const userRouter = new Router();

userRouter.post("/users", async (ctx) => {
    const payload = ctx.request.body as Partial<CreateUserInput>;

    if (!payload.email || !payload.password) {
        ctx.status = 400;
        ctx.body = {
            message: "email and password are required",
        };

        return;
    }

    const createInput: CreateUserInput = {
        email: payload.email,
        password: payload.password,
        role: payload.role ?? "USER",
    };

    try {
        const user = await UserService.createUser(createInput);

        ctx.status = 201;
        ctx.body = user;
    } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
            ctx.status = 409;
            ctx.body = {
                message: "email already exists",
            };

            return;
        }

        throw error;
    }
});

userRouter.put("/users", async (ctx) => {
    const payload = ctx.request.body as Partial<UpdateUserInput> & { id?: number };

    if (!payload.id) {
        ctx.status = 400;
        ctx.body = {
            message: "id is required",
        };

        return;
    }

    const updateInput: UpdateUserInput = {
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.password ? { password: payload.password } : {}),
        ...(payload.role ? { role: payload.role } : {}),
    };

    try {
        const user = await UserService.updateUser(payload.id, updateInput);

        ctx.status = 200;
        ctx.body = user;
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            ctx.status = error.status;
            ctx.body = {
                message: error.message,
            };

            return;
        }

        throw error;
    }
});

userRouter.get("/users/:id", async (ctx) => {
    const id = toBigInt(ctx.params["id"]);

    if (!id) {
        ctx.status = 400;
        ctx.body = {
            message: "invalid id",
        };

        return;
    }

    const user = await UserService.getUserById(id);

    if (!user) {
        ctx.status = 404;
        ctx.body = {
            message: "user not found",
        };

        return;
    }

    ctx.status = 200;
    ctx.body = user;
});

userRouter.get("/users", async (ctx) => {
    const users = await UserService.listUsers();

    ctx.status = 200;
    ctx.body = users;
});

export function registerUserRoutes(app: Koa): void {
    app.use(userRouter.routes());
    app.use(userRouter.allowedMethods());
}
