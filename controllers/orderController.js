import { prisma } from "../config/db.js";
import { sendBill } from "../config/nodemailer.js";
import { createOrderValidation } from "../validation/orderValidation.js";

export const createOrder = async (req, res) => {
  const { id } = req;
  const { phone_number, address, payment, fullname } = req.body;

  try {
    await createOrderValidation.validateAsync(req.body);

    const cart = await prisma.carts.findUnique({
      where: { user_id: id },
      include: { cart_details: true },
    });

    if (!cart || cart.cart_details.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty!" });
    }

    const totalPrice = cart.total_price;

    let discount = 0;
    if (req.body.voucher_id) {
      const voucher = await prisma.vouchers.findUnique({
        where: { id: req.body.voucher_id },
      });
      if (voucher && voucher.expiry > new Date() && voucher.quantity > 0) {
        discount = parseFloat(voucher.discount.toString());
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid voucher" });
      }
    }

    const finalPrice = totalPrice - discount;

    let order = await prisma.orders.create({
      data: {
        user_id: id,
        ship_charge: 30000,
        phone_number,
        address,
        payment,
        fullname,
        voucher_id: req.body.voucher_id || null,
        total_price: finalPrice,
        status: "PENDING",
        order_details: {
          create: cart.cart_details.map((item) => ({
            food_id: item.food_id,
            quantity: item.quantity,
            total_price: item.total_price,
          })),
        },
      },
    });

    if (req.body.voucher_id) {
      await prisma.vouchers.update({
        where: { id: req.body.voucher_id },
        data: {
          quantity: { decrement: 1 },
        },
      });
    }

    order = await prisma.orders.findUnique({
      where: { id: order.id },
      include: { order_details: { include: { food: true } } },
    });

    await prisma.carts.delete({ where: { id: cart.id } });

    const client = await prisma.users.findUnique({ where: { id } });
    await sendBill(client.email, order);

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message),
      });
    }

    console.log("Error create order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getOrders = async (req, res) => {
  const { id } = req;
  const { status, food_name } = req.query;

  try {
    let whereCondition = {
      user_id: id,
      order_details: {
        some: {},
      },
    };

    if (status && !food_name) {
      whereCondition.status = status;
    }

    if (!status && food_name) {
      whereCondition.order_details.some.food = {
        name: {
          contains: food_name,
          mode: "insensitive",
        },
      };
    }

    if (status && food_name) {
      whereCondition.status = status;
      whereCondition.order_details.some.food = {
        name: {
          contains: food_name,
          mode: "insensitive",
        },
      };
    }

    const orders = await prisma.orders.findMany({
      where: whereCondition,
      include: {
        order_details: {
          include: {
            food: {
              include: { food_categories: { select: { category: true } } },
            },
          },
        },
      },
      orderBy: { orderedAt: "desc" },
    });

    if (orders.length > 0) {
      return res.status(200).json({ success: true, data: orders });
    }

    return res
      .status(404)
      .json({ success: false, message: "No order was found" });
  } catch (error) {
    console.log("Error getting order: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const addReview = async (req, res) => {
  const user_id = req.id;
  const order_details_id = req.params.id;
  const { score, content } = req.body;

  try {
    const order_details = await prisma.order_details.findUnique({
      where: { id: order_details_id },
    });

    const newReview = await prisma.reviews.create({
      data: {
        order_details_id,
        food_id: order_details.food_id,
        user_id,
        score,
        content,
      },
      include: {
        user: true,
      },
    });

    const avg_score = await prisma.reviews.aggregate({
      where: { food_id: order_details.food_id },
      _avg: { score: true },
    });

    const food = await prisma.food.update({
      where: { id: order_details.food_id },
      data: { avg_rate: avg_score._avg.score },
    });

    const order = await prisma.order_details.update({
      where: { id: order_details_id },
      data: { is_reviewed: true },
    });

    return res
      .status(200)
      .json({ success: true, data: newReview, food: food, order: order });
  } catch (error) {
    console.log("Error adding review ", error, "id:", req.id);

    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
