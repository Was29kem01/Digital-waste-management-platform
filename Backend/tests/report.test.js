
const request = require("supertest");
const app = require("../SRC/app");

describe("EcoLink Report API", () => {

    test("Authenticated user should be able to mark a report as collected", async () => {

        const email = "collectclient_" + Date.now() + "@example.com";
        const password = "Password123!";

        // Register client
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Collection Test Client",
                email: email,
                password: password
            });

        expect(registerResponse.statusCode).toBe(201);

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: email,
                password: password
            });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body).toHaveProperty("token");

        const token = loginResponse.body.token;

        // Create waste report
        const createResponse = await request(app)
            .post("/api/reports")
            .set("Authorization", "Bearer " + token)
            .send({
                latitude: 3.8480,
                longitude: 11.5021,
                priority: "NORMAL",
                photoUrl: "https://example.com/waste.jpg"
            });

        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body).toHaveProperty("id");

        const reportId = createResponse.body.id;

        // Mark report as collected
        const collectResponse = await request(app)
            .patch("/api/reports/" + reportId + "/status")
            .set("Authorization", "Bearer " + token)
            .send({
                status: "COLLECTED"
            });

        console.log("COLLECT STATUS:", collectResponse.statusCode);
        console.log("COLLECT BODY:", collectResponse.body);

        expect(collectResponse.statusCode).toBe(200);
        expect(collectResponse.body).toHaveProperty(
            "status",
            "COLLECTED"
        );

    }, 30000);

});
