const Razorpay = require("razorpay");
const crypto = require("crypto");
const Registration = require("../models/Registration"); // adjust path if different
const Event = require("../models/Event");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create Razorpay order for an event registration
exports.createOrder = async (req, res) => {
  try {
    const { amount, eventId, studentId } = req.body;

    // ✅ Make a short and unique receipt (max 40 chars)
    const shortReceipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        eventId,
        studentId,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// 2️⃣ Verify payment and mark registration as paid
exports.verifyEventPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      studentId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Mark registration as paid
    const registration = await Registration.findOneAndUpdate(
      { eventId, studentId },
      {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
      registration,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Server error during payment verification" });
  }
};
