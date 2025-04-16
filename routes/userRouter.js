import express from "express";
import {
  getAllUsers,
  getUser,
  signIn,
  signUp,
  updateUser,
  getResetPasswordToken,
  resetPassword,
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/me", verifyToken, getUser);
router.post("/signup", signUp);
router.post("/signin", signIn);
router.put("/", verifyToken, updateUser);

router.post("/reset-password-token", getResetPasswordToken);
router.post("/reset-password/:reset_password_token", resetPassword);

export default router;
