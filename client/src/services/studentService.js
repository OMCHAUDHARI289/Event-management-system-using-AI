import api from './api'; // your axios instance

const STUDENT_BASE = 'http://localhost:5000/api/student';
const ADMIN_BASE = 'http://localhost:5000/api/admin';
const AI_BASE = 'http://localhost:5000/api/ai';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Get current logged-in student's profile
export const getMyProfile = async () => {
  const res = await api.get(`${STUDENT_BASE}/me`, getAuthHeaders());
  return res.data; // { id, name, email, role }
};

// Get a single event (uses admin public endpoint)
export const getEventById = async (id) => {
  const res = await api.get(`${ADMIN_BASE}/events/${id}`);
  return res.data;
};

// Register for an event (student)
export const registerForEvent = async (eventId, payload) => {
  const res = await api.post(`${STUDENT_BASE}/events/${eventId}/register`, payload, getAuthHeaders());
  return res.data; // { message, registrationId, ticketNumber }
};

// Get events for logged-in student
export const getMyEvents = async () => {
  const res = await api.get(`${STUDENT_BASE}/my-events`, getAuthHeaders());
  return res.data; // grouped object { upcoming, ongoing, completed, cancelled }
};

// Get public list of events for students
export const getStudentEvents = async () => {
  const res = await api.get(`${STUDENT_BASE}/events`);
  return res.data; // array of events
};

// Get ticket for a registration/event
export const getTicket = async (eventId) => {
  const res = await api.get(`${STUDENT_BASE}/events/${eventId}/ticket`, getAuthHeaders());
  return res.data;
};

// Submit feedback for a registration
export const submitEventFeedback = async (registrationId, payload) => {
  const res = await api.post(`${STUDENT_BASE}/registrations/${registrationId}/feedback`, payload, getAuthHeaders());
  return res.data; // { message, feedback }
};
