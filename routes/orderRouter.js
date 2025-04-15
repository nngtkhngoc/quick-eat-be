import express from "express";
import {
  createOrder,
  getOrder,
  addReview,
} from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getOrder);
router.post("/:id/reviews", verifyToken, addReview);

export default router;
