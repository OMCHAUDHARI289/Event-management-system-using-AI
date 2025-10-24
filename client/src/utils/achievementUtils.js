// src/utils/achievementUtils.js

// Full list of achievement definitions
export const achievementDefinitions = [
  { title: "First Event Attended", desc: "Attend your first event", icon: "🎯", rarity: "common", checkUnlock: (data) => data.eventsAttended >= 1 },
  { title: "Active Participant", desc: "Attend 5 or more events", icon: "🚀", rarity: "uncommon", checkUnlock: (data) => data.eventsAttended >= 5 },
  { title: "Event Explorer", desc: "Attend 10+ events", icon: "🗺️", rarity: "rare", checkUnlock: (data) => data.eventsAttended >= 10 },
  { title: "Event Master", desc: "Attend 20+ events", icon: "👑", rarity: "epic", checkUnlock: (data) => data.eventsAttended >= 20 },
  { title: "Bronze Achiever", desc: "Reach Bronze level", icon: "🥉", rarity: "common", checkUnlock: (data) => data.level === 'Bronze' },
  { title: "Silver Achiever", desc: "Reach Silver level", icon: "🥈", rarity: "uncommon", checkUnlock: (data) => data.level === 'Silver' },
  { title: "Gold Achiever", desc: "Reach Gold level", icon: "🥇", rarity: "rare", checkUnlock: (data) => data.level === 'Gold' },
  { title: "Platinum Legend", desc: "Reach Platinum level", icon: "💎", rarity: "epic", checkUnlock: (data) => data.level === 'Platinum' },
  { title: "3-Day Streak Master", desc: "Attend events 3 days in a row", icon: "🔥", rarity: "uncommon", checkUnlock: (data) => data.streak >= 3 },
  { title: "Week Warrior", desc: "Maintain a 7-day streak", icon: "⚡", rarity: "rare", checkUnlock: (data) => data.streak >= 7 },
  { title: "500 Points Milestone", desc: "Score 500+ points", icon: "⭐", rarity: "common", checkUnlock: (data) => data.points >= 500 },
  { title: "1000 Points Milestone", desc: "Score 1000+ points", icon: "✨", rarity: "rare", checkUnlock: (data) => data.points >= 1000 },
  { title: "2000 Points Elite", desc: "Score 2000+ points", icon: "💫", rarity: "epic", checkUnlock: (data) => data.points >= 2000 },
  { title: "Early Bird", desc: "Register within 24hrs of event posting", icon: "🐦", rarity: "common", checkUnlock: () => false }, // backend tracking
  { title: "Perfect Attendance", desc: "100% attendance rate", icon: "💯", rarity: "epic", checkUnlock: (data) => data.totalRegistrations > 0 && data.eventsAttended === data.totalRegistrations }
];

// Get Tailwind gradient colors based on rarity
export const getRarityColor = (rarity) => {
  switch(rarity) {
    case "common": return "from-gray-400 to-gray-600";
    case "uncommon": return "from-green-400 to-green-600";
    case "rare": return "from-blue-400 to-blue-600";
    case "epic": return "from-purple-400 to-purple-600";
    case "legendary": return "from-yellow-400 to-orange-600";
    default: return "from-gray-400 to-gray-600";
  }
};

// Calculate achievement status and progress
export const getAchievementStatus = (achievement, data, earnedAchievements = []) => {
  const isEarned = earnedAchievements.some(a => a.title === achievement.title);
  if (isEarned) {
    const earnedAch = earnedAchievements.find(a => a.title === achievement.title);
    return {
      earned: true,
      date: earnedAch?.earnedDate || 'Recently',
      progress: 100
    };
  }

  let progress = 0;
  const match = achievement.desc.match(/(\d+)/);
  if (match) {
    const required = parseInt(match[0]);
    if (achievement.title.includes("Event")) progress = Math.min(100, Math.floor((data.eventsAttended / required) * 100));
    else if (achievement.title.includes("Streak")) progress = Math.min(100, Math.floor((data.streak / required) * 100));
    else if (achievement.title.includes("Points")) progress = Math.min(100, Math.floor((data.points / required) * 100));
  } else if (achievement.title === "Perfect Attendance") {
    progress = data.totalRegistrations > 0 ? Math.floor((data.eventsAttended / data.totalRegistrations) * 100) : 0;
  }

  return {
    earned: false,
    progress
  };
};
