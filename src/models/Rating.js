import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import Product from "./Product.js";

const Rating = sequelize.define("Rating", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
});

User.hasMany(Rating, { foreignKey: "buyerId", as: "givenRatings" });
Rating.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });

User.hasMany(Rating, { foreignKey: "sellerId", as: "receivedRatings" });
Rating.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

export default Rating;