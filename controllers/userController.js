import { prisma } from "../config/db.js";
import { signUpValidator } from "../validation/userValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {};

export const getUser = async (req, res) => {
  const { id } = req;

  try {
    const user = await prisma.users.findUnique({ where: { id } });

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
    return res.status(500).json({ error });
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

export const updateUser = async (req, res) => {};

// export const signIn = async (req, res) => {};

export const getCart = async (req, res) => {
  const { id } = req;
};
