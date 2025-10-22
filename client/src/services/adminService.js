import axios from 'axios';
import api from './api';

// Base URL for admin APIs
const API_BASE = "http://localhost:5000/api/admin"; // adjust if needed

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// -------------------- USERS / MEMBERS --------------------

// Get all club members
export const getClubMembers = async () => {
  try {
    const res = await api.get(`${API_BASE}/members`, getAuthHeaders());
    return res.data.members; // array of members
  } catch (err) {
    console.error("Error fetching club members:", err);
    throw err;
  }
};

// Get all students
export const getStudents = async () => {
  try {
    const res = await api.get(`${API_BASE}/students`, getAuthHeaders());
    return res.data.students; // array of students
  } catch (err) {
    console.error("Error fetching students:", err);
    throw err;
  }
};

// Add a new member/student
export const addMember = async (memberData) => {
  try {
    const res = await axios.post(`${API_BASE}/members`, memberData);
    return res.data.user;
  } catch (err) {
    console.error("Error adding member:", err);
    throw err;
  }
};

// Promote student to club member
export const promoteStudent = async (studentId, promotionData) => {
  try {
    const res = await axios.put(`${API_BASE}/students/${studentId}/promote`, promotionData);
    return res.data.user;
  } catch (err) {
    console.error("Error promoting student:", err);
    throw err;
  }
};



// Delete a club member
export const deleteClubMember = async (memberId) => {
  const res = await axios.delete(`${API_BASE}/members/${memberId}`);
  return res.data;
};

// Delete a student
export const deleteStudent = async (studentId) => {
  const res = await axios.delete(`${API_BASE}/students/${studentId}`);
  return res.data;
};


// Get profile
export const getProfile = async (id) => {
  const res = await axios.get(`${API_BASE}/profile/${id}`);
  return res.data.user;
};

// Update profile
export const updateProfile = async (id, updates) => {
  const res = await axios.put(`${API_BASE}/profile/${id}`, updates);
  return res.data.user;
};

// -------------------- EVENTS --------------------

// Get all events
export const getEvents = async () => {
  const res = await api.get(`${API_BASE}/events`, getAuthHeaders());
  return res.data;
};

// Get event by ID
export const getEventById = async (id) => {
  const res = await api.get(`${API_BASE}/events/${id}`, getAuthHeaders());
  return res.data;
};


// Get event registrations
export const getEventRegistrations = async (eventId) => {
  try {
    const res = await axios.get(`${API_BASE}/events/${eventId}/registrations`, getAuthHeaders());
    // Server returns either an array (registrations) or an object; normalize to an array
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.registrations)) return res.data.registrations;
    // fallback: if data is an object with other keys, try to find an array value
    if (res.data && typeof res.data === 'object') {
      const arr = Object.values(res.data).find(v => Array.isArray(v));
      if (Array.isArray(arr)) return arr;
    }
    return [];
  } catch (err) {
    console.error('Error fetching event registrations:', err);
    throw err;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  const res = await api.post(`${API_BASE}/events`, eventData, getAuthHeaders());
  return res.data;
};

// Update an existing event
export const updateEvent = async (eventId, updates) => {
  try {
    const res = await api.put(`${API_BASE}/events/${eventId}`, updates, getAuthHeaders());
    return res.data;
  } catch (err) {
    console.error("Error updating event:", err);
    throw err;
  }
};


// Delete an event
export const deleteEvent = async (eventId) => {
  const res = await api.delete(`${API_BASE}/events/${eventId}`, getAuthHeaders());
  return res.data;
};

// Register for an event
export const registerForEvent = async (eventId, registrationData) => {
  const res = await axios.post(`${API_BASE}/events/${eventId}/register`, registrationData);
  return res.data;
};

// Get events registered by logged-in student
export const getMyEvents = async () => {
  // student 'my-events' lives under /api/student and is protected
  const res = await axios.get(`http://localhost:5000/api/student/my-events`, getAuthHeaders());
  return res.data; // { upcoming, ongoing, completed, cancelled }
};

// -------------------- DASHBOARD / ANALYTICS --------------------

// Get admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats`); // matches backend
    return res.data;
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return null;
  }
};

// Get event registrations stats
export const getEventRegistrationsStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/event-registrations`);
    return res.data.monthly;
  } catch (err) {
    console.error("Error fetching event registrations stats:", err);
    return [];
  }
};

// Get quick stats (active users, completed events, pending approvals)
export const getQuickStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/quick-stats`);
    return res.data; // { activeUsers, completedEvents, pendingApprovals }
  } catch (err) {
    console.error("Error fetching quick stats:", err);
    return { activeUsers: 0, completedEvents: 0, pendingApprovals: 0 };
  }
};

// Fetch recent activity
export const getRecentActivity = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/recent-activity`);
    return data; // array of recent activity objects
  } catch (err) {
    console.error("Recent activity error:", err);
    return [];
  }
};

// Get analytics data
export const getAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/analytics`);
  return res.data; // { summary, monthly }
};

// Upload event image
// Upload event image
export const uploadEventImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      `${API_BASE}/upload-event-image`,
      formData,
      {
        headers: {
          // Let the browser/axios set Content-Type with the proper boundary
          ...(getAuthHeaders().headers || {}),
        },
      }
    );

    // server returns `imageUrl` (or older `url`); accept either
    return res.data.imageUrl || res.data.url || null; // Cloudinary URL
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};

// Mark attendance for a registration
export const markAttendance = async (ticketNumber) => {
  try {
    const res = await axios.post(
      `${API_BASE}/attendance`,
      { ticketNumber },
      getAuthHeaders()
    );
    return res.data;
  } catch (err) {
    // Log server response body if available to help debug 500 errors
    if (err && err.response && err.response.data) {
      console.error('Error marking attendance - server response:', err.response.data);
    } else {
      console.error('Error marking attendance:', err);
    }
    throw err;
  }
};




