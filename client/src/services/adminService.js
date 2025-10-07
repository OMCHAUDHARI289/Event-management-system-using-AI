import axios from "axios";

// Set your backend base URL
const API_BASE = "http://localhost:5000/api/admin"; // adjust if needed

// -------------------- MEMBERS --------------------

// Get all club members
export const getClubMembers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/members`);
    return res.data.members; // return array directly
  } catch (err) {
    console.error("Error fetching club members:", err);
    throw err;
  }
};

// Get all registered students
export const getStudents = async () => {
  try {
    const res = await axios.get(`${API_BASE}/students`);
    return res.data.students; // return array directly
  } catch (err) {
    console.error("Error fetching students:", err);
    throw err;
  }
};

// Add a new member (student or club)
export const addMember = async (memberData) => {
  try {
    const res = await axios.post(`${API_BASE}/members`, memberData);
    return res.data.user; // return user object directly
  } catch (err) {
    console.error("Error adding member:", err);
    throw err;
  }
};

// Promote a student to club member
export const promoteStudent = async (studentId, promotionData) => {
  try {
    const res = await axios.put(`${API_BASE}/students/${studentId}/promote`, promotionData);
    return res.data.user; // return promoted user directly
  } catch (err) {
    console.error("Error promoting student:", err);
    throw err;
  }
};

// Delete a club member
export const deleteMember = async (memberId) => {
  try {
    const res = await axios.delete(`${API_BASE}/members/${memberId}`);
    return res.data; // message only
  } catch (err) {
    console.error("Error deleting member:", err);
    throw err;
  }
};

// -------------------- STATS --------------------
export const getAdminStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats`);
    return res.data; // { users: {...}, events: {...} }
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    throw err;
  }
};

// -------------------- PROFILE --------------------
export const getProfile = async (id) => {
  const res = await axios.get(`${API_BASE}/profile/${id}`);
  return res.data.user;
};

export const updateProfile = async (id, updates) => {
  const res = await axios.put(`${API_BASE}/profile/${id}`, updates);
  return res.data.user;
};

// -------------------- ANALYTICS --------------------
export const getAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/analytics`);
  return res.data; // { summary, monthly }
};