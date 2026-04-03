import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQuery } from "@tanstack/react-query";
import { usePage, Link } from "@inertiajs/react";
import axios from "axios";
import { DollarSign, TrendingUp, Activity, Users, Terminal, ArrowUp, BarChart3, Globe, AlertCircle } from "lucide-react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import "class-variance-authority";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "sonner";
import "@radix-ui/react-tooltip";
const fetchAnalytics = async (period, tenantId) => {
  try {
    const url = `/api/tracking/dashboard/analytics?period=${period}${tenantId ? `&tenant_id=${tenantId}` : ""}`;
    const { data } = await axios.get(url);
    return data;
  } catch {
    return null;
  }
};
const fetchHealth = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/health/shared");
    return data.data;
  } catch {
    return null;
  }
};
const periods = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" }
];
const AnalyticsPage = () => {
  const { props } = usePage();
  const pageProps = props;
  const activeTenantId = pageProps.active_container_id;
  const [period, setPeriod] = useState("30d");
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["tracking-analytics", period, activeTenantId],
    queryFn: () => fetchAnalytics(period, activeTenantId),
    refetchInterval: 3e5
  });
  const { data: health } = useQuery({
    queryKey: ["infra-health"],
    queryFn: fetchHealth,
    refetchInterval: 6e4
  });
  const daily = (analytics == null ? void 0 : analytics.daily) ?? [];
  const byRevenue = (analytics == null ? void 0 : analytics.by_revenue) ?? [];
  const ltv = (analytics == null ? void 0 : analytics.ltv) ?? {};
  const byCountry = (analytics == null ? void 0 : analytics.by_country) ?? [];
  const ltvCards = [
    { title: "Avg LTV", value: `$${(ltv.avg_ltv ?? 0).toFixed(0)}`, icon: DollarSign },
    { title: "Max LTV", value: `$${(ltv.max_ltv ?? 0).toFixed(0)}`, icon: TrendingUp },
    { title: "Avg Orders", value: String((ltv.avg_orders ?? 0).toFixed(1)), icon: Activity },
    { title: "Total Customers", value: (ltv.total_customers ?? 0).toLocaleString(), icon: Users }
  ];
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-8 pb-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Analytics" }),
          health && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${health.status === "healthy" ? "bg-accent/10 text-accent" : "bg-amber-100 text-amber-700"}`, children: [
            /* @__PURE__ */ jsx("div", { className: `h-1.5 w-1.5 rounded-full ${health.status === "healthy" ? "bg-accent animate-pulse" : "bg-amber-500"}` }),
            health.status
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Monitor your server-side tracking performance and revenue insights." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/sgtm/debugger/${activeTenantId || "main"}`,
            className: "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm",
            children: [
              /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5" }),
              "Live Debugger"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex bg-muted rounded-lg p-1 border border-border", children: periods.map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPeriod(p.key),
            className: `rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${period === p.key ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: p.label
          },
          p.key
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4", children: ltvCards.map((card) => {
      const Icon = card.icon;
      return /* @__PURE__ */ jsxs("div", { className: "shopify-card p-6 flex flex-col justify-between hover:border-slate-400 transition-colors cursor-default", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: card.title }),
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-foreground tabular-nums", children: card.value }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1 text-[10px] font-bold text-accent", children: [
            /* @__PURE__ */ jsx(ArrowUp, { className: "h-2.5 w-2.5" }),
            "12% from last period"
          ] })
        ] })
      ] }, card.title);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 shopify-card p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground uppercase tracking-tight", children: "Event Volume" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Total processed telemetry events" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" }) })
        ] }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(AreaChart, { data: daily, children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "shopifyGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#008060", stopOpacity: 0.15 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#008060", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e3e3e3", vertical: false }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "date",
              axisLine: false,
              tickLine: false,
              tick: { fill: "#616161", fontSize: 10, fontWeight: 600 },
              dy: 10
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              axisLine: false,
              tickLine: false,
              tick: { fill: "#616161", fontSize: 10, fontWeight: 600 },
              dx: -10
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                backgroundColor: "#fff",
                border: "1px solid #d2d5d9",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: "11px",
                fontWeight: "bold"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Area,
            {
              type: "monotone",
              dataKey: "events",
              stroke: "#008060",
              fill: "url(#shopifyGrad)",
              strokeWidth: 2.5,
              activeDot: { r: 6, strokeWidth: 0 }
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "shopify-card p-6 flex flex-col", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground uppercase tracking-tight mb-6", children: "Top Sessions by Country" }),
        byCountry.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-5 flex-1", children: byCountry.slice(0, 7).map((c, i) => {
          var _a;
          const maxEvents = ((_a = byCountry[0]) == null ? void 0 : _a.events) ?? 1;
          const pct = Math.round(c.events / maxEvents * 100);
          return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: c.country }),
              /* @__PURE__ */ jsx("span", { className: "text-foreground tabular-nums", children: c.events.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden border border-slate-100", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full transition-all duration-700 ease-out",
                style: {
                  width: `${pct}%`,
                  backgroundColor: i === 0 ? "#008060" : "#303030",
                  opacity: 1 - i * 0.1
                }
              }
            ) })
          ] }, c.country);
        }) }) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-8 opacity-40", children: [
          /* @__PURE__ */ jsx(Globe, { className: "h-10 w-10 mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-center", children: "No Location Data" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "w-full mt-6 text-[11px] font-bold uppercase text-muted-foreground hover:text-primary", children: "View Regional Report" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "shopify-card overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-border flex items-center justify-between bg-muted/30", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground uppercase tracking-tight", children: "Top Performance Events" }),
        /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "bg-white text-[10px] font-bold border-border uppercase px-2 shadow-sm", children: "Profit Analysis Active" })
      ] }),
      byRevenue.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6", children: "Rank" }),
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6", children: "Event Identity" }),
          /* @__PURE__ */ jsx("th", { className: "text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6", children: "Occurrences" }),
          /* @__PURE__ */ jsx("th", { className: "text-right text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 px-6", children: "Tracked Revenue" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border", children: byRevenue.map((evt, i) => {
          var _a, _b;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/30 transition-colors group", children: [
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: i + 1 }) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-accent" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-bold text-foreground group-hover:text-accent transition-colors", children: evt.event_name })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6 text-right tabular-nums text-muted-foreground font-semibold", children: (_a = evt.count) == null ? void 0 : _a.toLocaleString() }),
            /* @__PURE__ */ jsxs("td", { className: "py-4 px-6 text-right tabular-nums font-bold text-foreground", children: [
              "$",
              (_b = evt.total_revenue) == null ? void 0 : _b.toLocaleString()
            ] })
          ] }, evt.event_name);
        }) })
      ] }) }) : /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-muted-foreground flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-10 w-10 mb-3 opacity-20" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold uppercase tracking-widest", children: "Awaiting Transaction Data" })
      ] })
    ] })
  ] }) });
};
export {
  AnalyticsPage as default
};
