import axios from 'axios';

const getBaseURL = () => {
  // If running locally, default to the local backend to avoid connecting local client to production Render
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://interviewace-ai-1-hvjo.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token from localStorage into authorization headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interviewace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
