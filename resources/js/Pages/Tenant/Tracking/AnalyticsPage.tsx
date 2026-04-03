/**
 * AnalyticsPage — Time-Series Tracking Analytics
 * API: GET /api/tracking/dashboard/analytics
 */
import { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";
import { Badge } from "@Tenant/components/ui/badge";
import {
  BarChart3, TrendingUp, Users, Globe, DollarSign, Activity,
  Calendar, ArrowUp, ArrowDown, Terminal, Zap, ShieldCheck, RefreshCcw,
  AlertCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const fetchAnalytics = async (period: string, tenantId?: string) => {
  try {
    const url = `/api/tracking/dashboard/analytics?period=${period}${tenantId ? `&tenant_id=${tenantId}` : ""}`;
    const { data } = await axios.get(url);
    return data;
  } catch { return null; }
};

const fetchHealth = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/health/shared");
    return data.data;
  } catch { return null; }
};

const periods = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
];

const COUNTRY_COLORS = [
  "hsl(var(--primary))", "hsl(160,84%,39%)", "hsl(38,92%,50%)",
  "hsl(280,68%,60%)", "hsl(210,70%,50%)", "hsl(340,75%,55%)",
  "hsl(190,70%,42%)", "hsl(250,60%,55%)", "hsl(170,65%,40%)", "hsl(45,93%,47%)",
];

const AnalyticsPage = () => {
  const { props } = usePage();
  const pageProps = props as any;
  const activeTenantId = pageProps.active_container_id;

  const [period, setPeriod] = useState("30d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["tracking-analytics", period, activeTenantId],
    queryFn: () => fetchAnalytics(period, activeTenantId),
    refetchInterval: 300_000,
  });

  const { data: health } = useQuery({
    queryKey: ["infra-health"],
    queryFn: fetchHealth,
    refetchInterval: 60_000,
  });

  const daily = analytics?.daily ?? [];
  const byRevenue = analytics?.by_revenue ?? [];
  const ltv = analytics?.ltv ?? {};
  const byCountry = analytics?.by_country ?? [];

  const ltvCards = [
    { title: "Avg LTV", value: `$${(ltv.avg_ltv ?? 0).toFixed(0)}`, icon: DollarSign },
    { title: "Max LTV", value: `$${(ltv.max_ltv ?? 0).toFixed(0)}`, icon: TrendingUp },
    { title: "Avg Orders", value: String((ltv.avg_orders ?? 0).toFixed(1)), icon: Activity },
    { title: "Total Customers", value: (ltv.total_customers ?? 0).toLocaleString(), icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Shopify-Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
              {health && (
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  health.status === 'healthy' ? 'bg-accent/10 text-accent' : 'bg-amber-100 text-amber-700'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${health.status === 'healthy' ? 'bg-accent animate-pulse' : 'bg-amber-500'}`} />
                  {health.status}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Monitor your server-side tracking performance and revenue insights.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`/sgtm/debugger/${activeTenantId || 'main'}`} 
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              <Terminal className="h-3.5 w-3.5" />
              Live Debugger
            </Link>
            <div className="flex bg-muted rounded-lg p-1 border border-border">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                    period === p.key
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shopify-Style Grid Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {ltvCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="shopify-card p-6 flex flex-col justify-between hover:border-slate-400 transition-colors cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.title}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold text-foreground tabular-nums">{card.value}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-accent">
                    <ArrowUp className="h-2.5 w-2.5" />
                    12% from last period
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 shopify-card p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Event Volume</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Total processed telemetry events</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="shopifyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008060" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#008060" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#616161", fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#616161", fontSize: 10, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #d2d5d9", 
                    borderRadius: "8px", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#008060" 
                  fill="url(#shopifyGrad)" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Location Breakdown */}
          <div className="shopify-card p-6 flex flex-col">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight mb-6">Top Sessions by Country</h3>
            {byCountry.length > 0 ? (
              <div className="space-y-5 flex-1">
                {byCountry.slice(0, 7).map((c: any, i: number) => {
                  const maxEvents = byCountry[0]?.events ?? 1;
                  const pct = Math.round((c.events / maxEvents) * 100);
                  return (
                    <div key={c.country} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-muted-foreground">{c.country}</span>
                        <span className="text-foreground tabular-nums">{c.events.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden border border-slate-100">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out" 
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: i === 0 ? "#008060" : "#303030",
                            opacity: 1 - (i * 0.1)
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-40">
                <Globe className="h-10 w-10 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-center">No Location Data</p>
              </div>
            )}
            <Button variant="ghost" className="w-full mt-6 text-[11px] font-bold uppercase text-muted-foreground hover:text-primary">
              View Regional Report
            </Button>
          </div>
        </div>

        {/* Events Table Section */}
        <div className="shopify-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Top Performance Events</h3>
            <Badge variant="outline" className="bg-white text-[10px] font-bold border-border uppercase px-2 shadow-sm">
              Profit Analysis Active
            </Badge>
          </div>
          {byRevenue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6">Rank</th>
                    <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6">Event Identity</th>
                    <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6">Occurrences</th>
                    <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6">Tracked Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {byRevenue.map((evt: any, i: number) => (
                    <tr key={evt.event_name} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-accent" />
                           <span className="font-mono text-xs font-bold text-foreground group-hover:text-accent transition-colors">{evt.event_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right tabular-nums text-muted-foreground font-semibold">{evt.count?.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right tabular-nums font-bold text-foreground">
                        ${evt.total_revenue?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <AlertCircle className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting Transaction Data</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
