/**
 * DestinationsPage — Marketing Destination Management
 * API: GET /api/tracking/destinations/supported, GET /api/tracking/dashboard/platforms
 */
import { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  Layers, Plus, CheckCircle2, XCircle, Clock, AlertTriangle,
  Activity, ExternalLink, RefreshCcw, Settings, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const fetchPlatforms = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/platforms");
    return data.platforms ?? [];
  } catch { return []; }
};

const fetchContainers = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/containers");
    return data.containers ?? [];
  } catch { return []; }
};

const destinationTypes = [
  { id: "ga4", name: "Google Analytics 4", icon: "📊", color: "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5" },
  { id: "facebook", name: "Meta (Facebook CAPI)", icon: "📘", color: "from-[hsl(220,60%,50%)]/15 to-[hsl(220,60%,50%)]/5" },
  { id: "tiktok", name: "TikTok Events API", icon: "🎵", color: "from-[hsl(340,75%,55%)]/15 to-[hsl(340,75%,55%)]/5" },
  { id: "snapchat", name: "Snapchat CAPI", icon: "👻", color: "from-[hsl(45,93%,47%)]/15 to-[hsl(45,93%,47%)]/5" },
  { id: "twitter", name: "Twitter/X CAPI", icon: "🐦", color: "from-[hsl(200,70%,50%)]/15 to-[hsl(200,70%,50%)]/5" },
];

const statusMap: Record<string, { color: string; bg: string; label: string }> = {
  healthy: { color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Healthy" },
  degraded: { color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10", label: "Degraded" },
  down: { color: "text-destructive", bg: "bg-destructive/10", label: "Down" },
  unknown: { color: "text-muted-foreground", bg: "bg-muted/30", label: "Unknown" },
};

const DestinationsPage = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);

  const { data: platforms = [] } = useQuery({ queryKey: ["tracking-platforms"], queryFn: fetchPlatforms });
  const { data: containers = [] } = useQuery({ queryKey: ["tracking-containers"], queryFn: fetchContainers });

  const addMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/tracking/containers/${selectedContainer}/destinations`, { type: selectedType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-platforms"] });
      setShowAdd(false);
      setSelectedType(null);
      toast.success("Destination added!");
    },
    onError: () => toast.error("Failed to add destination"),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Destinations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage marketing platform connections
            </p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Add Destination
          </Button>
        </div>

        {/* Add Destination */}
        {showAdd && (
          <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm animate-fade-in">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Add New Destination</h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Container</label>
              <select
                value={selectedContainer ?? ""}
                onChange={(e) => setSelectedContainer(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Choose container...</option>
                {containers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {destinationTypes.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setSelectedType(dt.id)}
                  className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                    selectedType === dt.id
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-border hover:bg-accent/30"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${dt.color} text-lg`}>
                    {dt.icon}
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{dt.name}</span>
                  {selectedType === dt.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => addMutation.mutate()} disabled={!selectedContainer || !selectedType} className="rounded-xl gap-2">
                <Plus className="h-4 w-4" /> Add Destination
              </Button>
            </div>
          </div>
        )}

        {/* Platform Health Grid */}
        {platforms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {platforms.map((p: any, i: number) => {
              const st = statusMap[p.status] || statusMap.unknown;
              const dt = destinationTypes.find((d) => d.id === p.type);
              return (
                <div key={i} className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${dt?.color ?? "from-primary/15 to-primary/5"} text-lg transition-transform duration-300 group-hover:scale-110`}>
                        {dt?.icon ?? "📡"}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-card-foreground">{dt?.name ?? p.type}</h4>
                        <p className="text-[11px] text-muted-foreground">{p.container_name}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${st.bg} ${st.color}`}>{st.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className="text-sm font-bold text-card-foreground tabular-nums">{p.success_rate ?? "—"}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Success</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className="text-sm font-bold text-card-foreground tabular-nums">{p.avg_latency_ms ?? "—"}ms</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Latency</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className="text-sm font-bold text-card-foreground tabular-nums">{p.error_count_24h ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Errors 24h</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center animate-fade-in">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground">No Destinations</h3>
            <p className="text-sm text-muted-foreground mt-1">Add GA4, Meta CAPI, TikTok, or other destinations</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DestinationsPage;
