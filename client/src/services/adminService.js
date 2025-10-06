import axios from "axios";

// Set your backend base URL
const API_BASE = "http://localhost:5000/api/admin"; // adjust as needed

// -------------------- MEMBERS --------------------

// Get all club members
export const getClubMembers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/members`);
    return res.data.members; // <- return array directly
  } catch (err) {
    console.error("Error fetching club members:", err);
    throw err;
  }
};


// Get all registered students
export const getStudents = async () => {
  try {
    const res = await axios.get(`${API_BASE}/students`);
    return res.data;
  } catch (err) {
    console.error("Error fetching students:", err);
    throw err;
  }
};

// Add a new member
export const addMember = async (memberData) => {
  // memberData = { fullName, email, password, role }
  try {
    const res = await axios.post(`${API_BASE}/members`, memberData);
    return res.data;
  } catch (err) {
    console.error("Error adding member:", err);
    throw err;
  }
};

// Promote a student to club member
export const promoteStudent = async (studentId, promotionData) => {
  // promotionData = { position, branch?, year? }
  try {
    const res = await axios.put(`${API_BASE}/students/${studentId}/promote`, promotionData);
    return res.data;
  } catch (err) {
    console.error("Error promoting student:", err);
    throw err;
  }
};

// Delete a club member
export const deleteMember = async (memberId) => {
  try {
    const res = await axios.delete(`${API_BASE}/members/${memberId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting member:", err);
    throw err;
  }
};
