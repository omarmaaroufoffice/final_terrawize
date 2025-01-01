import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://api.expertosy.com';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default api; 