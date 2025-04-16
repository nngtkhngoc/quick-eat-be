import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sender = '"QuickEat" <khanhngoc230705@gmail.com>';

export const sendBill = async (client, order) => {
  const mailContent = {
    from: sender,
    to: client,
    subject: "Your Quick-Eat Order Bill",
    html: `
    <div>Hello ${order.fullname},</div>
    <div>Thank you for ordering from <strong>Quick-Eat</strong>!</div>
    <br>
    <div style="font-size: 20px; font-weight: bold; color: #ff6600;">ORDER SUMMARY</div>
    <div style="margin-top: 10px;">
      <div><strong>Fullname:</strong> ${order.fullname}</div>
      <div><strong>Phone:</strong> ${order.phone_number}</div>
      <div><strong>Address:</strong> ${order.address}</div>
      <div><strong>Payment Method:</strong> ${order.payment}</div>
      <div><strong>Order Date:</strong> ${new Date(
        order.orderedAt
      ).toLocaleString()}</div>
      <div><strong>Status:</strong> ${order.status}</div>
    </div>
    <br>
    <div style="font-size: 18px; font-weight: bold;">Items Ordered:</div>
    <div>
      ${order.order_details
        .map(
          (item) => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">
          <div><strong>Food:</strong> ${item.food.name}</div>
          <div><strong>Description:</strong> ${item.food.description}</div>
          <div><strong>Price:</strong> $${item.food.price}</div>
          <div><strong>Quantity:</strong> ${item.quantity}</div>
          <div><strong>Total Price:</strong> $${item.total_price}</div>
        </div>
      `
        )
        .join("")}
    </div>
    <br>
    <div style="font-size: 18px; font-weight: bold;">Total</div>
    <div><strong>Shipping Fee:</strong> $${(+order.ship_charge / 1000).toFixed(
      2
    )} </div>
    <div><strong>Total Price:</strong> $${(
      +order.total_price +
      +order.ship_charge / 1000
    ).toFixed(2)}</div>
    <br>
    <div>Best Regards,</div>
    <div><strong>Quick-Eat Team</strong></div>
    `,
  };

  transporter.sendMail(mailContent, (err, res) => {
    if (err) {
      console.log("Error sending mail:", err);
    } else {
      console.log("Mail sent");
    }
  });
};
