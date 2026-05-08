import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unit: { type: DataTypes.STRING, defaultValue: "kg" },
  category: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

export default Product;
