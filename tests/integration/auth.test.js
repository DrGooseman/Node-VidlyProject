let server;
const request = require("supertest");
const {User} = require("../../models/user"); 
const {Genre} = require("../../models/genre"); 

describe("auth middleware", () => {
    beforeEach(() => {server = require("../../index");});
    afterEach(async() => {
        await Genre.remove({});
        await server.close();
        });

        let token;

        const exec = () => {
            return request(server)
            .post("/api/genres")
            .set("x-auth-token", token)
            .send({ name: "genre1"});
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
        });

        test("should return a 401 if no token is provided", async () => {
            token = "";
            const res = await exec();

            expect(res.status).toBe(401);
        });

        test("should return a 400 if token is invalid", async () => {
            token = "a";
            const res = await exec();

            expect(res.status).toBe(400);
        });

        test("should return a 200 if token is invalid", async () => {
           
            const res = await exec();

            expect(res.status).toBe(200);
        });
        
    });
    //
