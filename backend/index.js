const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const contactsRoutes = require("./routes/contacts");
const messagesRoutes = require("./routes/messages");

const Message = require("./models/Message"); 
const User = require("./models/User");
const HOST = 'localhost';
const PORT = process.env.PORT

require("dotenv").config();

// Initialize App
const app = express();
const server = http.createServer(app);


connectDB(); // Connects to the correct database

app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);



// Initialize Socket.IO
const io = new Server(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"],
  },
});

// Store active users and their socket IDs
const users = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user joins, store their userId and socketId
  socket.on("userConnected", (userId) => {
      users.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle sending a direct message
  socket.on("sendMessage", async ({ sender, receiver, content, }) => {
      try {
          //save the name
          const senderUser = await User.findById(sender).select("email firstName lastName");
          const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : sender;

          // Save message to database
          const message = new Message({ sender, receiver, content, senderName, timestamp: new Date() });
          await message.save();

          // Construct message object
          const messageData = {
              id: message._id,
              sender: { id: sender },
              receiver: { id: receiver },
              content,
              timestamp: message.timestamp,
          };

          // Emit the message to the recipient if they are online
          if (users.has(receiver)) {
              io.to(users.get(receiver)).emit("receiveMessage", messageData);
          }

          // Emit the message back to the sender
          io.to(users.get(sender)).emit("receiveMessage", messageData);

      } catch (error) {
          console.error("Error sending message:", error);
      }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      for (const [userId, socketId] of users.entries()) {
          if (socketId === socket.id) {
              users.delete(userId);
              break;
          }
      }
  });
});


// Start Server
if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT;
    server.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}/`));
  }



// Exportst the express application
module.exports = { app, server, HOST, PORT };