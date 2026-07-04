import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ data: users, success: true });
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ data: user, success: true });
};
