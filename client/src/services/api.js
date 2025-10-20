import axios from 'axios';

const api = axios.create();

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
