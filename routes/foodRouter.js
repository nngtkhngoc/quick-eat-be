import {
  getAllFood,
  getFood,
  updateFood,
  createFood,
  deleteFood,
  getReviews,
} from "../controllers/foodController.js";

import express from "express";

const router = express.Router();

router.get("/", getAllFood);
router.get("/:id", getFood);
router.put("/:id", updateFood);
router.post("/", createFood);
router.post("/:id", deleteFood);

router.get("/:id/reviews", getReviews);

export default router;
