import axios from 'axios';

// Determine the base URL based on the environment
let baseURL;

if (process.env.REACT_API_URL) {
  baseURL = process.env.REACT_API_URL;
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  baseURL = 'http://localhost:2500';
} else {
  // Use the current domain but replace the subdomain if needed
  baseURL = window.location.origin.replace('//vote.', '//api.');
}

// Create an axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: false // Explicitly set to false
});

// Remove or modify the request interceptor to avoid adding large headers
api.interceptors.request.use(
  (config) => {
    // Only add token if it exists and is reasonably small
    const token = localStorage.getItem('token');
    if (token && token.length < 1000) { // Basic size check
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove any potentially large headers
    delete config.headers['Cookie'];
    delete config.headers['cookie'];
    
    return config;
  },
  (error) => Promise.reject(error)
);

// API methods
export const searchShareholders = async (name, page = 1, limit = 10) => {
  const timestamp = new Date().getTime();
  const response = await api.get(
    `/api/shareholders/search?name=${name}&page=${page}&limit=${limit}&_t=${timestamp}`
  );
  return response.data;
};


export const getShareholderById = async (id) => {
  const response = await api.get(`/api/shareholders/${id}`);
  return response.data;
};

export const getStockbrokers = async () => {
  const response = await api.get('/api/forms/stockbrokers');
  return response.data;
};

export const submitRightsForm = async (formData) => {
  const response = await api.post('/api/forms/submit-rights', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const previewRightsForm = async (formData) => {
  const response = await api.post('/api/forms/preview-rights', formData, {
    responseType: 'blob'
  });
  return response.data;
};

// Admin API methods
export const getDashboardStats = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

export const getSubmissions = async (params = {}) => {
  const response = await api.get('/api/admin/submissions', { params });
  return response.data;
};

export const getRightsSubmissions = async (params = {}) => {
  const response = await api.get('/api/admin/rights-submissions', { params });
  return response.data;
};

export const getRightsSubmissionById = async (id) => {
  const response = await api.get(`/api/admin/rights-submissions/${id}`);
  return response.data;
};

export const exportSubmissions = async (params = {}) => {
  const response = await api.get('/api/admin/export', { 
    params,
    responseType: 'blob'
  });
  return response.data;
};

export const exportRightsSubmissions = async (params = {}) => {
  const response = await api.get('/api/admin/export-rights', { 
    params,
    responseType: 'blob'
  });
  return response.data;
};

// export const downloadFile = async (filePath) => {
//   const response = await api.get(`/uploads/${filePath}`, {
//     responseType: 'blob'
//   });
//   return response.data;
// };

// Add to api.js
export const downloadFileFromCloudinary = async (publicId, filename = null) => {
  const params = filename ? `?filename=${encodeURIComponent(filename)}` : '';
  const response = await api.get(`/api/forms/download-file/${publicId}${params}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const streamFileFromCloudinary = async (publicId, filename = null) => {
  const params = filename ? `?filename=${encodeURIComponent(filename)}` : '';
  const response = await api.get(`/api/forms/stream-file/${publicId}${params}`, {
    responseType: 'blob'
  });
  return response.data;
};



export default api;