import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const [pCount, cCount, uCount, oCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
    ]);
    const firstProduct = await Product.findOne().lean();
    const firstUser = await User.findOne().lean();
    res.json({ ok: true, counts: { products: pCount, categories: cCount, users: uCount, orders: oCount }, sample: { product: firstProduct?._id, user: firstUser?.email } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
