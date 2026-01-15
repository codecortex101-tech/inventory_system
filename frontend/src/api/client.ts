import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject({
        message: "Backend unreachable",
        originalError: error
      });
    }

    const status = error.response.status;
    const data: any = error.response.data;

    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject({
      message: data?.message || error.message,
      status
    });
  }
);
