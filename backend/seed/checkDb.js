import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

(async () => {
  try {
    await connectDB(MONGO_URI);
    const [pCount, cCount, uCount, oCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
    ]);

    console.log(JSON.stringify({ products: pCount, categories: cCount, users: uCount, orders: oCount }));
    const firstProduct = await Product.findOne().lean();
    if (firstProduct) console.log('firstProduct:', firstProduct.title || firstProduct.name || firstProduct.slug || firstProduct._id);
    const firstUser = await User.findOne().lean();
    if (firstUser) console.log('firstUser:', firstUser.email || firstUser.name || firstUser._id);
    process.exit(0);
  } catch (err) {
    console.error('checkDb error', err.message);
    process.exit(2);
  }
})();
