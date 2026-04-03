import axios from "axios";

/** Inline auth token helper (was previously in api.ts) */
const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("auth_token");
    return token && token !== "undefined" && token !== "null" ? token : null;
};

/**
 * trackingApi — Centralized Axios instance for sGTM & Tracking Module.
 */
const trackingApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

trackingApi.interceptors.request.use(config => {
    if (typeof window === "undefined") return config;

    // ——————————————————————————————————————————————————————————————————————————————————————————————
    const token = getAuthToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    // ——————————————————————————————————————————————————————————————————————————————————————————————
    const xsrf = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

    if (xsrf) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);
    }

    return config;
});

// 401 handler
trackingApi.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const { fireAuthExpired } = await import("./tenantApi");
            fireAuthExpired();
        }
        return Promise.reject(error);
    }
);

export default trackingApi;

