import request from "supertest";
import { describe, expect, test } from "vitest";
import { app } from "../src/app.ts";

describe("API validations", () => {
    test("POST /users requires email and password", async () => {
        const response = await request(app).post("/users").send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("email and password are required");
    });

    test("PUT /users validates id", async () => {
        const response = await request(app).put("/users").send({ id: "abc" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid id");
    });

    test("GET /users/:id validates id", async () => {
        const response = await request(app).get("/users/abc");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid id");
    });

    test("POST /login requires email and password", async () => {
        const response = await request(app).post("/login").send({ email: "test@example.com" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("email and password are required");
    });
});
