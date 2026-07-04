import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res) => {
  const { name, email, password, role: requestedRole } = req.body;
  const normalizedEmail = normalizeEmail(email);
  console.log('AUTH register payload:', { name, email: normalizedEmail, role: requestedRole });
  try {
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const role = requestedRole === "admin" ? "admin" : "user";
    const user = await User.create({ name, email: normalizedEmail, password: hashed, role });
    const token = signToken(user);
    const { password: _pw, ...safe } = user.toObject();
    res.json({ data: safe, token, success: true });
  } catch (err) {
    console.error('AUTH register error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  console.log('AUTH login payload:', { email: normalizedEmail });
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
    const token = signToken(user);
    const { password: _pw, ...safe } = user.toObject();
    res.json({ data: safe, token, success: true });
  } catch (err) {
    console.error('AUTH login error:', err);
    res.status(500).json({ message: err.message });
  }
};
