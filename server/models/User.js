const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },       // optional
    studentId: { type: String },   // optional
    department: { type: String },  // optional
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'clubMember', 'admin'], default: 'student' },
    clubName: { type: String }     // optional
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
