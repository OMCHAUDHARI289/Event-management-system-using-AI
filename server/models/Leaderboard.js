const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: { type: Number, default: 0 },
    level: { type: String, enum: ['Bronze','Silver','Gold','Platinum'], default: 'Bronze' },
    trend: { type: String, enum: ['up','down','same'], default: 'same' },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
