const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "yourjwtsecretkey";

// POST /register
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, roles } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "Please provide firstName, lastName, email, and password.",
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    user = new User({
      firstName,
      lastName,
      email,
      password,
      roles: roles || ["customer"], // Defaults to ['customer'] if not provided
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      roles: user.roles,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  res.cookie("jwt_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
