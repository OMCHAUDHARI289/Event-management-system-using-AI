const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // student details captured at registration time
  fullName: { type: String },
  email: { type: String },
  phone: { type: String },
  department: { type: String },
  year: { type: String },

  // registration metadata
  amount: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
