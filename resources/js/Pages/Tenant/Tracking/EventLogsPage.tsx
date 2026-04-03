/**
 * EventLogsPage — Real-time Event Feed (Paginated & Filtered)
 * API: GET /api/tracking/dashboard/events/feed
 * Feature: 'logs' — Pro+ plan required
 */
import { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  Activity, Filter, RefreshCcw, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Copy as CopyIcon, Search, Clock,
} from "lucide-react";

const fetchEvents = async (params: Record<string, string | number>) => {
  try {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v !== 0).map(([k, v]) => [k, String(v)])
    ).toString();
    const { data } = await axios.get(`/api/tracking/dashboard/events/feed?${qs}`);
    return data;
  } catch { return { data: [], current_page: 1, last_page: 1 }; }
};

const statusBadge: Record<string, { color: string; bg: string; label: string }> = {
  processed: { color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Processed" },
  failed:    { color: "text-destructive",         bg: "bg-destructive/10",         label: "Failed" },
  deduped:   { color: "text-[hsl(38,92%,50%)]",  bg: "bg-[hsl(38,92%,50%)]/10",  label: "Deduped" },
  pending:   { color: "text-muted-foreground",    bg: "bg-muted/30",              label: "Pending" },
};

const EventLogsPage = () => {
  const { props } = usePage();
  const pageProps = props as any;
  const activeTenantId = pageProps.active_container_id;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ event_name: "", status: "", per_page: 25 });

  const { data: result, isLoading, refetch } = useQuery({
    queryKey: ["tracking-events", page, filters, activeTenantId],
    queryFn: () => fetchEvents({ ...filters, page, tenant_id: activeTenantId }),
    refetchInterval: 15_000,
  });

  const events = result?.data ?? [];
  const currentPage = result?.current_page ?? 1;
  const lastPage = result?.last_page ?? 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Event Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time event feed across all containers</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="gap-2 rounded-xl">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1 block">Event Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <input
                type="text"
                value={filters.event_name}
                onChange={(e) => { setFilters(p => ({ ...p, event_name: e.target.value })); setPage(1); }}
                placeholder="Search events..."
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="w-40">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">All</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
              <option value="deduped">Deduped</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-[hsl(160,84%,39%)]" />
            <span>Auto-refreshes every 15s</span>
          </div>
        </div>

        {/* Event Table */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Event</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Status</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Country</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Value</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Source IP</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.length > 0 ? events.map((evt: any) => {
                  const st = statusBadge[evt.status] || statusBadge.pending;
                  return (
                    <tr key={evt.id} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-medium text-card-foreground">{evt.event_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.color}`}>
                          {evt.status === "processed" && <CheckCircle2 className="h-3 w-3" />}
                          {evt.status === "failed" && <XCircle className="h-3 w-3" />}
                          {evt.status === "deduped" && <CopyIcon className="h-3 w-3" />}
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{evt.country || "—"}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-xs font-medium text-card-foreground">
                        {evt.value ? `$${evt.value}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{evt.source_ip || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {evt.processed_at ? new Date(evt.processed_at).toLocaleString() : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Activity className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No events found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here when your containers start tracking</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {currentPage} of {lastPage}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={currentPage >= lastPage} className="rounded-lg h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventLogsPage;
