import express from "express";
import { protect, restrictTo } from "../middleware/auth.js";
import { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  patchProductStock,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);                    // Buyer + Seller + Admin
router.post("/", protect, restrictTo("admin"), createProduct);
router.patch(
  "/:id/stock",
  protect,
  restrictTo("admin", "seller"),
  patchProductStock,
);
router.get("/:id", getProductById);

// Protected Routes — only admin can update full product (e.g. price)
router.put("/:id", protect, restrictTo("admin"), updateProduct);

export default router;