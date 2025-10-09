const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Technical", "Cultural", "Sports", "Workshop", "Competition"], 
    required: true 
  },
  image: { type: String, default: "🎉" },
  capacity: { type: Number, required: true },
  registrations: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["upcoming", "ongoing", "past"], 
    default: "upcoming" 
  },
  trending: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  tags: { type: [String], default: [] },

  // 🟢 Event Payment Type
  isPaid: { type: Boolean, default: false },  // free or paid
  // Accept numeric or string values for price (coerce "Free" or non-numeric to 0)
  price: {
    type: mongoose.Schema.Types.Mixed,
    default: 0,
    get: v => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'string') {
        const t = v.trim().toLowerCase();
        if (t === '' || t === 'free' || t === '0') return 0;
      }
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    }
  },        // price in ₹ (only if paid)

  // 🟢 Registered Users
  // registrations count is stored in `registrations` and detailed records are in the Registration collection
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Event', eventSchema);
