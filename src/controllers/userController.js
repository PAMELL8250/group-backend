import User from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { 
        exclude: ["password"] 
      },
      order: [["createdAt", "DESC"]]
    });

    ApiResponse.success(res, "All users fetched successfully", users);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    if (!user) return ApiResponse.error(res, "User not found", 404);
    ApiResponse.success(res, "Profile fetched", user);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, farmName, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return ApiResponse.error(res, "User not found", 404);

    await user.update({ name, phone, location, farmName, avatar });
    ApiResponse.success(res, "Profile updated successfully", user);
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};