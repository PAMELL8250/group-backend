import Product from "../models/Product.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const CREATE_FIELDS = [
  "name",
  "description",
  "price",
  "quantity",
  "unit",
  "category",
  "image",
  "location",
  "isAvailable",
];

const UPDATE_FIELDS = [
  "name",
  "description",
  "price",
  "quantity",
  "unit",
  "category",
  "image",
  "location",
  "isAvailable",
];

export const createProduct = async (req, res) => {
  try {
    const payload = {};
    for (const key of CREATE_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    if (!payload.name || payload.price === undefined || payload.quantity === undefined) {
      return ApiResponse.error(res, "name, price, and quantity are required", 400);
    }

    const product = await Product.create(payload);
    ApiResponse.success(res, "Product created successfully", product, 201);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    ApiResponse.success(res, "Products fetched successfully", products);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return ApiResponse.error(res, "Product not found", 404);
    ApiResponse.success(res, "Product found", product);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return ApiResponse.error(res, "Product not found", 404);

    const patch = {};
    for (const key of UPDATE_FIELDS) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    if (Object.keys(patch).length === 0) {
      return ApiResponse.error(res, "No updatable fields provided", 400);
    }

    await product.update(patch);
    ApiResponse.success(res, "Product updated successfully", product);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

/** Set stock to an absolute value or add a delta (restock). Admin and seller only. */
export const patchProductStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return ApiResponse.error(res, "Product not found", 404);

    const { quantity, add } = req.body ?? {};
    const hasQuantity =
      quantity !== undefined && quantity !== null && quantity !== "";
    const hasAdd = add !== undefined && add !== null && add !== "";

    if (hasQuantity && hasAdd) {
      return ApiResponse.error(res, "Send either quantity or add, not both", 400);
    }
    if (!hasQuantity && !hasAdd) {
      return ApiResponse.error(
        res,
        "Provide quantity (set stock level) or add (units to add or remove)",
        400,
      );
    }

    const current = Math.max(0, Math.floor(Number(product.quantity)) || 0);
    let nextQty;

    if (hasQuantity) {
      const q = Number(quantity);
      if (!Number.isFinite(q) || q < 0) {
        return ApiResponse.error(res, "quantity must be a non-negative number", 400);
      }
      nextQty = Math.floor(q);
    } else {
      const a = Number(add);
      if (!Number.isFinite(a)) {
        return ApiResponse.error(res, "add must be a number", 400);
      }
      nextQty = Math.max(0, current + Math.trunc(a));
    }

    await product.update({ quantity: nextQty });
    await product.reload();
    ApiResponse.success(res, "Stock updated", product);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};
