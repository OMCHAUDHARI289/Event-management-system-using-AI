import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/student';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyProfile = async () => {
  const res = await axios.get(`${BASE_URL}/me`, { headers: getAuthHeaders() });
  return res.data;
};

export const getStudentEvents = async () => {
  const res = await axios.get(`${BASE_URL}/events`);
  return res.data;
};

export const getMyEvents = async () => {
  const res = await axios.get(`${BASE_URL}/my-events`, { headers: getAuthHeaders() });
  return res.data;
};


