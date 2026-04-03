/**
 * useTrackingData — Central hook for fetching sGTM tracking data from backend.
 *
 * Endpoints used:
 *   GET /api/tracking/containers              → list containers
 *   GET /api/tracking/containers/{id}/stats    → per-container stats
 *   GET /api/tracking/containers/{id}/analytics → analytics report
 *   GET /api/tracking/containers/{id}/usage/daily → daily usage
 *   GET /api/tracking/containers/{id}/health   → container health
 *   GET /api/tracking/power-ups                → power-up settings
 */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface TrackingContainer {
    id: number;
    name: string;
    config_id: string;
    region: string;
    status: "running" | "stopped" | "provisioning" | "error";
    docker_status?: "running" | "degraded" | "error" | "unknown";
    domain: string | null;
    docker_port?: number;
    sidecar_port?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface EventLog {
    id: number;
    event_name: string;
    event_type: string;
    method: string;
    status_code: number;
    latency_ms: number;
    user_agent: string;
    ip_address: string;
    created_at: string;
}

export interface ContainerStats {
    total_events_24h: number;
    events_forwarded: number;
    events_dropped: number;
    events_errors: number;
    uptime_percentage: number;
    avg_latency_ms: number;
}

export interface AnalyticsReport {
    period: { from: string; to: string };
    total_events: number;
    events_forwarded: number;
    events_dropped: number;
    events_errors: number;
    data_recovery: {
        percentage: number;
        events_recovered: number;
        estimated_blocked: number;
        status: string;
    };
    delivery_rate: {
        percentage: number;
        successful: number;
        failed: number;
        status: string;
    };
    health_score: {
        score: number;
        grade: string;
        factors: {
            delivery: number;
            error_rate: number;
            drop_rate: number;
            consistency: number;
        };
    };
    ad_blocker_impact: {
        estimated_blocked_percentage: number;
        estimated_events_saved: number;
        recommendation: string;
    };
    daily_breakdown: Array<{
        date: string;
        events_received: number;
        events_forwarded: number;
        events_dropped: number;
        events_errors: number;
    }>;
}

export interface DailyUsage {
    date: string;
    events_received: number;
    events_forwarded: number;
    events_dropped: number;
    events_errors: number;
}

export interface ContainerHealth {
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    cpu_percent: number;
    memory_mb: number;
    uptime_seconds: number;
    last_event_at: string | null;
}

export interface TrackingState {
    containers: TrackingContainer[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */

export function useTrackingData(): TrackingState {
    const [containers, setContainers] = useState<TrackingContainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContainers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get("/api/tracking/containers");
            if (res.data?.success) {
                setContainers(res.data.data ?? []);
            } else {
                setError(res.data?.message || "Failed to load containers");
            }
        } catch (err: any) {
            console.error("[Tracking] Failed to fetch containers:", err);
            setError(err?.response?.data?.message || "Could not load tracking data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContainers();
    }, [fetchContainers]);

    return { containers, isLoading, error, refetch: fetchContainers };
}

/* ── Per-container data fetchers ──────────────────────────────────────────── */

export async function fetchContainerStats(containerId: number): Promise<ContainerStats | null> {
    try {
        const res = await axios.get(`/api/tracking/containers/${containerId}/stats`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchContainerLogs(containerId: number): Promise<{ data: EventLog[] } | null> {
    try {
        const res = await axios.get(`/api/tracking/containers/${containerId}/logs`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchContainerAnalytics(
    containerId: number,
    from?: string,
    to?: string
): Promise<AnalyticsReport | null> {
    try {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const res = await axios.get(`/api/tracking/containers/${containerId}/analytics?${params}`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchDailyUsage(containerId: number): Promise<DailyUsage[]> {
    try {
        const res = await axios.get(`/api/tracking/containers/${containerId}/usage/daily`);
        return res.data?.success ? (res.data.data ?? []) : [];
    } catch {
        return [];
    }
}

export async function fetchContainerHealth(containerId: number): Promise<ContainerHealth | null> {
    try {
        const res = await axios.get(`/api/tracking/containers/${containerId}/health`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function createContainer(data: {
    name: string;
    config_id: string;
    region?: string;
}): Promise<TrackingContainer | null> {
    try {
        const res = await axios.post("/api/tracking/containers", data);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

/* ── Attribution & Compliance fetchers ────────────────────────────────────── */

export async function fetchAttribution(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/attribution/${containerId}`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchConversionPaths(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/attribution/${containerId}/paths`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchConsentStats(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/consent/${containerId}/stats`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchConsentBanner(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/consent/${containerId}/banner`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchSignalPipelines(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/signals/pipelines/${containerId}`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

export async function fetchChannelHealth(containerId: number) {
    try {
        const res = await axios.get(`/api/tracking/health/${containerId}/dashboard`);
        return res.data?.success ? res.data.data : null;
    } catch {
        return null;
    }
}

/* ── Dashboard-level API fetchers ──────────────────────────────────────────── */

/** GET /api/tracking/dashboard/overview */
export async function fetchDashboardOverview() {
    try {
        const res = await axios.get("/api/tracking/dashboard/overview");
        return res.data ?? null;
    } catch {
        return null;
    }
}

/** GET /api/tracking/dashboard/events/feed */
export async function fetchEventFeed(params?: {
    container_id?: number;
    event_name?: string;
    status?: string;
    from?: string;
    to?: string;
    per_page?: number;
    page?: number;
}) {
    try {
        const res = await axios.get("/api/tracking/dashboard/events/feed", { params });
        return res.data ?? null;
    } catch {
        return null;
    }
}

/** GET /api/tracking/dashboard/platforms */
export async function fetchDashboardPlatforms() {
    try {
        const res = await axios.get("/api/tracking/dashboard/platforms");
        return res.data?.platforms ?? [];
    } catch {
        return [];
    }
}

/** GET /api/tracking/dashboard/customers */
export async function fetchDashboardCustomers() {
    try {
        const res = await axios.get("/api/tracking/dashboard/customers");
        return res.data ?? null;
    } catch {
        return null;
    }
}

/** GET /api/tracking/dashboard/customers/{id} */
export async function fetchCustomerDetail(id: number) {
    try {
        const res = await axios.get(`/api/tracking/dashboard/customers/${id}`);
        return res.data ?? null;
    } catch {
        return null;
    }
}

/** GET /api/tracking/dashboard/containers */
export async function fetchDashboardContainers() {
    try {
        const res = await axios.get("/api/tracking/dashboard/containers");
        return res.data?.containers ?? [];
    } catch {
        return [];
    }
}

/** GET /api/tracking/dashboard/analytics?period=7d|30d|90d|custom */
export async function fetchDashboardAnalytics(period = "30d", from?: string, to?: string) {
    try {
        const params: Record<string, string> = { period };
        if (period === "custom" && from) params.from = from;
        if (period === "custom" && to) params.to = to;
        const res = await axios.get("/api/tracking/dashboard/analytics", { params });
        return res.data ?? null;
    } catch {
        return null;
    }
}

/** POST /api/tracking/identity/merge */
export async function mergeIdentity(data: { email?: string; phone?: string; external_id?: string }) {
    try {
        const res = await axios.post("/api/tracking/identity/merge", data);
        return res.data ?? null;
    } catch {
        return null;
    }
}
