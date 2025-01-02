import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.expertosy.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle CORS
api.interceptors.request.use(
  (config) => {
    // Don't add Origin header in request - let browser handle it
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error occurred:', error);
      error.message = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.response) {
      console.error('Server error:', error.response.data);
      error.message = error.response.data.error || 'An error occurred while processing your request.';
    } else {
      console.error('Unexpected error:', error);
      error.message = 'An unexpected error occurred. Please try again.';
    }
    return Promise.reject(error);
  }
);

export default api; 