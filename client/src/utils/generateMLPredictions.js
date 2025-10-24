// src/utils/mlPredictions.js
import axios from "axios";

/**
 * Calls the Python ML API to get predictions based on student stats.
 * @param {Object} stats - leaderboard stats { eventsAttended, points, level, streak, totalRegistrations }
 * @returns {Object|null} ML predictions
 */
export const generateMLPredictions = async (stats) => {
  try {
    // Use relative path so frontend calls the same origin where the server is mounted.
    // Server mounts ml routes at /api/ml, so this posts to /api/ml/predict
    const response = await axios.post("http://localhost:8000/api/ml/predict", stats);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch ML predictions:", err);
    return null;
  }
};

export default generateMLPredictions;
