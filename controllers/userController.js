import { prisma } from "../config/db.js";
import { signUpValidator } from "../validation/userValidation.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {};

export const getUser = async (req, res) => {};

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

    return res.status(200).json({ success: true, data: newUser });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }
    console.log("Error signing up: ", error);
    return res.status(500).json({ error });
  }
};

export const signIn = async (req, res) => {};

export const updateUser = async (req, res) => {};

// export const signIn = async (req, res) => {};
