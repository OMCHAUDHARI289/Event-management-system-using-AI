const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },            // optional
    studentId: { type: String },        // optional
    prn: { type: String },              // optional
    department: { type: String },       // optional
    location: { type: String },         // optional
    bio: { type: String },              // optional
    profileImage: { type: String },     // avatar URL
    bannerImage: { type: String },      // banner URL
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'clubMember', 'admin'], default: 'student' },
    clubName: { type: String },         // optional

    certificates: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        type: { type: String }          // optional: e.g., "Workshop", "Competition"
      }
    ],

    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
