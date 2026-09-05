import axios from 'axios';

// Base API instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important if we ever switch to cookies, currently we use Bearer tokens
});

// Add a request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostelos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401s (Unauthorized / Token expired)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and force reload to kick user to login page
      // But only if we aren't already on the login page
      if (window.location.pathname !== '/') {
        localStorage.removeItem('hostelos_token');
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);
