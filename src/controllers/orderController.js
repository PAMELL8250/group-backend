import { Op } from "sequelize";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const ALLOWED_FULFILLMENT_STATUSES = new Set(["served", "cancelled"]);

const sellerOrderInclude = [
  {
    model: User,
    as: "buyer",
    attributes: ["id", "name", "email", "phone", "location"],
  },
  { model: OrderItem, include: [{ model: Product }] },
];

export const createOrder = async (req, res) => {
  try {
    if (String(req.user.role).toLowerCase() !== "buyer") {
      return ApiResponse.error(res, "Only buyers can place orders", 403);
    }
    const { items, deliveryAddress, paymentMethod } = req.body;
    let totalAmount = 0;

    const order = await Order.create({
      buyerId: req.user.id,
      totalAmount: 0,
      deliveryAddress,
      paymentMethod,
      status: "pending"
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      totalAmount += product.price * item.quantity;

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });

      // Reduce stock
      await product.update({ quantity: product.quantity - item.quantity });
    }

    await order.update({ totalAmount });

    ApiResponse.success(res, "Order placed successfully", order, 201);
  } catch (error) {
    ApiResponse.error(res, error.message, 400);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [
        { model: User, as: "buyer", attributes: ["id", "name", "email", "phone"] },
        { model: OrderItem, include: [Product] },
      ],
    });
    ApiResponse.success(res, "Orders fetched", orders);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "email", "phone", "location"],
        },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });
    ApiResponse.success(res, "All orders", orders);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getOrderByIdStaff = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "buyer",
          attributes: { exclude: ["password"] },
        },
        { model: OrderItem, include: [{ model: Product }] },
      ],
    });
    if (!order) return ApiResponse.error(res, "Order not found", 404);

    const role = String(req.user.role).toLowerCase();
    if (role === "admin" || role === "seller") {
      return ApiResponse.success(res, "Order", order);
    }
    return ApiResponse.error(res, "Forbidden", 403);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
      include: sellerOrderInclude,
    });
    ApiResponse.success(res, "Seller orders to serve", orders);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getSellerServedOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: { [Op.in]: ["served", "confirmed"] } },
      order: [["updatedAt", "DESC"]],
      include: sellerOrderInclude,
    });
    ApiResponse.success(res, "Seller served orders", orders);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALLOWED_FULFILLMENT_STATUSES.has(status)) {
      return ApiResponse.error(res, "Invalid status. Use: served or cancelled", 400);
    }

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, include: [{ model: Product }] }],
    });

    if (!order) return ApiResponse.error(res, "Order not found", 404);

    const items = order.OrderItems || [];
    if (items.length === 0) return ApiResponse.error(res, "Order has no items", 400);

    const role = String(req.user.role).toLowerCase();
    if (role !== "admin" && role !== "seller") {
      return ApiResponse.error(res, "Forbidden", 403);
    }

    if (order.status !== "pending") {
      return ApiResponse.error(res, `Order already ${order.status}`, 400);
    }

    await order.update({ status });
    return ApiResponse.success(res, "Order status updated", order);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const deleteMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return ApiResponse.error(res, "Order not found", 404);

    if (order.buyerId !== req.user.id) {
      return ApiResponse.error(res, "You don't have permission to delete this order", 403);
    }

    // Only allow deletion when it's not already processed
    if (order.status !== "pending" && order.status !== "cancelled") {
      return ApiResponse.error(res, `Cannot delete an order that is ${order.status}`, 400);
    }

    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();

    ApiResponse.success(res, "Order deleted successfully");
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};