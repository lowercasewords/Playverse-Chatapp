const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const password_length_max = 20
const password_length_min = 6

const saltRounds = 10; // How much salt to use for hashing

// Secret key for JWT (store in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 3.1 Signup
router.post("/signup", async (req, res) => {
    
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) 
    {
        return res.status(400).json({ message: "Missing email, password, first or lastnames" });
    }

    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: "Email already registered" });

        if(password.length < password_length_min) {
            res.status(400).json({ message: "Password required at least " + password_length_min + " characters" });
        }
        if(password.length > password_length_max) {
            res.status(400).json({ message: "Password required to be at most " + password_length_max + " characters" });
        }

        // During user registration, hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ email, password: hashedPassword, firstName, lastName, color: null });
        await newUser.save();

        res.status(201).json({ message: "User successfully created" });
    } catch (error) {
        if (!res.headersSent) {  // Check if headers have been sent before responding again
            res.status(500).json({ message: "Internal Server Error" });
        } 
    }
});

// 3.2 Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found with this email" });

        // Compare hashed passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        
        res.status(200).json({ message: "User successfully logged-in", token: token });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/*
// 3.3 Logout
router.post("/logout", (req, res) => {
    console.log("logout");
    if (req.session) {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: "Logout failed" });
            res.status(200).json({ message: "Logout successful" });
        });
    } else {
        res.status(200).json({ message: "No active session" });
    }
});
*/

// 3.3 Logout
router.post("/logout", (req, res) => {

    // Check for token in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
 
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
     
     // Optional: You can implement token blacklisting here if desired
     // (This step is not mandatory for most cases)
     
     // Log out simply by instructing the client to delete the token client-side
     res.status(200).json({ message: "Logout successful" });
});

/*
// 3.4 Get User Info
router.get("/userinfo", async (req, res) => {
    console.log("userinfo")
    try {
        const user = await User.findOne(); // Placeholder for actual authentication logic
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
*/

// 3.4 Get User Info
router.get("/userinfo", async (req, res) => {
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(404).json({ message: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>" format
        
        if (!token) return res.status(404).json({ message: 'Unauthorized: Invalid token format' });
        
        
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(404).json({ message: "User not found" });
            
            const user = await User.findById(decoded.userId).select("-password"); // Attach user to request
            if (!user) return res.status(404).json({ message: "User not found" });

            // next();

            // if (!user) return res.status(404).json({ message: "User not found" });

            // Respond with user data (excluding sensitive information)
            res.status(200).json({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                color: user.color,
                message: "User data found"
            });
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
/*
  const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Get the token from the Authorization header
    
    if (!token) {
      return res.status(403).json({ message: "Access denied, no token provided." });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);  // Verify and decode the JWT
      req.user = decoded;  // Attach the user data (e.g., userId) to the request object
      next();  // Call the next middleware
    } catch (error) {
      return res.status(400).json({ message: "Invalid token." });
    }
  };
  */

// 3.5 Update Profile
router.post("/update-profile", async (req, res) => {
    const {firstName, lastName, color } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: "Missing required fields" });

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(400).json({ message: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1]; // Assuming "Bearer <token>" format
        
        if (!token) return res.status(400).json({ message: 'Unauthorized: Invalid token format' });
        
        
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(400).json({ message: "User not found" });
            
            const user = await User.findById(decoded.userId).select("-password"); // Attach user to request
            if (!user) return res.status(400).json({ message: "User not found" });
            

            user.firstName = firstName;
            user.lastName = lastName;
            if (color) user.color = color;
            await user.save();

            
            // Respond with user data (excluding sensitive information)
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                message: "User data found"
            });
        })

        
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;