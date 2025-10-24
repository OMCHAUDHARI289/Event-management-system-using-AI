// src/utils/mlPredictions.js
import axios from "axios";

/**
 * Local frontend-based ML predictions
 * @param {Object} userData - Student activity stats
 * @returns {Object} Prediction results
 */
const localPredict = (userData) => {
  const {
    eventsAttended = 0,
    points = 0,
    level = "Bronze",
    streak = 0,
    totalRegistrations = 0,
  } = userData;

  const attendanceRate =
    totalRegistrations > 0 ? (eventsAttended / totalRegistrations) * 100 : 0;

  let nextLevel = "Silver";
  let pointsNeeded = 1500 - points;
  if (level === "Silver") {
    nextLevel = "Gold";
    pointsNeeded = 2000 - points;
  } else if (level === "Gold") {
    nextLevel = "Platinum";
    pointsNeeded = 2500 - points;
  } else if (level === "Platinum") {
    nextLevel = "Platinum Max";
    pointsNeeded = 0;
  }

  const eventsNeeded = Math.ceil(pointsNeeded / 65);

  let dropoutRisk = "Low";
  let riskPercentage = 10;
  if (streak === 0 && eventsAttended < 3) {
    dropoutRisk = "High";
    riskPercentage = 75;
  } else if (streak <= 1 && attendanceRate < 50) {
    dropoutRisk = "Medium";
    riskPercentage = 45;
  } else if (attendanceRate < 70) {
    dropoutRisk = "Medium";
    riskPercentage = 30;
  }

  // AI-powered event recommendations based on user behavior
  const recommendations = [];
  
  // Analyze user's department and suggest relevant events
  const department = userData.department || "";
  if (department.toLowerCase().includes("computer") || department.toLowerCase().includes("it")) {
    recommendations.push({
      category: "Technical Workshops",
      confidence: Math.min(95, 70 + (eventsAttended * 3)),
      reason: "Perfect match for your Computer Science background",
      priority: "high",
      eventTypes: ["Programming", "Web Development", "Database Management"]
    });
    recommendations.push({
      category: "Hackathons",
      confidence: Math.min(90, 60 + (streak * 5)),
      reason: "Great for showcasing your coding skills",
      priority: "high",
      eventTypes: ["24-hour coding", "Team competitions", "Innovation challenges"]
    });
  }
  
  // AI/ML recommendations based on attendance patterns
  if (eventsAttended > 5 || points > 500) {
    recommendations.push({
      category: "AI/ML Sessions",
      confidence: Math.min(95, 80 + (points / 100)),
      reason: "Your engagement suggests strong interest in emerging tech",
      priority: "high",
      eventTypes: ["Machine Learning", "Data Science", "AI Ethics"]
    });
  }
  
  // Career development based on level progression
  if (level === "Silver" || level === "Gold" || level === "Platinum") {
    recommendations.push({
      category: "Career Development",
      confidence: Math.min(90, 70 + (parseInt(level === "Gold" ? 2 : level === "Platinum" ? 3 : 1) * 10)),
      reason: "Your level progression shows readiness for professional development",
      priority: "medium",
      eventTypes: ["Networking", "Resume Building", "Interview Prep"]
    });
  }
  
  // Leadership events for high performers
  if (points > 1000 || streak > 5) {
    recommendations.push({
      category: "Leadership Events",
      confidence: Math.min(85, 60 + (streak * 3)),
      reason: "Your consistent participation makes you a natural leader",
      priority: "medium",
      eventTypes: ["Team Management", "Public Speaking", "Mentorship"]
    });
  }
  
  // Innovation events for creative minds
  if (attendanceRate > 70 && eventsAttended > 3) {
    recommendations.push({
      category: "Innovation Challenges",
      confidence: Math.min(88, 65 + (attendanceRate / 2)),
      reason: "Your high attendance rate shows commitment to learning",
      priority: "medium",
      eventTypes: ["Startup Ideas", "Product Design", "Business Planning"]
    });
  }
  
  // Cultural and soft skills for well-rounded development
  if (totalRegistrations > 10) {
    recommendations.push({
      category: "Cultural Events",
      confidence: Math.min(75, 50 + (totalRegistrations / 3)),
      reason: "Expand your horizons beyond technical skills",
      priority: "low",
      eventTypes: ["Cultural Exchange", "Language Learning", "Arts & Crafts"]
    });
  }
  
  // Sort by confidence and limit to top 4
  recommendations.sort((a, b) => b.confidence - a.confidence);
  const topRecommendations = recommendations.slice(0, 4);

  const nextAchievements = [];
  
  // Event Explorer Achievement
  if (eventsAttended < 10) {
    const eventsNeeded = 10 - eventsAttended;
    const daysEstimate = Math.max(1, Math.ceil(eventsNeeded * 3)); // Assume 3 days between events
    const probability = Math.min(95, 60 + (eventsAttended * 4)); // Higher probability as they attend more
    nextAchievements.push({
      title: "Event Explorer",
      description: `Attend ${eventsNeeded} more events to unlock this achievement`,
      daysEstimate,
      probability,
      category: "participation",
      icon: "🎯"
    });
  }
  
  // Streak Achievements
  if (streak < 3) {
    const streakNeeded = 3 - streak;
    nextAchievements.push({
      title: "3-Day Streak Master",
      description: `Maintain attendance for ${streakNeeded} more consecutive days`,
      daysEstimate: streakNeeded,
      probability: 75,
      category: "consistency",
      icon: "🔥"
    });
  } else if (streak < 7) {
    const streakNeeded = 7 - streak;
    nextAchievements.push({
      title: "Week Warrior",
      description: `Maintain attendance for ${streakNeeded} more days to reach 7-day streak`,
      daysEstimate: streakNeeded,
      probability: 60,
      category: "consistency",
      icon: "⚡"
    });
  }
  
  // Points-based Achievements
  if (points < 1000) {
    const pointsNeeded = 1000 - points;
    const daysEstimate = Math.max(1, Math.ceil(pointsNeeded / 30)); // Assume 30 points per day
    nextAchievements.push({
      title: "1000 Points Milestone",
      description: `Earn ${pointsNeeded} more points to reach this milestone`,
      daysEstimate,
      probability: Math.min(90, 50 + (points / 20)),
      category: "points",
      icon: "💎"
    });
  } else if (points < 2500) {
    const pointsNeeded = 2500 - points;
    const daysEstimate = Math.max(1, Math.ceil(pointsNeeded / 40));
    nextAchievements.push({
      title: "Elite Performer",
      description: `Earn ${pointsNeeded} more points to reach elite status`,
      daysEstimate,
      probability: Math.min(85, 40 + (points / 50)),
      category: "points",
      icon: "👑"
    });
  }
  
  // Level-based Achievements
  if (level === "Bronze" && points >= 1500) {
    nextAchievements.push({
      title: "Silver Level Up",
      description: "You're close to reaching Silver level!",
      daysEstimate: 1,
      probability: 95,
      category: "level",
      icon: "🥈"
    });
  } else if (level === "Silver" && points >= 2000) {
    nextAchievements.push({
      title: "Gold Level Up",
      description: "You're close to reaching Gold level!",
      daysEstimate: 1,
      probability: 90,
      category: "level",
      icon: "🥇"
    });
  } else if (level === "Gold" && points >= 2500) {
    nextAchievements.push({
      title: "Platinum Level Up",
      description: "You're close to reaching Platinum level!",
      daysEstimate: 1,
      probability: 85,
      category: "level",
      icon: "💎"
    });
  }
  
  // Feedback-based Achievements
  if (totalRegistrations > 0) {
    const feedbackRate = (totalRegistrations > 0 ? (totalRegistrations - (totalRegistrations - (totalRegistrations * 0.3))) / totalRegistrations : 0) * 100;
    if (feedbackRate < 50) {
      nextAchievements.push({
        title: "Feedback Champion",
        description: "Give feedback for more events to unlock this achievement",
        daysEstimate: Math.ceil((50 - feedbackRate) / 10),
        probability: 70,
        category: "engagement",
        icon: "💬"
      });
    }
  }

  const avgPointsPerEvent = eventsAttended > 0 ? points / eventsAttended : 0;
  let performanceTrend = "Stable";
  if (avgPointsPerEvent > 60) performanceTrend = "Excellent";
  else if (avgPointsPerEvent > 40) performanceTrend = "Good";
  else if (avgPointsPerEvent < 30) performanceTrend = "Needs Improvement";

  return {
    nextLevel,
    eventsNeeded,
    pointsNeeded: Math.max(0, pointsNeeded),
    dropoutRisk,
    riskPercentage,
    attendanceRate: attendanceRate.toFixed(1),
    recommendations: topRecommendations,
    nextAchievements: nextAchievements.slice(0, 3),
    performanceTrend,
    avgPointsPerEvent: avgPointsPerEvent.toFixed(1),
    engagementScore: Math.min(
      100,
      Math.floor(eventsAttended * 5 + streak * 10 + attendanceRate * 0.5)
    ),
  };
};

/**
 * Main function to generate ML predictions
 * @param {Object} stats - Student stats
 * @param {boolean} useAPI - true to call backend API, false to use local predictions
 * @returns {Promise<Object>} ML predictions
 */
export const generateMLPredictions = async (stats, useAPI = false) => {
  if (!useAPI) {
    return localPredict(stats);
  }

  try {
    // Use same-origin relative path. Server mounts ML routes at /api/ml
      const response = await axios.post("http://localhost:5000/api/ml/predict", stats);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch ML predictions from API, using local fallback:", err);
    // fallback to local prediction if API fails
    return localPredict(stats);
  }
};

export default generateMLPredictions;
