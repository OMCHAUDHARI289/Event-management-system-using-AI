const Razorpay = require('razorpay');
const crypto = require('crypto');
const Registration = require('../models/Registration');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });

    const options = {
      amount: Math.round(Number(amount) * 100), // in paise
      currency,
      receipt: receipt || `rcpt_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay createOrder error:', error);
    return res.status(500).json({ message: 'Error creating Razorpay order', error });
  }
};

// Verify payment signature and mark registration as paid
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment fields' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Optionally update the Registration document status
    if (registrationId) {
      const reg = await Registration.findById(registrationId);
      if (reg) {
        reg.paymentStatus = 'success';
        reg.payment = {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        };
        await reg.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed', err });
  }
};
