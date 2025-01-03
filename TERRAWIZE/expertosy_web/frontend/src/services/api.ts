import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.expertosy.com';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin
  },
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  }
});

// Add request interceptor to handle CORS preflight
axiosInstance.interceptors.request.use((config) => {
  if (config.method === 'options') {
    config.headers['Access-Control-Request-Method'] = 'POST';
    config.headers['Access-Control-Request-Headers'] = 'content-type';
  }
  return config;
});

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.get(endpoint);
    return {
      data: response.data,
      status: response.status
    };
  },
  
  post: async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post(endpoint, data);
    return {
      data: response.data,
      status: response.status
    };
  }
};

export default api; 