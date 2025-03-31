import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";

import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.post("/:food_id", verifyToken, addToCart);
router.delete("/", verifyToken, removeFromCart);

export default router;
