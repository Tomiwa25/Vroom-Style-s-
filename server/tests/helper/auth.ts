import request from "supertest";
import app from "../../src/app.js";


export const createTestUser = async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({
            email: `user-${Date.now()}@example.com`,
            password: "password123",
            firstName: "Test",
            lastname: "User",
        });

    return response.body.user
};

export const loginTestUser = async (email: string, password: "password123") => {
    const response = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return response.body.token
};


