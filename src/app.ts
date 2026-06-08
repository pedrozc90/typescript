import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { registerAuthRoutes } from "./controllers/auth.controller.ts";
import { registerUserRoutes } from "./controllers/user.controller.ts";

export function createApp(): Koa {
    const app = new Koa();

    app.use(bodyParser());

    app.use(async (ctx, next) => {
        try {
            await next();
        } catch {
            ctx.status = 500;
            ctx.body = {
                message: "internal server error"
            };
        }
    });

    registerUserRoutes(app);
    registerAuthRoutes(app);

    return app;
}
