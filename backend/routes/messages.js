const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * GET /api/messages/:contactId
 * Fetch all messages between the current user and the user with :contactId
 */
router.get("/:contactId", async (req, res) => {
    console.log("Get /api/message/:contactID hit with:", req.params.contactID);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden: Invalid token" });

      // currentUserId is from { userId: user._id }
      const currentUserId = decoded.userId;
      const contactId = req.params.contactId;

      // Find messages where (sender = currentUserId AND receiver = contactId)
      // OR (sender = contactId AND receiver = currentUserId)
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: contactId },
          { sender: contactId, receiver: currentUserId },
        ],
      }).sort({ createdAt: 1 }); // Oldest first

      res.status(200).json({ messages });
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
