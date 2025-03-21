import express from "express";
import {
  getReviews,
  getReviewsForFood,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviews);
router.get("/:id", getReviewsForFood);

export default router;
