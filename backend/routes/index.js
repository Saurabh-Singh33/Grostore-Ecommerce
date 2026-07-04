import express from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categories.js";
import userRoutes from "./users.js";
import orderRoutes from "./orders.js";
import diagnosticsRoutes from "./diagnostics.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/orders", orderRoutes);
router.use("/diag", diagnosticsRoutes);

export default router;
