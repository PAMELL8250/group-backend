import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { getDashboardStats, verifySeller, deleteProduct } from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, restrictTo("admin"), getDashboardStats);
router.put("/verify-seller/:id", protect, restrictTo("admin"), verifySeller);
router.delete("/products/:id", protect, restrictTo("admin"), deleteProduct);

export default router;