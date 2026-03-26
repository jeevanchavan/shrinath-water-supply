const jwt           = require("jsonwebtoken");
const User          = require("../models/User");
const AppError      = require("../utils/AppError");

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 401));
    }

    const token   = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password").lean();

    if (!user) return next(new AppError("User no longer exists", 401));
    if (!user.isActive) return next(new AppError("Account deactivated", 401));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Not authorized for this action", 403));
  }
  next();
};

module.exports = { protect, authorize };
