import axios from 'axios';

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Optional: for sending cookies (if needed)
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    if (error.response?.status === 401) {
      // Optionally redirect to login
      // console.warn('Unauthorized. Redirecting...');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
