const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config");
const authRoutes = require("./routes/auth");
const HOST = 'localhost';

require("dotenv").config();

// Initialize App
const app = express();
connectDB(); // Connects to the correct database

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth/", authRoutes);

// Start Server
const PORT = process.env.PORT
app.listen(PORT, HOST, () => console.log(`Server running at http://${HOST}:${PORT}/`));

// Exportst the express application
module.exports = app; 