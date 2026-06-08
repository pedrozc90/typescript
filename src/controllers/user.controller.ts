import { Router, type Request, type Response } from "express";
import { UserService } from "../services/index.ts";

export const userRouter = Router();

const respondError = (
    response: Response,
    error: {
        code: "VALIDATION" | "CONFLICT" | "NOT_FOUND";
        message: string;
    },
): Response => {
    if (error.code === "VALIDATION") {
        return response.status(400).json({ error: error.message });
    }

    if (error.code === "CONFLICT") {
        return response.status(409).json({ error: error.message });
    }

    return response.status(404).json({ error: error.message });
};

userRouter.post("/users", async (request: Request, response: Response) => {
    const result = await UserService.createUser(request.body);

    if ("error" in result) {
        return respondError(response, result.error);
    }

    return response.status(201).json(result.data);
});

userRouter.put("/users/:id", async (request: Request, response: Response) => {
    const result = await UserService.updateUser(request.params.id, request.body);

    if ("error" in result) {
        return respondError(response, result.error);
    }

    return response.status(200).json(result.data);
});

userRouter.get("/users/:id", async (request: Request<{ id: string }>, response: Response) => {
    const result = await UserService.getUserById(request.params.id);

    if ("error" in result) {
        return respondError(response, result.error);
    }

    return response.status(200).json(result.data);
});

userRouter.get("/users", async (_request: Request, response: Response) => {
    const users = await UserService.listUsers();

    return response.status(200).json(users);
});
