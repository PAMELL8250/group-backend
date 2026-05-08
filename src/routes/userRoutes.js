import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { 
  getAllUsers,
  getUserProfile, 
  updateProfile 
} from "../controllers/userController.js";

const router = express.Router();

// Public Protected Routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);

// Admin Only - Get All Users
router.get("/", protect, restrictTo("admin"), getAllUsers);

export default router;