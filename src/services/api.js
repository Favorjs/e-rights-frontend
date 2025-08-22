import axios from 'axios';

// Determine the base URL based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
// Base URL configuration
let baseURL;
if (process.env.REACT_APP_API_URL) {
  baseURL = process.env.REACT_APP_API_URL;
} else if (isDevelopment) {
  baseURL = 'http://localhost:5000';
} else {
  baseURL = 'https://tip.apel.com.ng';
}

// API paths are prefixed with /api

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - please log in');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const searchShareholders = async (name, page = 1, limit = 10) => {
  const timestamp = new Date().getTime();
  const response = await api.get(
    `/api/shareholders/search?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}&_t=${timestamp}`
  );
  return response.data;
};

export default api;
