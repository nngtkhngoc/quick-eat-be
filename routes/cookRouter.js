import express from "express";
import {
  createCook,
  getCook,
  getDetailsCook,
} from "../controllers/cookController.js";

const router = express.Router();

router.get("/", getCook);
router.get("/:id", getDetailsCook);
router.post("/", createCook);

export default router;
