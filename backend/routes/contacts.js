const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message"); // Assuming you have a Message model


const jwt = require("jsonwebtoken");

// router.use(authMiddleware);  // Apply authentication middleware globally

router.post("/search", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(400).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1]; // "Bearer <token>"
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(400).json({ message: "Forbidden: Invalid token" });

            req.user = decoded; // Attach user data to request

            const { searchTerm } = req.body;
            if (!searchTerm) {
                return res.status(400).json({ message: "Missing searchTerm" });
            }
            const contacts = await User.find({
                $or: [
                    { email: { $regex: searchTerm, $options: "i" } },
                    { firstName: { $regex: searchTerm, $options: "i" } },
                    { lastName: { $regex: searchTerm, $options: "i" } }
                ]
            }).select("email firstName lastName _id");
            return res.status(200).json({ contacts, message: "OK" });
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/all-contacts", async (req, res) => {
    try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(400).json({ message: "Unauthorized: No token provided" });
    
            const token = authHeader.split(" ")[1]; // "Bearer <token>"
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) return res.status(400).json({ message: "Forbidden: Invalid token" });
    
                req.user = decoded; // Attach user data to request
    
            const contacts = await User.find().select("email firstName lastName _id");
            res.status(200).json({ contacts, message: "OK" });
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/get-contacts-for-list", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(400).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1]; // "Bearer <token>"
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) return res.status(400).json({ message: "Forbidden: Invalid token" });
    
                req.user = decoded; // Attach user data to request
    
            const userId = req.user.id;

            // Find all users the current user has messaged with
            const contacts = await User.find({ _id: { $ne: userId } }).select("email firstName lastName _id");

            // Fetch the last message timestamp for each contact
            const contactsWithLastMessage = await Promise.all(
                contacts.map(async (contact) => {
                    const lastMessage = await Message.findOne({
                        $or: [
                            { sender: userId, receiver: contact._id },
                            { sender: contact._id, receiver: userId },
                        ],
                    })
                    .sort({ timestamp: -1 }) // Sort messages by timestamp, descending
                    .select("timestamp");

                    return {
                        ...contact.toObject(),
                        lastMessageTimestamp: lastMessage ? lastMessage.timestamp : null,
                    };
                })
            );

            // Sort contacts by the last message timestamp (newest first)
            contactsWithLastMessage.sort((a, b) => {
                if (!a.lastMessageTimestamp) return 1; // If no message, send to bottom
                if (!b.lastMessageTimestamp) return -1;
                return b.lastMessageTimestamp - a.lastMessageTimestamp; // Descending order
            });

            res.status(200).json({ contacts: contactsWithLastMessage });
        })
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.delete("/delete-dm/:dmId", authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(400).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1]; // "Bearer <token>"
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) return res.status(400).json({ message: "Forbidden: Invalid token" });
    
                req.user = decoded; // Attach user data to request
    
            const userId = req.user.id;

            const { dmId } = req.params;
            if (!dmId) {
                return res.status(400).json({ message: "Missing or invalid dmId" });
            }

            // Delete messages where both users are involved
            await Message.deleteMany({
                $or: [
                    { sender: req.user.userId, receiver: dmId },
                    { sender: dmId, receiver: req.user.userId }
                ]
            });

            res.status(200).json({ message: "DM deleted successfully" });
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;