const {Rental} = require("../../models/rental");
const {User} = require("../../models/user");
const {Movie} = require("../../models/movie");
const mongoose = require("mongoose");
const request = require("supertest");
const moment = require("moment");

describe("/api/returns", () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;

    const exec = (() => {
        return request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({customerId, movieId});
    });

    beforeEach(async() => {
        server = require("../../index");
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        movie = new Movie({
            _id: movieId,
            title: "12345",
            dailyRentalRate: 2,
            genre: { name: "12345"},
            numberInStock: 10
        });
        await movie.save();
        rental = new Rental({
            customer: {
                _id: customerId,
                name: "12345",
                phone: "12345"
            },
            movie: {
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2
            }
        });
        await rental.save();
    });
    afterEach(async() => {
        await Rental.remove({});
        await Movie.remove({});
        await server.close();
    });

    it ("should return 401 if client is not logged in", async() => {
        token = "";

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it ("should return 400 if customer id is not provided", async() => {
        customerId = "";

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ("should return 400 if movie id is not provided", async() => {
        movieId = "";

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ("should return 404 if no rental found for customerId and movieId", async() => {
        //customerId = new User().generateAuthToken();
        await Rental.remove({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it ("should return 400 if the return was already processed", async() => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ("should return 200 if the return is a valid request", async() => {
        //rental.dateReturned = new Date();
       // await rental.save();

        const res = await exec();

        expect(res.status).toBe(200);
    });

    it ("should set the date if the return is processed.", async() => {
        await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;

        expect(diff).toBeLessThan(10 * 1000);
    });

    it ("should calculate the rental fee", async() => {

        rental.dateOut = moment().add(-7, "days").toDate();
        await rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBe(7 * 2);
    });

    it ("should increase the amount of movies in stock after a return", async() => {
        await exec();

        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it ("should return the rental in the body of the response", async() => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

       // expect(res.body).toHaveProperty("dateOut");

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(["dateOut", "dateReturned", "rentalFee", "customer", "movie"])
            );
    });

});