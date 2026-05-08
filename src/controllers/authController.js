import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const publicUserFields = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  location: row.location,
  farmName: row.farmName,
  isVerified: row.isVerified,
});

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, phone, password: hashedPassword, role: role || "buyer"
    });

    ApiResponse.success(res, "User registered successfully", { user: publicUserFields(user) }, 201);
  } catch (error) {
    ApiResponse.error(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return ApiResponse.error(res, "Invalid credentials", 401);
    }

    const token = generateToken(user);
    ApiResponse.success(res, "Login successful", { user: publicUserFields(user), token });
  } catch (error) {
    ApiResponse.error(res, error.message);
  }
};