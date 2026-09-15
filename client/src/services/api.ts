import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://vroom-styles.onrender.com/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
});

export default api;