const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log(process.env.RAZORPAY_KEY_ID);

exports.handler = async (event) => {
  try {
    const { amount } = JSON.parse(event.body);

    const order = await instance.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (err) {
    console.error("Razorpay Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Order creation failed" }),
    };
  }
};
