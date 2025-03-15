const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message"); // Assuming you have a Message model


const jwt = require("jsonwebtoken");


router.post("/get-messages", async (req, res) => {
})