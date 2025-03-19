const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message"); 


const jwt = require("jsonwebtoken");

//Taka code
// NEW ROUTE: GET /api/contacts/ - Get current user's contacts (populated)

router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) 
      return res.status(400).json({ message: "Unauthorized: No token provided" });

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) 
        return res.status(400).json({ message: "Forbidden: Invalid token" });

      req.user = decoded; // Attach user data to request

      const currentUserId = req.user.userId; 
      
      // Find the current user and populate the contacts field
      const currentUser = await User.findById(currentUserId).populate("contacts", "email firstName lastName _id");
      if (!currentUser) {
        return res.status(404).json({ message: "Current user not found" });
      }
      
      const onlineUsers = req.app.locals.onlineUsers || new Map();
      const contactsWithStatus = currentUser.contacts.map(contact => {
        const isOnline = onlineUsers.has(contact._id.toString());
        return { ...contact.toObject(), isOnline };
      });
      
      res.status(200).json({ contacts: contactsWithStatus, message: "OK" });
    });
  } catch (error) {
    console.error("Error fetching current user's contacts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//end taka code 


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

//this is taka code 
// POST /api/contacts - Add a contact by email
// POST /api/contacts - Add a contact by email and persist the contact relationship
router.post("/", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(400).json({ message: "Unauthorized: No token provided" });
  
      // Extract token from header ("Bearer <token>")
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err)
          return res.status(400).json({ message: "Forbidden: Invalid token" });
        
        req.user = decoded; // Attach user data to request
        const currentUserId = req.user.userId; // Save current user's ID
        
        // Expect the request body to contain an email
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Missing email in request body" });
        }
  
        // Look up the user by email that will be added as a contact
        const contactUser = await User.findOne({ email });
        if (!contactUser) {
          return res.status(404).json({ message: "No user found with that email" });
        }
  
        // Retrieve the current user's document and add the contact if not already added
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
          return res.status(404).json({ message: "Current user not found" });
        }
  
        // Check if the contact is already in the user's contacts array
        if (!currentUser.contacts.includes(contactUser._id)) {
          currentUser.contacts.push(contactUser._id);
          await currentUser.save();
        }
  
        // Return the added contact
        return res.status(201).json({ message: "Contact added", contact: contactUser });
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
//end of taka code 
router.delete("/delete-dm/:dmId", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(400).json({ message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1]; // "Bearer <token>"
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(400).json({ message: "Forbidden: Invalid token" });

            req.user = decoded; // Attach user data to request

            const userId = req.user.id; // Make sure this is the right property
            const { dmId } = req.params;

            if (!dmId) {
                return res.status(400).json({ message: "Missing or invalid dmId" });
            
            }
            console.log("Id is + " + dmId)

            // Delete messages where both users are involved
            await Message.deleteMany({
                $or: [
                    { sender: userId, receiver: dmId },
                    { sender: dmId, receiver: userId }
                ]
            });

            res.status(200).json({ message: "DM deleted successfully" });
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;