/**
 * Strict Frontend Environment Validator.
 * Throws a runtime error if mandatory Vite environment variables are missing.
 */
const getRequired = (key: string): string => {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error(`[Frontend Config Error] Missing required environment variable: ${key}`);
  }
  return value.trim();
};

export const config = {
  VITE_API_URL: getRequired("VITE_API_URL"),
  VITE_SOCKET_URL: getRequired("VITE_SOCKET_URL"),
};
