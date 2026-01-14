import axios, { AxiosError } from 'axios';

// Get API URL from environment or use default
// Backend can run on different ports (4000, 4001, 4002, etc.)
// Set VITE_API_URL in .env file to override
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Network error - backend not reachable
    if (!error.response) {
      console.error('Network error:', error);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const errorMessage = error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')
        ? `Cannot connect to backend server. Please make sure backend is running on ${apiUrl.replace('/api', '')}`
        : `Connection error: ${error.message || 'Please check if backend is running'}`;
      return Promise.reject({
        message: errorMessage,
        isNetworkError: true,
        originalError: error,
      });
    }

    const status = error.response.status;

    // Handle 401 - Unauthorized
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect and show message if not already on login page
      if (window.location.pathname !== '/login') {
        // Store message in sessionStorage to show on login page
        sessionStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login?sessionExpired=true';
      }
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
      });
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        status: 403,
      });
    }

    // Handle 404 - Not Found
    if (status === 404) {
      return Promise.reject({
        message: 'Resource not found.',
        status: 404,
      });
    }

    // Handle 409 - Conflict (User already exists)
    if (status === 409) {
      const errorData = error.response.data as any;
      return Promise.reject({
        message: errorData?.message || 'User with this email already exists. Please use a different email or login instead.',
        status: 409,
      });
    }

    // Handle 500 - Server Error
    if (status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status: status,
      });
    }

    // Handle validation errors (400)
    if (status === 400) {
      const errorData = error.response.data as any;
      return Promise.reject({
        message: errorData?.message || 'Invalid request. Please check your input.',
        status: 400,
        errors: errorData?.errors || null,
      });
    }

    // Default error handling
    const errorData = error.response.data as any;
    return Promise.reject({
      message: errorData?.message || error.message || 'An error occurred',
      status: status,
    });
  }
);
