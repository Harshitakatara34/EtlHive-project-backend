const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const JWT_SECRET = "harshi";

// Signup route
// Signup route
router.post("/signup", async (req, res) => {
  const { name, username, password } = req.body;

  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ error: "Password does not meet the requirements." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.error(err); // Log the actual error
    res
      .status(500)
      .json({ error: "User creation failed.", details: err.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
