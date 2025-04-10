import express from "express";
import { createOrder } from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);

export default router;
