import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.expertosy.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin
  },
  withCredentials: true,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  }
});

// Add request interceptor to handle CORS preflight
api.interceptors.request.use((config) => {
  if (config.method === 'options') {
    config.headers['Access-Control-Request-Method'] = 'POST';
    config.headers['Access-Control-Request-Headers'] = 'content-type';
  }
  return config;
});

export default api; 