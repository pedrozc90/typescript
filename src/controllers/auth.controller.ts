import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";

import { AuthService } from "../services/index.ts";

const authRouter = Router();

const loginRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "too many requests",
    },
});

authRouter.post("/login", loginRateLimiter, async (request: Request, response: Response) => {
    const result = await AuthService.login(request.body);

    if ("error" in result) {
        if (result.error.code === "VALIDATION") {
            return response.status(400).json({ error: result.error.message });
        }

        return response.status(401).json({ error: result.error.message });
    }

    return response.status(200).json(result.data);
});

export default authRouter;
