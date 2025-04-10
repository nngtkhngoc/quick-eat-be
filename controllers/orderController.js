import { prisma } from "../config/db.js";

export const createOrder = async (req, res) => {
  const { id } = req;
  const { phone_number, address, payment } = req.body;

  try {
    const cart = await prisma.carts.findUnique({
      where: { user_id: id },
      include: { cart_details: true },
    });

    if (!cart || cart.cart_details.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống hoặc không tồn tại" });
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
          .json({ success: false, message: "Voucher không hợp lệ" });
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
        voucher_id: req.body.voucher_id || null,
        total_price: finalPrice,
        order_details: {
          create: cart.cart_details.map((item) => ({
            food_id: item.food_id,
            quantity: item.quantity,
            total_price: item.total_price,
            status: "PENDING",
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
      include: { order_details: true },
    });

    await prisma.carts.delete({ where: { id: cart.id } });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.log("Error create order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Đã có lỗi xảy ra khi tạo đơn hàng" });
  }
};
