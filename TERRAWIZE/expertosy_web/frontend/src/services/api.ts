import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);
    return {
      data: response.data,
      status: response.status
    };
  },
  
  post: async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
    return {
      data: response.data,
      status: response.status
    };
  }
};

export default api; 