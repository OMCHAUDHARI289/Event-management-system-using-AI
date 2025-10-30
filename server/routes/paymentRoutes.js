// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// ✅ Route to create a Razorpay order
router.post("/register-event", paymentController.createOrder);

// ✅ Route to verify Razorpay payment
router.post("/verify-registration", paymentController.verifyEventPayment);

module.exports = router;
