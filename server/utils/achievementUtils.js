// server/utils/achievementUtils.js
const User = require('../models/User');

// Achievement definitions
const achievementDefinitions = [
  { title: "First Event Attended", desc: "Attend your first event", checkUnlock: (stats) => stats.eventsAttended >= 1 },
  { title: "Active Participant", desc: "Attend 5 or more events", checkUnlock: (stats) => stats.eventsAttended >= 5 },
  { title: "Event Explorer", desc: "Attend 10+ events", checkUnlock: (stats) => stats.eventsAttended >= 10 },
  { title: "Event Master", desc: "Attend 20+ events", checkUnlock: (stats) => stats.eventsAttended >= 20 },
  { title: "Bronze Achiever", desc: "Reach Bronze level", checkUnlock: (stats) => stats.level === 'Bronze' },
  { title: "Silver Achiever", desc: "Reach Silver level", checkUnlock: (stats) => stats.level === 'Silver' },
  { title: "Gold Achiever", desc: "Reach Gold level", checkUnlock: (stats) => stats.level === 'Gold' },
  { title: "Platinum Legend", desc: "Reach Platinum level", checkUnlock: (stats) => stats.level === 'Platinum' },
  { title: "3-Day Streak Master", desc: "Attend events 3 days in a row", checkUnlock: (stats) => stats.streak >= 3 },
  { title: "Week Warrior", desc: "Maintain a 7-day streak", checkUnlock: (stats) => stats.streak >= 7 },
  { title: "500 Points Milestone", desc: "Score 500+ points", checkUnlock: (stats) => stats.points >= 500 },
  { title: "1000 Points Milestone", desc: "Score 1000+ points", checkUnlock: (stats) => stats.points >= 1000 },
  { title: "2000 Points Elite", desc: "Score 2000+ points", checkUnlock: (stats) => stats.points >= 2000 },
  { title: "Perfect Attendance", desc: "100% attendance rate", checkUnlock: (stats) => stats.totalRegistrations > 0 && stats.eventsAttended === stats.totalRegistrations }
];

// Function to update user achievements
async function updateAchievements(userId, stats) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.achievements) user.achievements = [];

    achievementDefinitions.forEach(ach => {
      const alreadyEarned = user.achievements.some(a => a.title === ach.title);
      if (!alreadyEarned && ach.checkUnlock(stats)) {
        user.achievements.push({ title: ach.title, earnedDate: new Date() });
      }
    });

    await user.save();
  } catch (err) {
    console.error('Error updating achievements:', err);
  }
}

module.exports = { achievementDefinitions, updateAchievements };
