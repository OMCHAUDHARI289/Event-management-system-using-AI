const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'clubMember', 'admin'], default: 'student' },
    position: { type: String, enum: ['Member', 'Volunteer'], default: 'Member' }, // new
    phone: { type: String },
    prn: { type: String },
    department: { type: String },
    clubName: { type: String },
    profileImage: { type: String },
    bannerImage: { type: String },
    certificates: [{ title: String, date: Date, type: String }],
    achievements: [{ title: String, description: String, earnedAt: { type: Date, default: Date.now } }]
  },
  { timestamps: true }
);


module.exports = mongoose.models.User || mongoose.model('User', userSchema);
