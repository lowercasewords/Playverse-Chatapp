import request from "supertest";
import mongoose from "mongoose";
import expect from "expect";
import { io } from "socket.io-client";
import { server, app } from "../index";  // Ensure server and app are exported properly

jest.setTimeout(30000); // Set the timeout to 30 seconds (adjust as needed)

const { HOST, PORT } = require("../index"); // Read from environment variables


let client1, client2;

beforeAll((done) => {
    // Start the server for the test environment
    server.listen(PORT, HOST, () => {
        console.log(`Test server running on ${HOST}:${PORT}`);
        done();
    });
});

afterAll((done) => {
    // Cleanup after all tests
    server.close(() => {
        console.log("Test server closed.");
        done();
    });
});

describe("Live Messaging Service", () => {
    beforeEach((done) => {
        console.log("Connecting WebSocket clients...");
    
        client1 = io(`http://${HOST}:${PORT}`, { transports: ["websocket"], forceNew: true });
        client2 = io(`http://${HOST}:${PORT}`, { transports: ["websocket"], forceNew: true });
    
        let connectedClients = 0;
    
        const checkConnected = () => {
            connectedClients += 1;
            console.log(`Connected clients: ${connectedClients}`);
            if (connectedClients === 2) {
                console.log("Both clients connected!");
                done(); // Proceed once both clients are connected
            }
        };
    
        client1.on("connect", checkConnected);
        client2.on("connect", checkConnected);
    
        client1.on("connect_error", (err) => console.error("Client1 connection error:", err));
        client2.on("connect_error", (err) => console.error("Client2 connection error:", err));
    });
    
    
    afterEach(() => {
        // Disconnect both clients after each test
        client1.disconnect();
        client2.disconnect();
    });

    test("should send and receive messages in real-time", (done) => {
        console.log("Starting socket testing");
    
        const message = {
            sender: "user1",
            receiver: "user2",
            content: "Hello from user1!",
        };
    
        // Emit the "userConnected" events first
        client1.emit("userConnected", message.sender);
        client2.emit("userConnected", message.receiver);
    
        // Add some delay to ensure both users are registered before sending the message
        setTimeout(() => {
            console.log("Before sending a message to client 2");
            // Send the message after users are connected
            client1.emit("sendMessage", message);
            console.log("After sending a message");
        }, 500); // Small delay to ensure registration
    
        // Listen for the message on client2
        client2.once("receiveMessage", (receivedMessage) => {
            console.log("Received message:", receivedMessage);
            expect(receivedMessage.sender.id).toBe(message.sender);
            expect(receivedMessage.receiver.id).toBe(message.receiver);
            expect(receivedMessage.content).toBe(message.content);
            done(); // Complete the test
        });
    
        // Log any error on client2 side
        client2.on("error", (err) => {
            console.error("Client2 error:", err);
            done(err);
        });
    });
});
