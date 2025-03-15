// Tests the Authentication API of the chat-app

import request from "supertest"; // Supertest allows us to simulate HTTP requests

import mongoose from "mongoose";
import expect from "expect";

// const app = require("../index.js");
const app = require("../index");

// const { User } = require("../routes/auth.js");
const User = require("../models/User");
const { connectDB } = require('../config'); // Adjust the path if necessary

/**
 * We rely on @shelf/jest-mongodb to supply process.env.MONGO_URL,
 * which points to an in-memory MongoDB instance for testing.
 *
 * jest.config.cjs references @shelf/jest-mongodb as a preset,
 */


/**
 * This describe block groups tests for the signup endpoint: POST /api/auth/signup
 */
describe("POST /api/contacts/search", () => {
  /**
   * Before any of our tests run, we connect Mongoose to the ephemeral MongoDB
   * instance provided by process.env.MONGO_URL. The connectDB function is
   * defined in `app.js`, so we just call it here.
   */
  beforeAll(async () => {
    await connectDB();
  });

  /**
   * After all tests complete, we disconnect from MongoDB to free resources
   * and ensure no open handles remain (important in Jest).
   */
  afterAll(async () => {
    await mongoose.disconnect();
  });

  /**
   * We clear out all users between tests so each test starts with a fresh DB.
   * This helps prevent one test's data from affecting another.
   */
  afterEach(async () => {
    await User.deleteMany({});
    
  });

    /*
    *   1) Test success of retrieving all the contacts
    */
    it("should get the list of contacts and return 200", async () => {

        
        // expect(userInDb).not.toBeNull();

        const res_signup1 = await request(app)
        .post("/api/auth/signup")
        .send({ email: "john@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
        const res_signup2 = await request(app)
        .post("/api/auth/signup")
        .send({ email: "mariya@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
    
        const res_signup3 = await request(app)
        .post("/api/auth/signup")
        .send({ email: "boosh@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

        const res_login1 = await request(app)
        .post("/api/auth/login")
        .send({ email: "john@example.com", password: "pass123" });

        expect(res_login1.status).toBe(200);

        // Test a search item 
        const res_getsearch1 = await request(app)
        .post("/api/contacts/search")
        .set("Authorization", `Bearer ${res_login1.body.token}`)
        .send({ searchTerm: "mariya@example.com"})

        expect(res_getsearch1.body.contacts.length).toBe(1);
        expect(res_getsearch1.status).toBe(200);
        expect(res_getsearch1.body.message).toBe("OK")

        // Test a search item 
        const res_getsearch2 = await request(app)
        .post("/api/contacts/search")
        .set("Authorization", `Bearer ${res_login1.body.token}`)
        .send({ searchTerm: ".com"})

        expect(res_getsearch2.body.contacts.length).toBe(3);
        expect(res_getsearch2.status).toBe(200);
        expect(res_getsearch2.body.message).toBe("OK")

        // Test a search item 
        const res_getsearch3 = await request(app)
        .post("/api/contacts/search")
        .set("Authorization", `Bearer ${res_login1.body.token}`)
        .send({ searchTerm: "someone"})

        expect(res_getsearch3.body.contacts.length).toBe(3);
        expect(res_getsearch3.status).toBe(200);
        expect(res_getsearch3.body.message).toBe("OK")

        // Test a search item 
        const res_getsearch4 = await request(app)
        .post("/api/contacts/search")
        .set("Authorization", `Bearer ${res_login1.body.token}`)
        .send({ searchTerm: "last"})

        expect(res_getsearch4.body.contacts.length).toBe(3);
        expect(res_getsearch4.status).toBe(200);
        expect(res_getsearch4.body.message).toBe("OK")
      
          // Test a search item 
          const res_getsearch5 = await request(app)
          .post("/api/contacts/search")
          .set("Authorization", `Bearer ${res_login1.body.token}`)
          .send({ searchTerm: "nonsense"})
  
          expect(res_getsearch5.body.contacts.length).toBe(0);
          expect(res_getsearch5.status).toBe(200);
          expect(res_getsearch5.body.message).toBe("OK")
        
      });

  /*
  *   1) Test success of retrieving all the contacts
  */
  it("should detect invalid user tokens, retrive text and return 400", async () => {

    const res_signup1 = await request(app)
    .post("/api/auth/signup")
    .send({ email: "john@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
    expect(res_signup1.status).toBe(201);
    const res_signup2 = await request(app)
    .post("/api/auth/signup")
    .send({ email: "mariya@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
    expect(res_signup2.status).toBe(201);
    const res_signup3 = await request(app)
    .post("/api/auth/signup")
    .send({ email: "boosh@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
    expect(res_signup3.status).toBe(201);
    const res_login1 = await request(app)
    .post("/api/auth/login")
    .send({ email: "john@example.com", password: "pass123" });

    expect(res_login1.status).toBe(200);


    // Test a search item with no search item
    const res_getsearch1 = await request(app)
    .post("/api/contacts/search")
    .set("Authorization", `Bearer ${res_login1.body.token}`)
    .send({})

    expect(res_getsearch1.status).toBe(400);
    expect(res_getsearch1.body.message).toBe("Missing searchTerm")
    
    // Test a search item with no search item
    const res_getsearch2 = await request(app)
    .post("/api/contacts/search")
    .send({ searchTerm: "Jana"})

    // expect(res_getsearch2.body.contacts).toBeNull();
    expect(res_getsearch2.status).toBe(400); 
    expect(res_getsearch2.body.message).toBe("Unauthorized: No token provided")
    
    // Test a search item with no search item
    const res_getsearch3 = await request(app)
    .post("/api/contacts/search")
    .set("Authorization", `Bearer ${"Some crap123"}`)
    .send({ searchTerm: "Jana"})

    // expect(res_getsearch2.body.contacts).toBeNull();
    expect(res_getsearch3.status).toBe(400); 
    expect(res_getsearch3.body.message).toBe("Forbidden: Invalid token")
  })
})


/**
 * This describe block groups tests for the signup endpoint: POST /api/auth/signup
 */
describe("POST /api/contacts/all-contacts", () => {
  /**
   * Before any of our tests run, we connect Mongoose to the ephemeral MongoDB
   * instance provided by process.env.MONGO_URL. The connectDB function is
   * defined in `app.js`, so we just call it here.
   */
  beforeAll(async () => {
    await connectDB();
  });

  /**
   * After all tests complete, we disconnect from MongoDB to free resources
   * and ensure no open handles remain (important in Jest).
   */
  afterAll(async () => {
    await mongoose.disconnect();
  });

  /**
   * We clear out all users between tests so each test starts with a fresh DB.
   * This helps prevent one test's data from affecting another.
   */
  afterEach(async () => {
    await User.deleteMany({});
    
  });

    /*
    *   1) Test success of retrieving all the contacts
    */
    it("should get the list of all contacts and return 200", async () => {
      
      const res_signup1 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "john@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup1.status).toBe(201);
      const res_signup2 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "mariya@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup2.status).toBe(201);
      const res_signup3 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "boosh@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup3.status).toBe(201);

      const res_login1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "pass123" });
      expect(res_login1.status).toBe(200);

      // Test a search item with no search item
      const res_getall1 = await request(app)
      .get("/api/contacts/all-contacts")
      .set("Authorization", `Bearer ${res_login1.body.token}`)
      .send({})

      expect(res_getall1.body.message).toBe("OK")
      expect(res_getall1.status).toBe(200); 
      expect(res_getall1.body.contacts.length).toBe(3);

      const res_signup4 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "someotherguy@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup4.status).toBe(201);

      // Test a search item with no search item
      const res_getall2 = await request(app)
      .get("/api/contacts/all-contacts")
      .set("Authorization", `Bearer ${res_login1.body.token}`)
      .send({})

      expect(res_getall2.body.message).toBe("OK")
      expect(res_getall2.status).toBe(200); 
      expect(res_getall2.body.contacts.length).toBe(4);
    })

    /*
    *   2) Test faliure of retrieving the contracts
    */
     it("should fail and return 400", async () => {

      const res_signup1 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "john@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup1.status).toBe(201);
      const res_signup2 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "mariya@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup2.status).toBe(201);
      const res_signup3 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "boosh@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      expect(res_signup3.status).toBe(201);

      const res_login1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "pass123" });
      expect(res_login1.status).toBe(200);

      // Test a search item with no search item
      const res_getall1 = await request(app)
      .get("/api/contacts/all-contacts")
      .set("Authorization", `Bearer ${"Some Crap"}`)
      .send({})

      expect(res_getall1.body.message).toBe("Forbidden: Invalid token")
      expect(res_getall1.status).toBe(400); 

      // Test a search item with no search item
      const res_getall2 = await request(app)
      .get("/api/contacts/all-contacts")
      .send({})

      expect(res_getall2.body.message).toBe("Unauthorized: No token provided")
      expect(res_getall2.status).toBe(400); 
     })
})
