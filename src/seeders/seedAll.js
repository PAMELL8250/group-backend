import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Rating from "../models/Rating.js";

const seedAll = async () => {
  try {
    console.log("🌱 Starting full database seeding...");

    // === Clear existing data (Only for development) ===
    await Rating.destroy({ where: {} });
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log("🗑️  Old data cleared");

    // ==================== USERS ====================
    const users = await User.bulkCreate([
      
      {
        name: "serge rwanda",
        email: "serge@agrimarket.rw",
        phone: "0788888833",
        password: await bcrypt.hash("123456", 10),
        role: "seller",
        location: "Kigali",
        isVerified: true,
      },
      {
        name: "Admin Rwanda",
        email: "admin@agrimarket.rw",
        phone: "0788888888",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        location: "Kigali",
        isVerified: true,
      },
      {
        name: "Jean Mukamana",
        email: "jean.farmer@gmail.com",
        phone: "0791122334",
        password: await bcrypt.hash("123456", 10),
        role: "seller",
        farmName: "Mukamana Farm",
        location: "Musanze",
        isVerified: true,
      },
      {
        name: "Aline Uwera",
        email: "aline.buyer@gmail.com",
        phone: "0723344556",
        password: await bcrypt.hash("123456", 10),
        role: "buyer",
        location: "Kigali",
      },
    ], { validate: true });

    console.log(`✅ ${users.length} Users seeded`);

    // users[3] = buyer (aline)
    const buyer = users[3];

    // ==================== PRODUCTS ====================
    const products = await Product.bulkCreate([
      {
        name: "Irish Potatoes",
        description: "Fresh Irish potatoes from Musanze highlands",
        price: 1200,
        quantity: 450,
        unit: "kg",
        category: "vegetables",
        location: "Musanze",
        isAvailable: true,
      },
      {
        name: "Red Beans",
        description: "Premium quality red beans",
        price: 1800,
        quantity: 320,
        unit: "kg",
        category: "legumes",
        location: "Musanze",
        isAvailable: true,
      },
      {
        name: "Fresh Tomatoes",
        description: "Ripe red tomatoes",
        price: 850,
        quantity: 180,
        unit: "kg",
        category: "vegetables",
        location: "Kigali",
        isAvailable: true,
      },
    ]);

    console.log(`✅ ${products.length} Products seeded`);

    // Demo pending order (fulfillment via admin until product–seller table exists)
    const demoProduct = products[1];
    const demoQty = 2;
    const demoTotal = demoProduct.price * demoQty;
    const demoOrder = await Order.create({
      buyerId: buyer.id,
      totalAmount: demoTotal,
      deliveryAddress: buyer.location,
      paymentMethod: "mobile_money",
      status: "pending",
    });
    await OrderItem.create({
      orderId: demoOrder.id,
      productId: demoProduct.id,
      quantity: demoQty,
      priceAtPurchase: demoProduct.price,
    });
    await demoProduct.update({ quantity: demoProduct.quantity - demoQty });

    console.log(`✅ Demo order #${demoOrder.id} seeded (admin can confirm)`);

    console.log("\n🎉 Seeding completed successfully! ✅");
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    if (error.errors) {
      console.error("Details:", error.errors.map(err => err.message));
    }
  }
};

export default seedAll;