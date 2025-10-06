import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const registerUser = async (formData) => {
  const response = await axios.post(`${API_URL}/register`, formData);
  return response.data;
};

export const loginUser = async (formData) => {
  const response = await axios.post(`${API_URL}/login`, formData);
  return response.data;
};

export const sendCustomEmail = async ({ to, subject, content, isHtml = true }) => {
  const response = await axios.post(`${API_URL}/send-email`, { to, subject, content, isHtml });
  return response.data;
};