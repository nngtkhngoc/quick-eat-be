import express from "express";
import { handleUserInput } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", handleUserInput);

export default router;
