const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createRazorpayOrder = async (amount, planId) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Missing Razorpay credentials in environment variables");
    }

    const shortReceipt = `rcpt_${planId.slice(-6)}_${Date.now().toString().slice(-5)}`;
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: shortReceipt,
      notes: { planId },
    };

    console.log("🪙 Creating Razorpay order with:", options);
    const order = await razorpay.orders.create(options);

    if (!order) throw new Error("Failed to create Razorpay order");
    console.log("✅ Razorpay order created successfully:", order);
    return order;
  } catch (error) {
    console.error("💥 Razorpay order error:", error);
    throw new Error(`Razorpay error: ${error.message}`);
  }
};

// Verify Razorpay signature
exports.verifyRazorpayPayment = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};
