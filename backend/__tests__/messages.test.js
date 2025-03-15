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
// describe("POST /api/contacts/search", () => {
