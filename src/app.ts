import express, { type Request, type Response } from "express";
import { authRouter } from "./auth.controller.ts";
import { userRouter } from "./user.controller.ts";

export const app = express();

app.use(express.json());
app.use(userRouter);
app.use(authRouter);

app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    if (error instanceof SyntaxError) {
        return response.status(400).json({ error: "invalid json" });
    }

    console.error(error);

    return response.status(500).json({ error: "internal server error" });
});
