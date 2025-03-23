import { prisma } from "../config/db.js";

export const getAllFood = async (req, res) => {
  let { limit, page, sort = "price", order = "desc", filter_value } = req.query;

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
    if (filter_value) {
      const filterValues = filter_value.split(",").map((val) => val.trim());

      whereCondition = {
        OR: filterValues.flatMap((value) => [
          { name: { contains: value, mode: "insensitive" } },
          { brand: { name: { contains: value, mode: "insensitive" } } },
          {
            food_tags: {
              some: { tag: { name: { contains: value, mode: "insensitive" } } },
            },
          },
          {
            food_categories: {
              some: {
                category: { name: { contains: value, mode: "insensitive" } },
              },
            },
          },
        ]),
      };
    }

    let orderByCondition;

    orderByCondition = { [sort]: order };

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

    return res.status(200).json({ success: true, data: food });
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
