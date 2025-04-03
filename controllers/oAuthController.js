import { prisma } from "../config/db.js";
import { generatePassword } from "../utils/generatePassword.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const BASE_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json();

    const { email, name, picture } = payload;

    let user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await prisma.users.create({
        data: {
          username: email.split("@")[0],
          fullname: name,
          profile_pic: picture,
          password: hashedPassword,
          email,
        },
      });
    }

    const jwt_token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24,
    });

    res.status(200).json({ success: true, token: jwt_token, data: user });
  } catch (error) {
    console.log("Error google login", error);
  }
};
