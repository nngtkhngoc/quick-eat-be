import {
  getAllFood,
  getFood,
  updateFood,
  createFood,
  deleteFood,
  getReviews,
  addReview,
  addToCart,
} from "../controllers/foodController.js";

import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllFood);
router.get("/:id", getFood);
router.put("/:id", updateFood);
router.post("/", createFood);
router.post("/:id", deleteFood);

router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", verifyToken, addReview);

router.post("/:id/cart", verifyToken, addToCart);
export default router;
