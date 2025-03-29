import { prisma } from "../config/db.js";

export const getCook = async (req, res) => {
  const { limit, page, level } = req.query;

  try {
    const pageSize = parseInt(limit) | 10;
    const pageNum = parseInt(page) | 1;

    let whereCondition = {};
    if (level) {
      const levelList = level.split(",").map((l) => l.trim());
      whereCondition.level = {
        in: levelList,
      };
    }

    const cook = await prisma.cook.findMany({
      where: whereCondition,
      take: pageSize,
      skip: (pageNum - 1) * pageSize,
    });

    return res.status(200).json({ success: true, data: cook });
  } catch (error) {
    console.log("Error getting cook: ", error);
    return res
      .status(400)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createCook = async (req, res) => {
  const { name, profile_img, level, description } = req.body;

  try {
    const newCook = await prisma.cook.create({
      data: {
        name,
        profile_img,
        level,
        description,
      },
    });

    if (newCook) {
      return res.status(200).json({ success: true, data: newCook });
    }
  } catch (error) {
    console.log("Error creating cook", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
