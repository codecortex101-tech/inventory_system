import axios, { AxiosError } from 'axios';

/**
 * IMPORTANT:
 * Vercel ENV = VITE_API_BASE_URL
 * Render backend = https://inventory-backend-updated.onrender.com/api
 */
const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 🔴 Backend unreachable
    if (!error.response) {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:4000/api';

      return Promise.reject({
        message: `Cannot connect to backend server. Please make sure backend is running on ${apiUrl.replace('/api', '')}`,
        isNetworkError: true,
      });
    }

    const status = error.response.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login?sessionExpired=true';
      }

      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
      });
    }

    if (status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        status: 403,
      });
    }

    if (status === 404) {
      return Promise.reject({
        message: 'Resource not found.',
        status: 404,
      });
    }

    if (status === 409) {
      const data: any = error.response.data;
      return Promise.reject({
        message: data?.message || 'Conflict error.',
        status: 409,
      });
    }

    if (status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status,
      });
    }

    if (status === 400) {
      const data: any = error.response.data;
      return Promise.reject({
        message: data?.message || 'Invalid request.',
        status: 400,
        errors: data?.errors || null,
      });
    }

    const data: any = error.response.data;
    return Promise.reject({
      message: data?.message || error.message || 'An error occurred',
      status,
    });
  }
);
