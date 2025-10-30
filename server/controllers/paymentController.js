// controllers/paymentController.js
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Create order
exports.createOrder = async (req, res) => {
  try {
    const { amount, eventId, studentId } = req.body;

    const shortReceipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: shortReceipt,
      notes: { eventId, studentId },
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// 2️⃣ Verify payment and register student
exports.verifyEventPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      userId, // ✅ use userId instead of studentId
      fullName,
      email,
      phone,
      department,
      year,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    // 🔐 Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Find or create registration
    let registration = await Registration.findOne({ eventId, userId });

    if (!registration) {
      registration = await Registration.create({
        userId, // ✅ matches schema
        eventId,
        fullName,
        email,
        phone,
        department,
        year,
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        paidAt: new Date(),
        amountPaid: amount,
        ticketNumber: "TKT" + Date.now().toString().slice(-6),
      });

      // 📈 Update event registration count
      await Event.findByIdAndUpdate(eventId, { $inc: { registrations: 1 } });
    } else {
      registration.paymentStatus = "paid";
      registration.paymentId = razorpay_payment_id;
      registration.paidAt = new Date();
      registration.amountPaid = amount;
      await registration.save();
    }

    res.json({
      success: true,
      message: "Payment verified and registration completed successfully",
      registration,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
};
