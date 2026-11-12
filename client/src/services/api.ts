import axios from "axios";

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/$/, "");
    return url.endsWith("/api") ? url : `${url}/api`;
  }
  // Default to local server in development, fallback to production
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }
  return "https://vroom-styles.onrender.com/api";
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT authorization token into all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vroom_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Generate a cryptographically secure client idempotency key for mutating requests (orders, payments).
 */
export const createIdempotencyKey = (prefix = "req"): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

export default api;