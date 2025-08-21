import axios from 'axios';

// Determine the base URL based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? '/api' // Use proxy in development
  : 'https://your-production-api-url.com/api'; // Replace with your production API URL

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json'
  }
});

export const searchShareholders = async (name, page = 1, limit = 10) => {
  const timestamp = new Date().getTime();
  const response = await api.get(
    `/shareholders/search?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}&_t=${timestamp}`
  );
  return response.data;
};

export default api;
