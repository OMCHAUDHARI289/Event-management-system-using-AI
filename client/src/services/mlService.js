// src/services/mlService.js
import api from './api'; // axios instance
const AI_BASE = 'http://https://event-management-system-using-ai.onrender.com/api/ai';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Trigger ML model training
export const trainModel = async () => {
  try {
    const res = await api.post(`${AI_BASE}/train`, {}, getAuthHeaders());
    return res.data; // { message: 'Model trained successfully' }
  } catch (err) {
    console.error('ML training error:', err);
    throw err;
  }
};

// Predict points/achievement for a student
export const predictAchievement = async (payload) => {
  try {
    // payload = { totalRegistrations, totalAttended, totalFeedback }
    const res = await api.post(`${AI_BASE}/predict`, payload, getAuthHeaders());
    return res.data; // { predictedPoints: 1234 }
  } catch (err) {
    console.error('ML prediction error:', err);
    throw err;
  }
};
