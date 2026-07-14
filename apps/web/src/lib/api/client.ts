import axios, { AxiosError } from "axios";
import { config as envConfig } from "../../config/env";

const TOKEN_KEY = "flowboard_token";

export const client = axios.create({
  baseURL: envConfig.VITE_API_URL,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    // Network Offline / Timeout Error Handling
    if (!error.response) {
      console.error("🌐 [API Network Error]: Couldn't reach API server at", envConfig.VITE_API_URL);
      return Promise.reject(
        new Error("Network Error: Unable to reach TaskFlow server. Check your connection."),
      );
    }

    const { status, data } = error.response;

    // Automated 401 Token Expiry Handlers
    if (status === 401) {
      console.warn("⚠️ [Session Expired]: Revoking invalid JWT token and redirecting to /login.");
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    const errorMessage =
      data?.error ||
      data?.message ||
      error.message ||
      `API Request failed with status code ${status}`;

    return Promise.reject(new Error(errorMessage));
  },
);

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
