import axios from 'axios';

// Base URL for backend API. Prefer Vite env var VITE_API_BASE, fallback to localhost:5000
// In development, Vite serves the client on :5173; without a baseURL axios will send
// relative requests to the Vite server which causes 404s for /api/* routes.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://event-management-system-using-ai.onrender.com',
});

// Response interceptor: if a 401 is received, treat as session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      if (status === 401) {
        // Clear token and redirect to login
        try { localStorage.removeItem('token'); } catch (e) {}
        // Inform the user and redirect
        if (typeof window !== 'undefined') {
          // show message then redirect
          alert('Session expired. Please login again.');
          window.location.href = '/auth/login';
        }
      }
    } catch (e) {
      // swallow
    }
    return Promise.reject(error);
  }
);

export default api;
