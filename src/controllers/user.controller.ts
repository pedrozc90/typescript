import Router from "@koa/router";
import type Koa from "koa";
import {
    createUser,
    EmailAlreadyExistsError,
    getUserById,
    listUsers,
    updateUser,
    UserNotFoundError
} from "../services/user.service.ts";
import type { CreateUserInput, UpdateUserInput } from "../../types/user.ts";

function parseId(value: string | undefined): number | null {
    if (!value) {
        return null;
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

export const userRouter = new Router();

userRouter.post("/users", async (ctx) => {
    const payload = ctx.request.body as Partial<CreateUserInput>;

    if (!payload.email || !payload.password) {
        ctx.status = 400;
        ctx.body = {
            message: "email and password are required"
        };

        return;
    }

    const createInput: CreateUserInput = {
        email: payload.email,
        password: payload.password,
        ...(payload.role ? { role: payload.role } : {})
    };

    try {
        const user = await createUser(createInput);

        ctx.status = 201;
        ctx.body = user;
    } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
            ctx.status = 409;
            ctx.body = {
                message: "email already exists"
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
            message: "id is required"
        };

        return;
    }

    const updateInput: UpdateUserInput = {
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.password ? { password: payload.password } : {}),
        ...(payload.role ? { role: payload.role } : {})
    };

    try {
        const user = await updateUser(payload.id, updateInput);

        ctx.status = 200;
        ctx.body = user;
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            ctx.status = 404;
            ctx.body = {
                message: "user not found for update"
            };

            return;
        }

        throw error;
    }
});

userRouter.get("/users/:id", async (ctx) => {
    const id = parseId(ctx.params["id"]);

    if (!id) {
        ctx.status = 400;
        ctx.body = {
            message: "invalid id"
        };

        return;
    }

    const user = await getUserById(id);

    if (!user) {
        ctx.status = 404;
        ctx.body = {
            message: "user not found"
        };

        return;
    }

    ctx.status = 200;
    ctx.body = user;
});

userRouter.get("/users", async (ctx) => {
    const users = await listUsers();

    ctx.status = 200;
    ctx.body = users;
});

export function registerUserRoutes(app: Koa): void {
    app.use(userRouter.routes());
    app.use(userRouter.allowedMethods());
}
