import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "served", "confirmed", "shipped", "delivered", "cancelled"),
    defaultValue: "pending",
  },
  paymentMethod: { type: DataTypes.STRING, defaultValue: "mobile_money" },
  deliveryAddress: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

User.hasMany(Order, { foreignKey: "buyerId", as: "orders" });
Order.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

export default Order;