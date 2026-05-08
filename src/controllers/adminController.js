import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: "seller" } });
    const totalProducts = await Product.count();
    const pendingOrders = await Order.count({ where: { status: "pending" } });

    ApiResponse.success(res, "Dashboard stats", {
      totalUsers,
      totalSellers,
      totalProducts,
      pendingOrders
    });
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const verifySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return ApiResponse.error(res, "User not found", 404);

    await user.update({ isVerified: true });
    ApiResponse.success(res, "Seller verified successfully");
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return ApiResponse.error(res, "Product not found", 404);

    await product.destroy();
    ApiResponse.success(res, "Product deleted successfully");
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};