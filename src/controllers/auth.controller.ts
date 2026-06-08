import Router from "@koa/router";
import type Koa from "koa";
import { login } from "../services/auth.service.ts";
import type { LoginInput } from "../../types/auth.ts";

export const authRouter = new Router();

authRouter.post("/login", async (ctx) => {
    const payload = ctx.request.body as Partial<LoginInput>;

    if (!payload.email || !payload.password) {
        ctx.status = 400;
        ctx.body = {
            message: "email and password are required"
        };

        return;
    }

    const result = await login({
        email: payload.email,
        password: payload.password
    });

    if (!result) {
        ctx.status = 401;
        ctx.body = {
            message: "invalid credentials"
        };

        return;
    }

    ctx.status = 200;
    ctx.body = result;
});

export function registerAuthRoutes(app: Koa): void {
    app.use(authRouter.routes());
    app.use(authRouter.allowedMethods());
}
