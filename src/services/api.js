import axios from 'axios';

const getBaseURL = () => {
  // If running locally (localhost or LAN IP like 192.168.x.x / 10.x.x.x),
  // always point to the local backend server to avoid hitting the production URL
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
    if (isLocal) {
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

// Convert generic network errors into descriptive messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      const enriched = new Error(
        'Cannot connect to the server. Please check your internet connection or ensure the backend server is running.'
      );
      enriched.code = 'ERR_NETWORK';
      enriched.isNetworkError = true;
      return Promise.reject(enriched);
    }
    return Promise.reject(error);
  }
);

// Fire an immediate, non-blocking background ping to wake up the backend server (e.g. Render free tier cold-start)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const healthUrl = getBaseURL().replace(/\/api$/, '') + '/health';
    axios.get(healthUrl, { timeout: 15000 }).catch(() => {
      // Ignore background ping errors silently
    });
  }, 100);
}

export default API;

