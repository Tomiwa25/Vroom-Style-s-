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

// Automatically evict expired JWT tokens upon 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = String(error.config?.url || "");
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/verify-otp");

      // Don't auto-evict on credential errors during sign-in attempts
      if (!isAuthEndpoint) {
        try {
          localStorage.removeItem("vroom_token");
          localStorage.removeItem("vroom_user");
        } catch {
          // Ignore localStorage access errors in private browsing modes
        }
        window.dispatchEvent(new CustomEvent("vroom:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

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