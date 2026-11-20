import axios from "axios";

/**
 * Paystack API Client instance.
 *
 * Authorization header is dynamically attached via request interceptor rather than
 * evaluated synchronously at module import time. This prevents application boot crashes
 * when starting in staging, CI, or local environments without third-party payment keys.
 */
const paystackApi = axios.create({
    baseURL: "https://api.paystack.co",
    timeout: 10000,
});

paystackApi.interceptors.request.use((config) => {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
        throw new Error("PAYSTACK_SECRET_KEY is not defined in the environment");
    }
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${key}`;
    config.headers["Content-Type"] = "application/json";
    return config;
});

export default paystackApi;