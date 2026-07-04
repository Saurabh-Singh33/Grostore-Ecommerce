import express from "express";
import { getOrders, getOrdersByUser, createOrder, updateOrderStatus, cancelOwnOrder, cancelOwnOrderItem } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, getOrders);
router.get("/user/:userId", protect, getOrdersByUser);
router.post("/", protect, createOrder);
router.post("/:id/cancel", protect, cancelOwnOrder);
router.post("/:id/items/:itemIndex/cancel", protect, cancelOwnOrderItem);
router.put("/:id", protect, adminOnly, updateOrderStatus);

export default router;
