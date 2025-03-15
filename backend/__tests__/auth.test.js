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
describe("POST /api/auth/signup", () => {
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

  //------------------------------------------------------------
  // Testing the Registration-in feature
  //------------------------------------------------------------


  /**
   * 1) Test the success scenario:
   *    If the request has valid email and password, the endpoint should
   *    create a user and return status 201 with a success message.
   */
  it("should create a user and return 201 if email/password are valid", async () => {
    /**
     * We use supertest to POST to /api/auth/signup on our Express `app`.
     * The `send({...})` method includes the JSON body with email/password.
     */
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "john@example.com", password: "secret123", firstName: "my name", lastName: "last name "});

    // We also expect the response body to have a message with success text
    expect(res.body.message).toBe("User successfully created");
    // We expect a 201 (Created) status code
    expect(res.status).toBe(201);
    

    /**
     * Verify in the database that the user actually got created.
     * We query the User model for the given email and ensure it's not null.
     */
    const userInDb = await User.findOne({ email: "john@example.com" });
    expect(userInDb).not.toBeNull();
  });

  /**
   * 2) Test the scenario where the email is already registered:
   *    In that case, the endpoint should return a 409 (Bad Request)
   *    and a message indicating the email is taken.
   */
  it("should return 409 if email is already registered", async () => {
    // First, manually create a user document in the in-memory DB
    await User.create({ email: "jane@example.com", password: "pass", firstName: "Jane someone 21", lastName: "Jane's last12" });

    // Now, attempt to sign up again with the same email
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "jane@example.com", password: "newpass", firstName: "Jane someone", lastName: "Jane's last" });

    // Expect 400 status code for a duplicate email scenario
    expect(res.status).toBe(409);
    // And check the message for "Email already registered"
    expect(res.body.message).toBe("Email already registered");
  });

  /**
   * 3) Test the scenario where the request is missing an email or a password:
   *    The endpoint should respond with a 400 for either missing field.
   */
  it("should return 400 if data is missing, or the password boundries do not persist", async () => {
    // Missing password
    let res1 = await request(app)
      .post("/api/auth/signup")
      .send({ email: "missingpass@example.com", firstName: "My name", lastName: "my last name" });
    expect(res1.status).toBe(400);

    // Missing email
    let res2 = await request(app)
      .post("/api/auth/signup")
      .send({ password: "newpass" , firstName: "My name", lastName: "my last name" });
    expect(res2.status).toBe(400);
    
    // Missing name
    let res3 = await request(app)
      .post("/api/auth/signup")
      .send({  email: "missingpass@example.com", password: "newpass" , firstName: "My name"});
    expect(res3.status).toBe(400);
    
    // Missing last name
    let res4 = await request(app)
      .post("/api/auth/signup")
      .send({  email: "missingpass@example.com", password: "newpass" , lastName: "my last name"});
    expect(res4.status).toBe(400);

    // Password too small
    let res5 = await request(app)
      .post("/api/auth/signup")
      .send({  email: "missingpass@example.com", password: "n1o]", firstName: "My name", lastName: "my last name"});
    expect(res5.status).toBe(400);
    
    // Password too big
    let res6 = await request(app)
      .post("/api/auth/signup")
      .send({  email: "missingpass@example.com", password: "ij23jrh98pco12k;em,dfl3emfi98epq2fhoidjoq", firstName: "My name", lastName: "my last name"});
    expect(res6.status).toBe(400);
  });
});


/**
 * This describe block groups tests for the login endpoint: POST /api/auth/login
 */
describe("POST /api/auth/login", () => {
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

  //------------------------------------------------------------
  // Testing the Log-in feature
  //------------------------------------------------------------

  /**
   * 1) Test the success scenario:
   *    If the request has valid email and password, and the user exists on the database,
   *    the endpoint should create a user and return status 201 with a success message.
   */
  it("should log=in and return 200 if email/password are valid", async () => {
  
    // await User.create({ email: "jane@example.com", password: "pass123" });
  // First, manually create a user document in the in-memory DB
  const signup_res = await request(app)
    .post("/api/auth/signup")
    .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

  expect(signup_res.status).toBe(201)

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com", password: "pass123" });

  // We also expect the response body to have a message with success text
  expect(res.body.message).toBe("User successfully logged-in");
  // We expect a 200 (Logged in) status code
  expect(res.status).toBe(200);
  
  });


  /**
   * 2) Test the missing data scenario:
   *    If the request has valid email and password, and the user exists on the database,
   *    the endpoint should create a user and return status 201 with a success message.
   */
  it("should log=in and return 200 if email/password are valid", async () => {
  
    // await User.create({ email: "jane@example.com", password: "pass123" });
  // First, manually create a user document in the in-memory DB
  const signup_res = await request(app)
    .post("/api/auth/signup")
    .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

  expect(signup_res.status).toBe(201)
    
  // Missing password
  const res1 = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com"});

  // We also expect the response body to have a message with success text
  expect(res1.body.message).toBe("Missing email or password");
  // We expect a 400 (Created) status code
  expect(res1.status).toBe(400);

  // Missing email
  const res2 = await request(app)
    .post("/api/auth/login")
    .send({ password: "pass123" });

  // We also expect the response body to have a message with success text
  expect(res2.body.message).toBe("Missing email or password");
  // We expect a 400 (Created) status code
  expect(res2.status).toBe(400);

  // Missing everything
  const res3 = await request(app)
  .post("/api/auth/login")
  .send({});

 // We also expect the response body to have a message with success text
 expect(res3.body.message).toBe("Missing email or password");
 // We expect a 400 (Created) status code
 expect(res3.status).toBe(400);
 });


  /**
   * 3) Test the logging-in into nonexisting account
   *    If the request has the email that does not exist in the database,
   *    response should be 404 Not Found
   */
  it("should return 404 if email is not found", async () => {
    const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com", password: "pass123" });

  // We also expect the response body to have a message with not found text
  expect(res.body.message).toBe("No user found with this email");
  // We expect a 404 (not found) status code
  expect(res.status).toBe(404);
  })
});


/**
 * This describe block groups tests for the logut endpoint: POST /api/auth/logout
 */
describe("POST /api/auth/logout", () => {
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

  /**
   * 1) Test the logging out of the account successfully
   */
  it("should log=out and return 200", async () => {
     
    // await User.create({ email: "jane@example.com", password: "pass123" });
    // First, manually create a user document in the in-memory DB
    const signup_res = await request(app)
    .post("/api/auth/signup")
    .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

    expect(signup_res.status).toBe(201)

    const res_login = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com", password: "pass123" });
    
    expect(res_login.status).toBe(200); 
    
    const res_out = await request(app)
    .post("/api/auth/logout")
    .set("Authorization", `Bearer ${res_login.body.token}`)
    .send({ email: "jane@example.com"});

    expect(res_out.body.message).toBe("Logout successful");
    expect(res_out.status).toBe(200);

  })

  /**
   * 1) Test the logging out of the account with nonexisting token
   */
  it("should log=out and return 200", async () => {

   const res1 = await request(app)
   .post("/api/auth/logout")
   .send({ email: "jane@example.com"});

   // We also expect the response body to have a message with success text
   expect(res1.body.message).toBe("Unauthorized: No token provided");
   // We expect a 400 (Created) status code
   expect(res1.status).toBe(401);

 })
})



/**
 * This describe block groups tests for the userinfo endpoint: GET /api/auth/userinfo
 */
describe("GET /api/auth/userinfo", () => {
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

  /**
   * 1) Test if the user data was found by the jwt token
   */
  it("should get-user-data and return 200", async () => {
     // Missing password
    const res1 = await request(app)
    .post("/api/auth/signup")
    .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

    expect(res1.status).toBe(201)

    const res2 = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com", password: "pass123"});

    const res3 = await request(app)
    .get("/api/auth/userinfo")
    .set("Authorization", `Bearer ${res2.body.token}`)
    .send({});

    expect(res3.body.email).toBe("jane@example.com")
    expect(res3.body.firstName).toBe("Jane someone")
    expect(res3.body.lastName).toBe("Jane's last")
    expect(res3.body.email).toBe("jane@example.com");
    expect(res3.status).toBe(200);

  })

  /**
   * 2) Test 404 Not Found – User ID not in token or user doesn’t exist in
the database
   */
  it("return 404 if invalid token or user is not in database", async () => {
  // const res_register = await request(app)
  // .post("/api/auth/signup")
  // .send({email: "this-is-my-email", password: "pass123"});

  // const res_login = await request(app)
  // .post("/api/auth/login")
  // .send({email: "this-is-my-email", password: "pass123"});


    const res1 = await request(app)
    .get("/api/auth/userinfo")
    .set("Authorization", `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"}`)
    .send({});
    
    expect(res1.status).toBe(404);
    expect(res1.body.message).toBe("User not found");

    const res2 = await request(app)
    .get("/api/auth/userinfo")
    .send({});

    expect(res2.status).toBe(404);
    expect(res2.body.message).toBe("Unauthorized: No token provided");

 })
})

 /**
 * This describes the group of tests done for the POST update user /api/auth/update-profile
 */
  describe("POST /api/auth/update-profile", () => {
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

  /**
   * 1) Test if the user data was found bythe 
   */
  it("should update the user information and return 200", async () => {
      // Missing password
      const res_signup = await request(app)
      .post("/api/auth/signup")
      .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
  
      expect(res_signup.status).toBe(201)

      const res_login = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });
      

      const res = await request(app)
      .post("/api/auth/update-profile")
      .set("Authorization", `Bearer ${res_login.body.token}`)
      .send({ firstName: "Jane", lastName: "somelastname"});

      const res_info = await request(app)
      .get("/api/auth/userinfo")
      .set("Authorization", `Bearer ${res_login.body.token}`)
      .send({});

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe("Jane")
      expect(res.body.lastName).toBe("somelastname")
      expect(res.body.message).toBe("User data found");
      
      expect(res_info.status).toBe(200);
      expect(res_info.body.firstName).toBe("Jane")
      expect(res_info.body.lastName).toBe("somelastname")
      expect(res_info.body.message).toBe("User data found");
  })

  /*
   * 2) Test the incorrect or insufficient values put in 
  */
  it("return 400 if didn't put sufficient profile update data ", async () => {

    const res_signup = await request(app)
    .post("/api/auth/signup")
    .send({ email: "jane@example.com", password: "pass123", firstName: "Jane someone", lastName: "Jane's last" });

    expect(res_signup.status).toBe(201)
    
    const res_login = await request(app)
    .post("/api/auth/login")
    .send({ email: "jane@example.com", password: "pass123"});
      
    const res_update1 = await request(app)
    .post("/api/auth/update-profile")
    .set("Authorization", `Bearer ${res_login.body.token}`)
    .send({});

    const res_update2 = await request(app)
    .post("/api/auth/update-profile")
    .send({ firstName: "Jane", lastName: "somelastname"});

    expect(res_update1.body.firstName != "Jane")
    expect(res_update1.body.lastName != "somelastname")
    expect(res_update1.body.message).toBe("Missing required fields");
    expect(res_update1.status).toBe(400);

    expect(res_update2.body.firstName != "Jane")
    expect(res_update2.body.lastName != "somelastname")
    expect(res_update2.body.message).toBe("Unauthorized: No token provided");
    expect(res_update2.status).toBe(400);
  })
})