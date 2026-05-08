import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.js";

// Protect route - Check if user is logged in
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ApiResponse.error(res, "Not authorized. No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ["password"] } });
    if (!user) {
      return ApiResponse.error(res, "User not found. Please login again.", 401);
    }
    // Always trust DB role over token role
    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid or expired token", 401);
  }
};

// Restrict to specific roles (seller, admin, etc.)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = String(req.user.role || "").toLowerCase();
    const allowed = roles.some((r) => String(r).toLowerCase() === userRole);
    if (!allowed) {
      return ApiResponse.error(res, `Only ${roles.join(", ")} can access this route`, 403);
    }
    next();
  };
};