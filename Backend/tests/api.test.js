const request = require("supertest");
const app = require("../SRC/app");

describe("EcoLink API", () => {
    test("GET / should return API status", async () => {
        const response = await request(app).get("/");

        console.log("STATUS:", response.statusCode);
        console.log("BODY:", response.body);

        expect(response.statusCode).toBe(200);
    });
});