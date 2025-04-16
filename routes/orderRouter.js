import express from "express";
import {
  createOrder,
  getOrders,
  addReview,
} from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getOrders);
router.post("/:id/reviews", verifyToken, addReview);

export default router;
