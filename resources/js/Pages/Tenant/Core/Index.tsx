/**
 * ============================================================================
 * sGTM Tracking Dashboard — Main Overview
 * ============================================================================
 * Uses the same design system as dashboard-builder-main:
 *   - MetricCard with animated counters & gradient icons
 *   - rounded-2xl cards with border-border/60
 *   - Recharts for sparklines/charts
 * 
 * API: GET /api/tracking/dashboard/overview
 * ============================================================================
 */
import { useState, useEffect } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import MetricCard from "@Tenant/components/dashboard/MetricCard";
import { useLanguage } from "@Tenant/hooks/useLanguage";
import { usePage } from "@inertiajs/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Server, Activity, Globe, AlertTriangle, Zap, BarChart3,
  ArrowRight, ExternalLink, Shield, Code, TrendingUp,
  CheckCircle2, XCircle, Clock, Layers, Database,
  HardDrive, Calendar, Bug, Star, ShieldCheck, FileCode, ShieldAlert, History, Box
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/** Fetch dashboard overview from backend API */
const fetchOverview = async (tenantId?: string) => {
  try {
    const url = tenantId 
        ? `/api/tracking/dashboard/overview?tenant_id=${tenantId}`
        : "/api/tracking/dashboard/overview";
    const { data } = await axios.get(url);
    return data;
  } catch {
    return null;
  }
};

const Index = () => {
  const { lang } = useLanguage();

  const { props } = usePage();
  const pageProps = props as any;
  const activeTenantId = pageProps.active_container_id;

  const { data: overview, isLoading } = useQuery({
    queryKey: ["tracking-overview", activeTenantId],
    queryFn: () => fetchOverview(activeTenantId),
    refetchInterval: 60_000, // refresh every minute
    enabled: !!activeTenantId || !pageProps.is_pixelmaster_model,
  });

  // Derive metrics from API data (with fallbacks for when backend isn't connected yet)
  const containers = overview?.containers ?? { total: 0, active: 0, k8s: 0, docker: 0 };
  const events24h = overview?.events_24h ?? { total: 0, processed: 0, failed: 0, deduped: 0, error_rate: 0 };
  const topEvents = overview?.top_events ?? [];
  const hourlySpark = overview?.hourly_sparkline ?? [];

  const metrics = [
    { title: "Active Containers", value: String(containers.active), change: 0, positive: true, icon: "building" },
    { title: "Events (24h)", value: events24h.total.toLocaleString(), change: 0, positive: true, icon: "trending-up" },
    { title: "Processed", value: events24h.processed.toLocaleString(), change: 0, positive: true, icon: "target" },
    { title: "Error Rate", value: `${events24h.error_rate}%`, change: events24h.error_rate, positive: events24h.error_rate < 5, icon: events24h.error_rate < 5 ? "trending-up" : "trending-down" },
  ];

  // Sparkline data for the hourly chart
  const sparklineData = hourlySpark.length > 0
    ? hourlySpark.map((count: number, i: number) => ({ hour: `${i}h`, events: count }))
    : Array.from({ length: 12 }, (_, i) => ({ hour: `${i}h`, events: 0 }));

  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header & Container Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Tracking Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Server-side tracking overview — containers, events, and health at a glance.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "overview" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "analytics" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Real-time Analytics
              </button>
            </div>

            {/* Container Switcher (Central Architecture) */}
            {pageProps.is_pixelmaster_model && pageProps.containers && pageProps.containers.length > 0 && (
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-border/60 shadow-sm max-w-[280px] sm:max-w-[320px]">
                <span className="text-xs font-semibold text-muted-foreground ml-2 hidden sm:inline-block">Workspace:</span>
                <select 
                  className="bg-slate-50 border-none text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer truncate w-full"
                  value={pageProps.active_container_id || ""}
                  onChange={(e) => {
                    window.location.href = `/dashboard?tenant_id=${e.target.value}`;
                  }}
                >
                  {pageProps.containers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, index) => (
                <div key={metric.title} style={{ animationDelay: `${index * 80}ms` }}>
                  <MetricCard {...metric} />
                </div>
              ))}
            </div>

            {/* Event Volume Sparkline + Top Events */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Hourly Event Volume */}
              <div className="xl:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-card-foreground">Event Volume (Last 12h)</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Hourly processed events</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        padding: "8px 12px",
                      }}
                    />
                    <Area type="monotone" dataKey="events" stroke="hsl(var(--primary))" fill="url(#areaGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Top Events */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in">
                <h3 className="text-base font-semibold text-card-foreground mb-4">Top Events (24h)</h3>
                <div className="space-y-3">
                  {topEvents.length > 0 ? topEvents.map((evt: any, i: number) => (
                    <div key={evt.event_name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-card-foreground">{evt.event_name}</span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground tabular-nums">{evt.count?.toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Activity className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No events yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Deploy a container to start tracking</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-150">
              <h3 className="text-base font-semibold text-card-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: Box, label: "New Container", desc: "Deploy sGTM container", href: "/containers" },
                  { icon: Globe, label: "Setup Domain", desc: "Configure tracking domain", href: "/domains" },
                  { icon: Code, label: "Get Embed Code", desc: "Install tracking snippet", href: "/embed" },
                  { icon: Zap, label: "Power-Ups", desc: "Enable enhancements", href: "/power-ups" },
                ].map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-xl border border-border/60 p-4 text-left hover:bg-accent/50 hover:border-border transition-all duration-200"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform duration-300 group-hover:scale-110">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Standard Tracking Power */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">Standard Power-Ups</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Custom Loader", icon: Code, color: "text-blue-500" },
                    { label: "Cookie Keeper", icon: Zap, color: "text-emerald-500" },
                    { label: "Bot Detection", icon: Bug, color: "text-purple-500" },
                    { label: "Ad Blocker Info", icon: Activity, color: "text-amber-500" },
                    { label: "PixelMaster Store", icon: Star, color: "text-indigo-500" },
                    { label: "POAS Data Feed", icon: BarChart3, color: "text-rose-500" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 transition-hover hover:border-border hover:bg-muted/50 cursor-default group">
                      <f.icon className={`h-4 w-4 ${f.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                      <span className="text-xs font-medium text-foreground/80">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elite Enterprise Features */}
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-250">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">Elite Enterprise Features</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Multi-zone Infra", icon: Globe, color: "text-sky-500" },
                    { label: "10 Days Logs", icon: History, color: "text-indigo-500" },
                    { label: "Cookie (Custom)", icon: ShieldCheck, color: "text-emerald-500" },
                    { label: "Multi Domains", icon: Layers, color: "text-teal-500" },
                    { label: "Monitoring", icon: Activity, color: "text-rose-500" },
                    { label: "File Proxy", icon: FileCode, color: "text-amber-500" },
                    { label: "Block Request", icon: ShieldAlert, color: "text-rose-600" },
                    { label: "Schedule", icon: Calendar, color: "text-violet-500" },
                    { label: "Request Delay", icon: Clock, color: "text-blue-600" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-primary/[0.02] border border-primary/5 transition-hover hover:border-primary/20 hover:bg-primary/[0.04]">
                      <f.icon className={`h-3.5 w-3.5 ${f.color}`} />
                      <span className="text-[10px] font-bold tracking-tight text-foreground/70 uppercase">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Container Health Summary */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-card-foreground">Container Health</h3>
                <a href="/containers" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {containers.total > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-[hsl(160,84%,39%)]/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)]" />
                      <span className="text-xs font-medium text-muted-foreground">Active</span>
                    </div>
                    <span className="text-2xl font-bold text-card-foreground">{containers.active}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-card-foreground">{containers.total}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-[hsl(280,68%,60%)]/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="h-4 w-4 text-[hsl(280,68%,60%)]" />
                      <span className="text-xs font-medium text-muted-foreground">Kubernetes</span>
                    </div>
                    <span className="text-2xl font-bold text-card-foreground">{containers.k8s}</span>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-[hsl(38,92%,50%)]/10 to-transparent p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Box className="h-4 w-4 text-[hsl(38,92%,50%)]" />
                      <span className="text-xs font-medium text-muted-foreground">Docker</span>
                    </div>
                    <span className="text-2xl font-bold text-card-foreground">{containers.docker}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-xl bg-muted/20">
                  <Server className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h4 className="text-sm font-semibold text-card-foreground">No containers yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Create your first sGTM container to start server-side tracking
                  </p>
                  <a href="/containers" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Box className="h-4 w-4" /> Create Container
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Metabase Analytics Tab */
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm animate-fade-in min-h-[700px] flex flex-col relative group">
            {pageProps.metabase?.full_embed ? (
              <iframe
                src={pageProps.metabase.full_embed}
                frameBorder="0"
                width="100%"
                height="800"
                allowTransparency
                className="w-full flex-grow rounded-2xl"
                title="Real-time Analytics"
              ></iframe>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Analyzing Data Streams</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Your enterprise dashboard is being connected to our global data warehouse. 
                  This usually takes a few minutes after the first tracking event is received.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Clock className="h-4 w-4" /> Check Status
                  </button>
                </div>
              </div>
            )}
            
            {/* Direct Link Info Overlay */}
            <div className="absolute bottom-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
              <a 
                href="/analytics" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white shadow-2xl"
              >
                Go to Dedicated Analytics View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
