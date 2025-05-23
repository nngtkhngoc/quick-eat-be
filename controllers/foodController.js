import { prisma } from "../config/db.js";

export const getAllFood = async (req, res) => {
  let {
    limit,
    page,
    sort = "price",
    order = "desc",
    tag,
    brand,
    category,
    availability,
    minPrice,
    maxPrice,
  } = req.query;

  try {
    if (!["name", "price", "avg_rate", "created_at"].includes(sort)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sort field" });
    }

    if (!["asc", "desc"].includes(order)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order field" });
    }

    const pageSize = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    let whereCondition = {};

    if (brand) {
      const brandList = brand.split(",").map((b) => b.trim());
      whereCondition.brand = { name: { in: brandList, mode: "insensitive" } };
    }

    if (category) {
      const categoryList = category.split(",").map((c) => c.trim());
      whereCondition.food_categories = {
        some: { category: { name: { in: categoryList, mode: "insensitive" } } },
      };
    }

    if (tag) {
      const tagList = tag.split(",").map((t) => t.trim());
      whereCondition.food_tags = {
        some: { tag: { name: { in: tagList, mode: "insensitive" } } },
      };
    }

    if (availability) {
      whereCondition.availablity = {
        in: availability.split(",").map((a) => a.trim()),
      };
    }

    if (minPrice !== undefined) {
      whereCondition.price = { gte: parseFloat(minPrice) };
    }

    if (maxPrice !== undefined) {
      whereCondition.price = {
        ...(whereCondition.price || {}),
        lte: parseFloat(maxPrice),
      };
    }

    let orderByCondition = { [sort]: order };

    const food = await prisma.food.findMany({
      where: whereCondition,
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: orderByCondition,
      include: {
        brand: true,
        reviews: { include: { user: true } },
        food_tags: { select: { tag: true } },
        food_categories: { select: { category: true } },
      },
    });

    const total = await prisma.food.count({ where: whereCondition });

    return res.status(200).json({ success: true, data: food, total: total });
  } catch (error) {
    console.log("Error get all food:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFood = async (req, res) => {
  const { id } = req.params;
  try {
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        brand: true,
        reviews: { include: { user: true } },
        food_tags: { select: { tag: true } },
        food_categories: { select: { category: { select: { name: true } } } },
      },
    });

    if (food) {
      return res.status(200).json({ success: true, data: food });
    }

    return res.status(404).json({ success: false, message: "Food not found" });
  } catch (error) {
    console.log("Error get food:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createFood = async (req, res) => {};

export const updateFood = async () => {};

export const deleteFood = async () => {};

export const getReviews = async (req, res) => {
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
