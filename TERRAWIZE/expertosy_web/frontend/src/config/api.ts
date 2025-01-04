import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.expertosy.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': 'https://expertosy.com'
  },
  withCredentials: true,
  timeout: 60000,
  maxRedirects: 5
});

// Add request interceptor for CORS preflight
api.interceptors.request.use(
  config => {
    config.headers['Origin'] = 'https://expertosy.com';
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;