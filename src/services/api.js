import axios from 'axios';
import { currentConfig } from '../config/config';

// Base URL configuration
const baseURL = currentConfig.apiUrl;

console.log('API Base URL:', baseURL);
console.log('Environment:', currentConfig.environment);

// API paths are prefixed with /api

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (currentConfig.environment === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (currentConfig.environment === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging for production debugging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    // Handle common errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      console.error('Unauthorized access - please log in');
    }
    
    // Handle CORS errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network error - check if server is running and CORS is configured correctly');
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
