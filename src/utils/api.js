import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

export const searchShareholders = async (name) => {
  const timestamp = new Date().getTime();
  const response = await api.get(`/shareholders/search?name=${encodeURIComponent(name)}&_t=${timestamp}`);
  return response.data;
};

export default api;
