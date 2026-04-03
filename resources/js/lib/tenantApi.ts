import axios from "axios";
import { PROJECT_DOMAIN } from "./utils";

// In development/subdomain setup, we prefer relative URLs to maintain same-origin context.
// Only use VITE_API_URL if it's explicitly required for a cross-domain setup.
const API_URL = ""; 

const tenantApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Helper to get cookie value
const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

/**
 * Cookie domain helper.
 * Browsers reject cookies with domain=.localhost (public suffix),
 * so we omit the domain attribute in dev â€” cookie binds to exact hostname.
 * In production, we use the real domain (e.g. .zosair.com) for cross-subdomain sharing.
 */
const cookieDomain = () => {
    // For local development on *.localhost, we omit the domain attribute.
    // This makes the cookie host-only, binding it to growth-test.localhost.
    // This is safer and prevents browser rejection of domain=localhost.
    if (PROJECT_DOMAIN === ".localhost") {
        return "";
    }
    return `; domain=${PROJECT_DOMAIN}`;
};

/**
 * Standardized cookie helpers for cross-subdomain state
 */
export const setAuthCookie = (token: string) => {
    localStorage.setItem("auth_token", token);
    document.cookie = `x-auth-token=${token}; path=/; max-age=2592000${cookieDomain()}; SameSite=Lax`;
};

export const setOnboardedCookie = (status: boolean | string) => {
    document.cookie = `x-tenant-onboarded=${status}; path=/; max-age=31536000${cookieDomain()}; SameSite=Lax`;
};

/**
 * Clear all auth data (used on logout or 401)
 */
export const clearAuthData = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("tenant_id");
    if (typeof document !== "undefined") {
        // Clear with and without domain to handle any stale cookies
        document.cookie = `x-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `x-tenant-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (PROJECT_DOMAIN !== ".localhost") {
            document.cookie = `x-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${PROJECT_DOMAIN}`;
            document.cookie = `x-tenant-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${PROJECT_DOMAIN}`;
        }
    }
};

/**
 * Debounce flag to prevent multiple 401 handlers from firing simultaneously
 */
let _authExpiredFired = false;
export const fireAuthExpired = (url?: string) => {
    if (_authExpiredFired) return;
    if (typeof window === "undefined") return;
    
    const path = window.location.pathname;
    
    // 1. Critical Prevention: Don't logout if we are on auth pages
    if (path.includes("/auth") || path.includes("/onboarding")) return;

    // 2. Resilience: Don't logout if the 401 came from a public-ish or non-critical route
    // This prevents one bad tracking call from killing the whole session.
    if (url && (
        url.includes("/api/store/settings") || 
        url.includes("/api/themes/config/history") ||
        url.includes("/api/themes") ||
        url.includes("/api/public/")
    )) {
        console.warn(`[Auth] 401 on non-critical route: ${url}. Skipping full logout.`);
        return;
    }

    console.error(`[Auth] Session Expired! Triggered by: ${url || "Unknown"}`);
    _authExpiredFired = true;
    clearAuthData();
    window.dispatchEvent(new CustomEvent("auth:expired"));
    setTimeout(() => { _authExpiredFired = false; }, 5000);
};

// Add a request interceptor to attach the token and tenant ID
tenantApi.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            // 1. Attach Auth Token (Check localStorage, then Cookie)
            let token = localStorage.getItem("auth_token");
            if (token === "undefined" || token === "null") {
                token = null;
                localStorage.removeItem("auth_token");
            }

            if (!token) {
                token = getCookie("x-auth-token") || null;
                if (token === "undefined" || token === "null") token = null;

                if (token) {
                    // Sync back to localStorage for performance/consistency
                    localStorage.setItem("auth_token", token);
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // 2. Attach Tenant ID from subdomain
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            let tenantId = null;

            if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
                tenantId = parts[0];
            } else {
                // Fallback for localhost/development: check localStorage
                tenantId = localStorage.getItem("tenant_id");
            }

            if (tenantId) {
                config.headers['X-Tenant-ID'] = tenantId;
            }

            // IOR path rewriting removed — sGTM platform uses direct paths
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Response Interceptor â€” Quota Awareness
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reads X-Quota-Warning / X-Quota-Usage / X-Quota-Limit headers
// from every response and dispatches window events for React hooks.

export interface QuotaState {
    level: "normal" | "approaching" | "critical" | "blocked";
    usageGb: number | null;
    limitGb: number | null;
    percentage: number | null;
}

let _quotaState: QuotaState = {
    level: "normal",
    usageGb: null,
    limitGb: null,
    percentage: null,
};

export const getQuotaState = (): QuotaState => ({ ..._quotaState });

tenantApi.interceptors.response.use(
    (response) => {
        // Extract quota headers from every response
        const warning = response.headers["x-quota-warning"] as string | undefined;
        const usage = parseFloat(response.headers["x-quota-usage"] || "");
        const limit = parseFloat(response.headers["x-quota-limit"] || "");

        if (warning || !isNaN(usage)) {
            _quotaState = {
                level: (warning as QuotaState["level"]) || "normal",
                usageGb: isNaN(usage) ? null : usage,
                limitGb: isNaN(limit) ? null : limit,
                percentage: (!isNaN(usage) && !isNaN(limit) && limit > 0)
                    ? Math.round((usage / limit) * 100)
                    : null,
            };

            // Dispatch custom event so React hooks can react
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("quota-warning", { detail: _quotaState })
                );
            }
        }

        return response;
    },
    (error) => {
        // Handle 401 â€” Unauthorized
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const failedUrl = error.config?.url || "unknown";
            fireAuthExpired(failedUrl);
        }

        // Handle 402 â€” Standard "Payment Required" OR "Quota Blocked"
        if (error.response?.status === 402) {
            const data = error.response.data;

            if (data?.payment_required) {
                // Payment lock
                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("payment-required", { detail: data })
                    );
                }
            } else {
                // Legacy Quota block
                _quotaState = { level: "blocked", usageGb: null, limitGb: null, percentage: 100 };
                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("quota-warning", { detail: _quotaState })
                    );
                }
            }
        }
        return Promise.reject(error);
    }
);

export const registerTenant = async (data: any) => {
    const response = await tenantApi.post("/api/v1/tenants/register", data);
    return response.data;
};

export const login = async (data: any) => {
    const response = await tenantApi.post("/api/v1/auth/login", data);
    if (response.data.success && response.data.data.token) {
        setAuthCookie(response.data.data.token);
    }
    return response.data;
};

export const register = async (data: any) => {
    const response = await tenantApi.post("/api/v1/auth/register", data);
    if (response.data.success && response.data.data.token) {
        setAuthCookie(response.data.data.token);
    }
    return response.data;
};

export const logout = async () => {
    try {
        await tenantApi.post("/api/v1/auth/logout");
    } finally {
        clearAuthData();
    }
};

export const getMe = async () => {
    const response = await tenantApi.get("/api/v1/auth/me");
    return response.data;
};

export const checkProvisioningStatus = async (tenantId: string) => {
    const response = await tenantApi.get(`/api/v1/tenants/${tenantId}/status`);
    return response.data;
};

export const checkAvailability = async (tenantId: string) => {
    const response = await tenantApi.get(`/api/v1/tenants/check-availability?tenant_id=${tenantId}`);
    return response.data;
};

export const getRegionStats = async () => {
    const response = await tenantApi.get("/api/v1/regions/stats");
    return response.data;
};

export const getRegionTenants = async (regionId: string) => {
    const response = await tenantApi.get(`/api/v1/regions/${regionId}/tenants`);
    return response.data;
};

export const getCurrentTenant = async () => {
    const response = await tenantApi.get("/api/v1/tenants/current");
    return response.data;
};

export const syncBlueprint = async (planLevel: string) => {
    const response = await tenantApi.post("/api/v1/modules/sync-blueprint", {
        plan_level: planLevel
    });
    return response.data;
};

export const getTenantFeatures = async () => {
    const response = await tenantApi.get("/api/v1/tenant/features");
    return response.data;
};

export const getSubscriptionStatus = async () => {
    const response = await tenantApi.get("/api/v1/subscriptions/status");
    return response.data;
}; export const getPublicPlans = async () => {
    const response = await tenantApi.get("/api/v1/public/plans");
    return response.data;
};

export const getTenantConfig = async () => {
    const response = await tenantApi.get("/api/v1/tenant/config");
    return response.data;
};

export const getModuleGraph = async () => {
    const response = await tenantApi.get("/api/v1/admin/modules/graph");
    return response.data;
};

export const subscribeModule = async (slug: string) => {
    const response = await tenantApi.post(`/api/v1/modules/${slug}/subscribe`);
    return response.data;
};

export const unsubscribeModule = async (slug: string) => {
    const response = await tenantApi.post("/api/v1/modules/unsubscribe", { slug });
    return response.data;
};

export const getTenantModules = async () => {
    const response = await tenantApi.get("/api/v1/tenant/modules");
    return response.data;
};

export const getAiRecommendations = async () => {
    const response = await tenantApi.get("/api/v1/ai/recommendations");
    return response.data;
};

export const getDatabaseAnalytics = async () => {
    const response = await tenantApi.get("/api/v1/database/analytics");
    return response.data;
};

export const getDatabaseTables = async () => {
    const response = await tenantApi.get("/api/v1/database/tables");
    return response.data;
};

export const getDatabaseGrowth = async (days: number = 30) => {
    const response = await tenantApi.get(`/api/v1/database/growth?days=${days}`);
    return response.data;
};

// Admin & Tenancy Management
export const getAllTenantsStats = async () => {
    const response = await tenantApi.get("/api/v1/tenants");
    return response.data;
};

export const getTenantStats = async (id: string) => {
    const response = await tenantApi.get(`/api/v1/tenants/${id}/stats`);
    return response.data;
};

export const upgradeTenantPlan = async (id: string, plan: string) => {
    const response = await tenantApi.post(`/api/v1/tenants/${id}/upgrade`, { plan });
    return response.data;
};

export const setCustomQuota = async (id: string, gb: number) => {
    const response = await tenantApi.post(`/api/v1/tenants/${id}/quota`, { gb });
    return response.data;
};

export const addCustomDomain = async (id: string, domain: string) => {
    const response = await tenantApi.post(`/api/v1/domains`, { domain, tenant_id: id });
    return response.data;
};

export const removeCustomDomain = async (id: string, domain: string) => {
    const response = await tenantApi.delete(`/api/v1/domains/${domain}`, { data: { tenant_id: id } });
    return response.data;
};

export const updateTenantSettings = async (data: any) => {
    const response = await tenantApi.put("/api/v1/tenant/settings", data);
    return response.data;
};

export const updateUser = async (id: string | number, data: any) => {
    const response = await tenantApi.put(`/api/v1/users/${id}`, data);
    return response.data;
};

// â”€â”€ Notification Preferences â”€â”€
export interface NotificationPrefs {
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
    security_alerts: boolean;
    weekly_reports: boolean;
    campaign_analytics: boolean;
}

export const getNotificationPreferences = async () => {
    const response = await tenantApi.get("/api/v1/notification-preferences");
    return response.data;
};

export const updateNotificationPreferences = async (data: Partial<NotificationPrefs>) => {
    const response = await tenantApi.put("/api/v1/notification-preferences", data);
    return response.data;
};

export const toggleNotificationPreference = async (key: keyof NotificationPrefs) => {
    const response = await tenantApi.post("/api/v1/notification-preferences/toggle", { key });
    return response.data;
};

// â”€â”€ User & Staff Management â”€â”€
export const getUsers = async (params: any = {}) => {
    const response = await tenantApi.get("/api/v1/users", { params });
    return response.data;
};

export const getUser = async (id: string | number) => {
    const response = await tenantApi.get(`/api/v1/users/${id}`);
    return response.data;
};

export const createUser = async (data: any) => {
    const response = await tenantApi.post("/api/v1/users", data);
    return response.data;
};

export const deleteUser = async (id: string | number) => {
    const response = await tenantApi.delete(`/api/v1/users/${id}`);
    return response.data;
};

export const getUserMeta = async () => {
    const response = await tenantApi.get("/api/v1/users/meta");
    return response.data;
};

// â”€â”€ Branch Management â”€â”€
export const getBranches = async () => {
    const response = await tenantApi.get("/api/v1/branches");
    return response.data;
};

// â”€â”€ Security & 2FA â”€â”€
export const changePassword = async (data: any) => {
    const response = await tenantApi.post("/api/v1/super-admin/change-password", data);
    return response.data;
};

export const setup2FA = async () => {
    const response = await tenantApi.post("/api/v1/super-admin/2fa/setup");
    return response.data;
};

export const verify2FA = async (data: { secret: string; code: string }) => {
    const response = await tenantApi.post("/api/v1/super-admin/2fa/verify", data);
    return response.data;
};

export const disable2FA = async () => {
    const response = await tenantApi.post("/api/v1/super-admin/2fa/disable");
    return response.data;
};

export default tenantApi;

