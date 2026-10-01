const request = require("supertest");
const app = require("../SRC/app");

describe("EcoLink Authentication API", () => {

    test("Client should be able to register", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Client",
                email: `testclient_${Date.now()}@example.com`,
                password: "Password123!"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body).toHaveProperty(
            "message",
            "User registered successfully"
        );

        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("role", "CLIENT");
    }, 30000);


    test("Client should be able to login", async () => {

        const email = `loginclient_${Date.now()}@example.com`;
        const password = "Password123!";

        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Login Test Client",
                email: email,
                password: password
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: password
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty(
            "message",
            "Login successful"
        );

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("role", "CLIENT");
    }, 30000);


    test("Client should not login with an incorrect password", async () => {

        const email = `wrongpassword_${Date.now()}@example.com`;

        // Create account
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Wrong Password Client",
                email: email,
                password: "CorrectPassword123!"
            });

        // Try to login with wrong password
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: "WrongPassword123!"
            });

        console.log("WRONG PASSWORD STATUS:", response.statusCode);
        console.log("WRONG PASSWORD BODY:", response.body);

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message");
    }, 30000);

});