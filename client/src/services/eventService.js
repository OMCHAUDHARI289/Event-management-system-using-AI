import axios from 'axios';

const API_URL = 'http://localhost:5000/api/event';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getEvents = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createEvent = async (eventData) => {
  const res = await axios.post(API_URL, eventData);
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// ✅ Get single event by ID (for register page)
export const getEventById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// ✅ Register for event (Free or Paid)
// payload includes student details and optionally userId
export const registerForEvent = async (id, payload = {}) => {
  const res = await axios.post(`${API_URL}/${id}/register`, payload, getAuthHeaders());
  return res.data;
};

// confirm payment (for paid events)
export const confirmRegistrationPayment = async (registrationId, payload = {}) => {
  const res = await axios.post(`${API_URL}/registration/${registrationId}/confirm`, payload, getAuthHeaders());
  return res.data;
};
