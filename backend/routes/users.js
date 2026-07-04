import express from "express";
import { getUsers, getUserById } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, getUserById);

export default router;
