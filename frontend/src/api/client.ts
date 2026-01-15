import axios, { AxiosError } from 'axios';

/**
 * IMPORTANT (DO NOT CHANGE):
 * Vercel ENV NAME  : VITE_API_BASE_URL
 * Example value   : https://inventory-backend-updated.onrender.com/api
 */

// 🚨 HARD REQUIRE — NO FALLBACKS ALLOWED
const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) {
  throw new Error(
    '❌ VITE_API_BASE_URL is NOT defined. Check Vercel Environment Variables.'
  );
}

console.log('✅ API BASE URL (BUILD TIME):', API_URL);

// Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// =======================
// REQUEST INTERCEPTOR
// =======================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =======================
// RESPONSE INTERCEPTOR
// =======================
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 🔴 BACKEND UNREACHABLE (CORS / NETWORK / DNS)
    if (!error.response) {
      return Promise.reject({
        message: `Cannot connect to backend server. Backend URL: ${API_URL.replace(
          '/api',
          ''
        )}`,
        isNetworkError: true,
        originalError: error,
      });
    }

    const status = error.response.status;
    const data: any = error.response.data;

    // 🔐 UNAUTHORIZED
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login?sessionExpired=true';
      }

      return Promise.reject({
        message: 'Session expired. Please login again.',
        status,
      });
    }

    // ⛔ FORBIDDEN
    if (status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        status,
      });
    }

    // ❓ NOT FOUND
    if (status === 404) {
      return Promise.reject({
        message: 'Resource not found.',
        status,
      });
    }

    // ⚠️ CONFLICT
    if (status === 409) {
      return Promise.reject({
        message: data?.message || 'Conflict error.',
        status,
      });
    }

    // 💥 SERVER ERROR
    if (status >= 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status,
      });
    }

    // ❌ VALIDATION ERROR
    if (status === 400) {
      return Promise.reject({
        message: data?.message || 'Invalid request.',
        status,
        errors: data?.errors || null,
      });
    }

    // 🔚 DEFAULT
    return Promise.reject({
      message: data?.message || error.message || 'An error occurred',
      status,
    });
  }
);
);
