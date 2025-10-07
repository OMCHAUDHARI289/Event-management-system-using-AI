const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  registrations: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming','ongoing','past'], default: 'upcoming' },
  category: { type: String, enum: ['Technical','Cultural','Sports','Workshop','Competition'], default: 'Technical' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
