const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Lead = require("../Models/Lead");

const JWT_SECRET = "harshi";

// Middleware for authentication
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

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

// Create lead
router.post("/leads", authMiddleware, async (req, res) => {
  const { name, email, number, product } = req.body;

  try {
    const newLead = new Lead({ name, email, number, product });
    await newLead.save();
    res
      .status(201)
      .json({ message: "Lead created successfully.", lead: newLead });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Lead creation failed.", details: err.message });
  }
});

// Get all leads with search and sort functionality
router.get("/leads", authMiddleware, async (req, res) => {
  const { search, sort } = req.query;
  const searchQuery = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { number: { $regex: search, $options: "i" } },
          { product: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const sortQuery = sort
    ? {
        [sort]: 1,
      }
    : {};

  try {
    const leads = await Lead.find(searchQuery).sort(sortQuery);
    res.json(leads);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch leads.", details: err.message });
  }
});

// Update lead
router.put("/leads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, number, product } = req.body;

  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { name, email, number, product },
      { new: true }
    );
    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json({ message: "Lead updated successfully.", lead: updatedLead });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to update lead.", details: err.message });
  }
});

// Delete lead
router.delete("/leads/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLead = await Lead.findByIdAndDelete(id);
    if (!deletedLead) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json({ message: "Lead deleted successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to delete lead.", details: err.message });
  }
});

module.exports = router;
