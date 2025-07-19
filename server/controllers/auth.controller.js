const bcrypt = require("bcrypt");
const User = require("../models/users");
const dotenv = require("dotenv");
dotenv.config();
const admin_key = process.env.ADMIN_KEY;
async function signupAdmin(req, res) {
  const { username, password, email, name, phone, adminKey } = req.body;
  if (adminKey !== admin_key) {
    return res.status(403).json({ error: "Invalid admin key" });
  }
  try {
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ error: "Username already exists" });
    const hash = await bcrypt.hash(password, 10);
    const result = new User({
      username,
      password: hash,
      email,
      name,
      phone,
      role: "admin",
    });
    await result.save();
    res.status(201).json({
      message: "Admin created successfully",
      userId: result._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
}

async function loginAdmin(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, role: "admin" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
}

async function signupStudent(req, res) {
  const { username, password, email, name, phone } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists)
      return res.status(409).json({ error: "Username already exists" });
    const hash = await bcrypt.hash(password, 10);
    const result = new User({
      username,
      password: hash,
      email,
      name,
      phone,
      role: "student",
    });
    await result.save();
    res.status(201).json({
      message: "Student created successfully",
      userId: result._id,
    });
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
}

async function loginStudent(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, role: "student" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
}
module.exports = {
  signupAdmin,
  loginAdmin,
  signupStudent,
  loginStudent,
};
