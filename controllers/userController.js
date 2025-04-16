import { prisma } from "../config/db.js";
import {
  signUpValidator,
  resetPasswordValidator,
  updateUserValidator,
} from "../validation/userValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "../config/nodemailer.js";

export const getAllUsers = async (req, res) => {};

export const getUser = async (req, res) => {
  const { id } = req;

  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: { carts: true },
    });

    if (user) {
      return res.status(200).json({ success: true, data: user });
    }

    return res.status(404).json({ success: false, message: "User not found" });
  } catch (error) {
    console.log("Error getting user: ", error, "req: ", req.id);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const signUp = async (req, res) => {
  const data = req.body;
  try {
    await signUpValidator.validateAsync(req.body);

    const [checkUsername, checkEmail, checkPhoneNumber] = await Promise.all([
      await prisma.users.findUnique({ where: { username: data.username } }),
      await prisma.users.findUnique({ where: { email: data.email } }),
      await prisma.users.findUnique({
        where: { phone_number: data.phone_number },
      }),
    ]);

    if (checkEmail) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    if (checkUsername) {
      return res
        .status(409)
        .json({ success: false, message: "Username already exists" });
    }

    if (checkPhoneNumber) {
      return res
        .status(409)
        .json({ success: false, message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.users.create({
      data: {
        username: data.username,
        phone_number: data.phone_number,
        email: data.email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    res.header("auth_token", token);
    return res.status(200).json({ success: true, token, data: newUser });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    console.log("Error signing up: ", error);
    return res.status(500).json({ success: false, message: error });
  }
};

export const signIn = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide identifier and password",
      });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone_number: identifier },
          { username: identifier },
        ],
      },
      include: { carts: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(406)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    res.header("auth_token", token);
    return res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    console.log("Error sign in:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const data = req.body;
  const { id } = req;
  try {
    await updateUserValidator.validateAsync(data);

    // if (data.profile_pic) {
    //   const uploadRes = await cloudinary.uploader.upload(data.profile_pic);
    //   data.profile_pic = uploadRes.secure_url;
    // }

    const updatedUser = await prisma.users.update({ where: { id }, data });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Update user successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    console.log("Error update user: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getResetPasswordToken = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const reset_password_token = Math.floor(
      10000 + Math.random() * 900000
    ).toString();
    await prisma.users.update({
      where: { email },
      data: {
        reset_password_token: reset_password_token,
        reset_password_token_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendResetPasswordEmail(user.email, reset_password_token);

    return res
      .status(200)
      .json({ success: true, message: "Send mail succesfully" });
  } catch (error) {
    console.log("Error send reset password mail:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { reset_password_token } = req.params;
  const { new_password, confirm_new_password } = req.body;
  try {
    await resetPasswordValidator.validateAsync(req.body);

    const user = await prisma.users.findUnique({
      where: {
        reset_password_token,
        reset_password_token_expires_at: { gt: new Date() },
      },
    });

    if (user) {
      const hashedPassword = await bcrypt.hash(new_password, 10);

      await prisma.users.update({
        where: { reset_password_token },
        data: {
          password: hashedPassword,
          reset_password_token: null,
          reset_password_token_expires_at: null,
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Reset password successfully" });
    }

    return res.status(400).json({ sucess: false, message: "Invalid token" });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    console.log("Error reset password: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
