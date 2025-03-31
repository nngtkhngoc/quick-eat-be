import express from "express";
import {
  getAllUsers,
  getUser,
  signIn,
  signUp,
  updateUser,
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/me", verifyToken, getUser);
router.post("/signup", signUp);
router.post("/signin", signIn);
router.put("/", updateUser);

export default router;
