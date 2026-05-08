import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, (req, res) =>
  ApiResponse.success(res, "User", { user: req.user }),
);

export default router;