let server;
const request = require("supertest");
const mongoose = require("mongoose");
const {Genre} = require("../../models/genre");
const {User} = require("../../models/user"); 

describe("/api/genres", () => {
    beforeEach(() => {server = require("../../index");});
    afterEach(async() => {
        await Genre.remove({});
        await server.close();
    });
////
    describe("GET /", () => {
        test("should return all genres", async () => {
            await Genre.collection.insertMany([
                { name: "genre1" },
                { name: "genre2" }
            ])

            const res = await request(server).get("/api/genres");

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === "genre1")).toBeTruthy();
            expect(res.body.some(g => g.name === "genre2")).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        test("should return a genre if a valid id is passed", async () => {
            const genre = new Genre({ name: "genre1" });
            await genre.save();

            const res = await request(server).get("/api/genres/" + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", genre.name);
        });

        test("should return 404 if an invalid id is passed", async () => {

            const res = await request(server).get("/api/genres/1");

            expect(res.status).toBe(404);
        });

        test("should return 404 if no genre with the given id exists", async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get("/api/genres/"+id);

            expect(res.status).toBe(404);
        });
    });

    describe("POST /", () => {

        let token;
        let name;

        const exec = async() => {
            return res = await request(server)
            .post("/api/genres")
            .set("x-auth-token", token)
            .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = "genre1"
        });

        test("should return a 401 if client is not logged in", async () => {
            token = "";
            const res = await exec();

            expect(res.status).toBe(401);
        });
        test("should return a 400 if genre is less than 5 chars", async () => {
            name = "1234";
            const res = await exec();

            expect(res.status).toBe(400);
        });
        test("should return a 400 if genre is more than 50 chars", async () => {
            name = new Array(52).join("a");
            const res = await exec();
            
            expect(res.status).toBe(400);
        });
        test("should save the genre if it is valid", async () => {
            await exec();
            const genre = await Genre.find({ name: "Genre1" });
            expect(genre).not.toBeNull();
        });
        test("should return the genre if it is valid", async () => {
            await exec();
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "genre1");
        });
    });
    //
});