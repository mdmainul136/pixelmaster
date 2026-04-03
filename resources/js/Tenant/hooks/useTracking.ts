import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useTracking = (isIor = false) => {
    const prefix = isIor ? "/api/ior/tracking" : "/api/tracking";
    const queryClient = useQueryClient();

    const useTrackingData = () => {
        return useQuery({
            queryKey: ["tracking", "containers", isIor],
            queryFn: async () => {
                const res = await axios.get(`${prefix}/containers`);
                return res.data?.data ?? [];
            },
        });
    }

    const useDashboardOverview = () => {
        return useQuery({
            queryKey: ["tracking", "dashboard", "overview", isIor],
            queryFn: async () => {
                const res = await axios.get(`${prefix}/dashboard/overview`);
                return res.data ?? null;
            },
        });
    }

    const useContainerStats = (containerId: number) => {
        return useQuery({
            queryKey: ["tracking", "containers", containerId, "stats", isIor],
            queryFn: async () => {
                const res = await axios.get(`${prefix}/containers/${containerId}/stats`);
                return res.data?.data ?? null;
            },
            enabled: !!containerId,
        });
    }

    const useCreateContainer = () => {
        return useMutation({
            mutationFn: async (data: { name: string; config_id: string; region?: string }) => {
                const res = await axios.post(`${prefix}/containers`, data);
                return res.data?.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["tracking", "containers", isIor] });
            }
        });
    }

    return {
        useTrackingData,
        useDashboardOverview,
        useContainerStats,
        useCreateContainer,
    };
};
