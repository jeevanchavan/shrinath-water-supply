const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const AppError = require("../utils/AppError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const login = async (phone, password) => {
  if (!phone || !password) {
    throw new AppError("Phone and password are required", 400);
  }

  const user = await User.findOne({ phone }).select("+password");
  if (!user) throw new AppError("Invalid phone or password", 401);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new AppError("Invalid phone or password", 401);

  if (!user.isActive) throw new AppError("Account is deactivated", 401);

  const token = signToken(user._id);
  return { token, user };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404);
  return user;
};

module.exports = { login, getMe };
