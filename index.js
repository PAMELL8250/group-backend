import 'dotenv/config';
import express from "express";
import cors from "cors";
import sequelize from "./src/config/db.js";

// Import Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

// Import Error Handler
import errorHandler from "./src/middleware/errorHandler.js";

// Import Seeder
import seedAll from "./src/seeders/seedAll.js";   // ← Added

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000","https://agrishopp.onrender.com/"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler (Must be at the end)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected Successfully");

    await sequelize.sync({ alter: true });
    console.log("✅ All Models Synced");

    // Seed only when explicitly enabled (prevents deleting users on every restart)
    if (process.env.SEED_DB === "true") {
      await seedAll();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();