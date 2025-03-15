// Tests the Authentication API of the chat-app

import request from "supertest"; // Supertest allows us to simulate HTTP requests

import mongoose from "mongoose";
import expect from "expect";

// const app = require("../index");

// const { User } = require("../routes/auth.js");
const User = require("../models/User");
const { connectDB } = require('../config'); // Adjust the path if necessary

/**
 * We rely on @shelf/jest-mongodb to supply process.env.MONGO_URL,
 * which points to an in-memory MongoDB instance for testing.
 *
 * jest.config.cjs references @shelf/jest-mongodb as a preset,
 */

const { io } = require("socket.io-client");
const { server } = require("../index");

const TEST_PORT = 4001;

let client1, client2;

// beforeAll((done) => {
//     // await connectDB();
// });

// afterAll((done) => {
//     server.close();
//     done();
// });

describe("Live Messaging Service", () => {
    beforeEach((done) => {
        client1 = io(`http://localhost:${TEST_PORT}`);
        client2 = io(`http://localhost:${TEST_PORT}`);

        let connectedClients = 0;
        const checkConnected = () => {
            connectedClients += 1;
            if (connectedClients === 2) done();
        };

        client1.on("connect", checkConnected);
        client2.on("connect", checkConnected);
    }, 100000); // 100 second timeout

    afterEach(() => {
        client1.disconnect();
        client2.disconnect();
    });

    test("should send and receive messages in real-time", (done) => {
        const message = {
            sender: "user1",
            recipient: "user2",
            content: "Hello from user1!",
        };

        client2.on("receiveMessage", (receivedMessage) => {
            expect(receivedMessage.sender).toBe(message.sender);
            expect(receivedMessage.recipient).toBe(message.recipient);
            expect(receivedMessage.content).toBe(message.content);
            done();
        });

        client1.emit("sendMessage", message);
    });
});



afterAll((done) => {
    server.close(() => {
        console.log("Test server closed.");
        done();
    });
  });