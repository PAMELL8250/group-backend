import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("buyer", "seller", "admin", "delivery"),
    defaultValue: "buyer",
  },
  location: { type: DataTypes.STRING },
  farmName: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

export default User;