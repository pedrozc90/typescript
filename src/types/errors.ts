import type { Context } from "koa";

export class ResponseError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }

    public toResult(ctx: Context): Context {
        ctx.status = this.status;
        ctx.body = {
            message: "user not found for update",
        };
        return { ...ctx };
    }
}

export class EmailAlreadyExistsError extends ResponseError {
    constructor() {
        super(409, "email already exists");
    }
}

export class UserNotFoundError extends ResponseError {
    constructor() {
        super(404, "user not found");
    }
}
