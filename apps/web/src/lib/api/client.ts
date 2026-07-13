import axios from "axios";

const TOKEN_KEY = "flowboard_token";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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
  (err) => {
    const message =
      err.response?.data?.error || err.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
