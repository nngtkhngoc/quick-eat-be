import { prisma } from "../config/db.js";

export const getCart = async (req, res) => {
  const { id } = req;
  try {
    const cart = await prisma.carts.findUnique({
      where: { user_id: id },
      include: { cart_details: { include: { food: true } } },
    });

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error get cart: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const addToCart = async (req, res) => {
  const { id } = req;
  const { food_id } = req.params;
  const { quantity } = req.body;

  try {
    let cart = await prisma.carts.findUnique({ where: { user_id: id } });
    if (!cart) {
      cart = await prisma.carts.create({ data: { user_id: id } });
    }

    let cart_details = await prisma.cart_details.findUnique({
      where: { cart_id_food_id: { food_id, cart_id: cart.id } },
    });

    const food = await prisma.food.findUnique({ where: { id: food_id } });
    const price = quantity * food.price;

    if (!cart_details) {
      cart_details = await prisma.cart_details.create({
        data: { cart_id: cart.id, food_id, quantity, total_price: price },
      });
    } else {
      cart_details = await prisma.cart_details.update({
        where: { cart_id_food_id: { food_id, cart_id: cart.id } },
        data: {
          quantity: cart_details.quantity + quantity,
          total_price: cart_details.total_price + price,
        },
      });
    }

    const totalQuantity = await prisma.cart_details.aggregate({
      _sum: { quantity: true },
      where: { cart_id: cart.id },
    });

    const totalPrice = await prisma.cart_details.aggregate({
      _sum: { total_price: true },
      where: { cart_id: cart.id },
    });

    cart = await prisma.carts.update({
      where: { id: cart.id },
      data: {
        total_quantity: totalQuantity._sum.quantity,
        total_price: totalPrice._sum.total_price,
      },
      include: { cart_details: { include: { food: true } } },
    });
    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error add to cart: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const removeFromCart = async (req, res) => {
  const { cart_id, food_id } = req.body;
  const { id } = req;

  try {
    await prisma.cart_details.delete({
      where: { cart_id_food_id: { cart_id, food_id } },
    });

    const checkCart = await prisma.cart_details.findMany({
      where: { cart_id },
    });

    console.log(checkCart);

    if (checkCart.length == 0) {
      await prisma.carts.delete({ where: { user_id: id } });
    } else {
      const totalQuantity = await prisma.cart_details.aggregate({
        _sum: { quantity: true },
        where: { cart_id },
      });

      const totalPrice = await prisma.cart_details.aggregate({
        _sum: { total_price: true },
        where: { cart_id },
      });

      await prisma.carts.update({
        where: { user_id: id },
        data: {
          total_quantity: totalQuantity._sum.quantity,
          total_price: totalPrice._sum.total_price,
        },
        include: { cart_details: { include: { food: true } } },
      });
    }

    let cart = await prisma.carts.findUnique({
      where: { user_id: id },
      include: { cart_details: { include: { food: true } } },
    });

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log("Error removing from cart: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCart = async (req, res) => {
  const { cart_id, food_id, quantity } = req.body;
  const { id } = req;

  try {
    const food = await prisma.food.findUnique({ where: { id: food_id } });
    const price = quantity * food.price;

    let updatedCartDetails = await prisma.cart_details.update({
      where: { cart_id_food_id: { cart_id, food_id } },
      data: { quantity, total_price: price },
    });
    const totals = await prisma.cart_details.aggregate({
      _sum: { quantity: true, total_price: true },
      where: { cart_id },
    });

    let cart = await prisma.carts.update({
      where: { user_id: id },
      data: {
        total_quantity: totals._sum.quantity,
        total_price: totals._sum.total_price,
      },
      include: { cart_details: { include: { food: true } } },
    });

    return res.status(200).json({
      success: true,
      data: cart,
      updatedCartDetails,
    });
  } catch (error) {
    console.log("Error updating cart: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
