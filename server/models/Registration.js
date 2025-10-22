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

  // attendance
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date },

  // registration metadata
  amount: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now },
  ticketNumber: { type: String, unique: true },

  // feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
  }
}, { timestamps: true });

// Pre-save hook to generate ticket number
registrationSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit
    this.ticketNumber = `TICK${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
