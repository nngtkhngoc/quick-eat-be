import { prisma } from "../config/db.js";

export const getReviews = async (req, res) => {
  let { limit, page } = req.query;

  try {
    const pageSize = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    const reviews = await prisma.reviews.findMany({
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: { created_at: "desc" },
      include: { user: true },
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.log("Error get all reviews:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getReviewsForFood = async (req, res) => {
  let { limit, page } = req.query;
  let { id } = req.params;

  try {
    const pageSize = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    const reviews = await prisma.reviews.findMany({
      where: { food_id: id },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: { created_at: "desc" },
      include: { user: true },
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.log("Error get reviews for food:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
