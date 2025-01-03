const API_URL = process.env.REACT_APP_API_URL;

export const fetchData = async (endpoint: string) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}; 