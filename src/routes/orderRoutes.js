import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getSellerServedOrders,
  getAllOrdersAdmin,
  getOrderByIdStaff,
  updateOrderStatus,
  deleteMyOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

router.get("/seller-orders/served", protect, restrictTo("seller"), getSellerServedOrders);
router.get("/seller-orders", protect, restrictTo("seller"), getSellerOrders);
router.get("/admin/all", protect, restrictTo("admin"), getAllOrdersAdmin);

router.delete("/:id", protect, restrictTo("buyer"), deleteMyOrder);
router.put("/:id/status", protect, restrictTo("seller", "admin"), updateOrderStatus);

// Detail for seller/admin — register after static paths like /my-orders
router.get("/:id", protect, restrictTo("seller", "admin"), getOrderByIdStaff);

export default router;
