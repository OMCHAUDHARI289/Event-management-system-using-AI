const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  studentId: { type: String },
  department: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'clubMember', 'admin'], default: 'student' },
  clubName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
