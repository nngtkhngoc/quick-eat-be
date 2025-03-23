import { prisma } from "../config/db.js";

export const getTags = async (req, res) => {
  const { limit, page } = req.query;
  try {
    const page_size = parseInt(limit) || 10;
    const current_page = parseInt(page) || 1;

    const tags = await prisma.tags.findMany({
      skip: (current_page - 1) * page_size,
      take: page_size,
    });

    return res.status(200).json({ success: true, data: tags });
  } catch (error) {
    console.log("Error getting tags: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Interal Server Error" });
  }
};
