import express from "express";
import { createCook, getCook } from "../controllers/cookController.js";

const router = express.Router();

router.get("/", getCook);
router.post("/", createCook);

export default router;
