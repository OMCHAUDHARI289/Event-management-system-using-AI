// server/utils/achievementUtils.js
const User = require('../models/User');

// You can copy these from your current achievementUtils
const achievementDefinitions = [
  { 
    title: "First Event Attended", 
    desc: "Attend your first event", 
    icon: "🎯", 
    rarity: "common",
    checkUnlock: (data) => data.eventsAttended >= 1
  },
  { 
    title: "Active Participant", 
    desc: "Attend 5 or more events", 
    icon: "🚀", 
    rarity: "uncommon",
    checkUnlock: (data) => data.eventsAttended >= 5
  },
  // ... add all your other achievements here
];

/**
 * Updates user achievements based on stats
 * @param {string} userId - MongoDB User ID
 * @param {Object} stats - Stats like totalRegistrations, totalAttended, totalFeedback, attendedDates
 * @param {number} points - Total points
 * @param {string} level - Bronze/Silver/Gold/Platinum
 * @param {number} streak - Consecutive attendance streak
 */
async function updateAchievements(userId, stats, points, level, streak) {
  const user = await User.findById(userId);
  if (!user) return;

  const data = {
    totalRegistrations: stats.totalRegistrations,
    eventsAttended: stats.totalAttended,
    feedbackGiven: stats.totalFeedback,
    points,
    level,
    streak
  };

  const newAchievements = achievementDefinitions
    .filter(a => a.checkUnlock(data)) // filter unlocked
    .map(a => ({
      title: a.title,
      desc: a.desc,
      icon: a.icon,
      rarity: a.rarity,
      earnedDate: new Date()
    }));

  // Merge with existing achievements
  const existingTitles = user.achievements.map(a => a.title);
  user.achievements = [
    ...user.achievements,
    ...newAchievements.filter(a => !existingTitles.includes(a.title))
  ];

  await user.save();
}

module.exports = {
  achievementDefinitions,
  updateAchievements
};
