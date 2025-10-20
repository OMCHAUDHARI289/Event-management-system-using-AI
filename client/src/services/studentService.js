import api from './api';

const BASE_URL = 'http://localhost:5000/api/student';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getMyProfile = async () => {
  const res = await api.get(`${BASE_URL}/me`, getAuthHeaders());
  return res.data;
};

export const getStudentEvents = async () => {
  const res = await api.get(`${BASE_URL}/events`);
  return res.data;
};

export const getMyEvents = async () => {
  const res = await api.get(`${BASE_URL}/my-events`, getAuthHeaders());
  return res.data;
};

// Get single event details (publicly available via admin events endpoint)
export const getEventById = async (id) => {
  const res = await api.get(`http://localhost:5000/api/admin/events/${id}`);
  return res.data;
};

// Register for event (authenticated student)
export const registerForEvent = async (id, payload = {}) => {
  const res = await api.post(`${BASE_URL}/events/${id}/register`, payload, getAuthHeaders());
  return res.data;
};

// Get ticket for an event
export const getEventTicket = async (id) => {
  const res = await api.get(`${BASE_URL}/events/${id}/ticket`, getAuthHeaders());
  return res.data;
};

