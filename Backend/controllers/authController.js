const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating userId

// ✅ Signup Function (Already Exists)
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, dob, email, phoneNumber, country, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists!" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with auto-generated UUID
    const newUser = new User({
      userId: uuidv4(), // Generate unique userId
      firstName,
      lastName,
      dob,
      email,
      phoneNumber,
      country,
      password: hashedPassword,
      photo: req.file ? req.file.path : "", // If a profile photo is uploaded
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      msg: "Signup successful! Please log in.",
      userId: newUser.userId, // Return userId in response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error!" });
  }
};

// ✅ Login Function (NEW)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "admin@123" && password === "admin") {
      return res.json({ msg: "Admin login successful!", isAdmin: true });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        // Add explicit expiration
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Current time + 24 hours in seconds
      },
      process.env.JWT_SECRET || "your_secret_key" // Use standard naming
    );

    console.log("✅ Sending userId:", user.userId); // Debugging

    res.json({
      msg: "Login successful!",
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        photo: user.photo,
        
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Server error!" });
  }
};
