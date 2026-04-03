import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { TrendingUp, ArrowUp, ArrowDown, Heart, Book, Car, Briefcase, Star, Calendar, Utensils, MessageCircle, Building, Target, FileText, TrendingDown, DollarSign, ShoppingCart, Users, BarChart3, Activity, Box, Globe, Code, Zap, ArrowRight, Bug, History, ShieldCheck, Layers, FileCode, ShieldAlert, Clock, ExternalLink, CheckCircle2, Server } from "lucide-react";
import { a as useLanguage } from "../ssr.js";
import { usePage } from "@inertiajs/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import "class-variance-authority";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "sonner";
import "@radix-ui/react-tooltip";
const useAnimatedCounter = (endValue, duration = 1500) => {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * endValue));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    requestAnimationFrame(animate);
  }, [endValue, duration]);
  return count;
};
const iconMap = {
  users: /* @__PURE__ */ jsx(Users, { className: "h-6 w-6" }),
  "shopping-cart": /* @__PURE__ */ jsx(ShoppingCart, { className: "h-6 w-6" }),
  "dollar-sign": /* @__PURE__ */ jsx(DollarSign, { className: "h-6 w-6" }),
  "trending-up": /* @__PURE__ */ jsx(TrendingUp, { className: "h-6 w-6" }),
  "trending-down": /* @__PURE__ */ jsx(TrendingDown, { className: "h-6 w-6" }),
  "file-text": /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6" }),
  target: /* @__PURE__ */ jsx(Target, { className: "h-6 w-6" }),
  building: /* @__PURE__ */ jsx(Building, { className: "h-6 w-6" }),
  "message-circle": /* @__PURE__ */ jsx(MessageCircle, { className: "h-6 w-6" }),
  utensils: /* @__PURE__ */ jsx(Utensils, { className: "h-6 w-6" }),
  calendar: /* @__PURE__ */ jsx(Calendar, { className: "h-6 w-6" }),
  star: /* @__PURE__ */ jsx(Star, { className: "h-6 w-6" }),
  briefcase: /* @__PURE__ */ jsx(Briefcase, { className: "h-6 w-6" }),
  car: /* @__PURE__ */ jsx(Car, { className: "h-6 w-6" }),
  book: /* @__PURE__ */ jsx(Book, { className: "h-6 w-6" }),
  heart: /* @__PURE__ */ jsx(Heart, { className: "h-6 w-6" })
};
const gradientMap = {
  users: "from-primary/15 to-primary/5",
  "shopping-cart": "from-[hsl(160,84%,39%)]/15 to-[hsl(160,84%,39%)]/5",
  "dollar-sign": "from-[hsl(38,92%,50%)]/15 to-[hsl(38,92%,50%)]/5",
  "trending-up": "from-[hsl(280,68%,60%)]/15 to-[hsl(280,68%,60%)]/5",
  "trending-down": "from-[hsl(0,72%,51%)]/15 to-[hsl(0,72%,51%)]/5",
  "file-text": "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5",
  target: "from-[hsl(340,75%,55%)]/15 to-[hsl(340,75%,55%)]/5",
  building: "from-[hsl(220,60%,50%)]/15 to-[hsl(220,60%,50%)]/5",
  "message-circle": "from-[hsl(200,70%,50%)]/15 to-[hsl(200,70%,50%)]/5",
  utensils: "from-[hsl(25,90%,50%)]/15 to-[hsl(25,90%,50%)]/5",
  calendar: "from-[hsl(250,60%,55%)]/15 to-[hsl(250,60%,55%)]/5",
  star: "from-[hsl(45,93%,47%)]/15 to-[hsl(45,93%,47%)]/5",
  briefcase: "from-[hsl(190,70%,42%)]/15 to-[hsl(190,70%,42%)]/5",
  car: "from-[hsl(170,65%,40%)]/15 to-[hsl(170,65%,40%)]/5",
  book: "from-[hsl(260,55%,55%)]/15 to-[hsl(260,55%,55%)]/5",
  heart: "from-[hsl(350,80%,55%)]/15 to-[hsl(350,80%,55%)]/5"
};
const iconColorMap = {
  users: "text-primary",
  "shopping-cart": "text-[hsl(160,84%,39%)]",
  "dollar-sign": "text-[hsl(38,92%,50%)]",
  "trending-up": "text-[hsl(280,68%,60%)]",
  "trending-down": "text-[hsl(0,72%,51%)]",
  "file-text": "text-[hsl(210,70%,50%)]",
  target: "text-[hsl(340,75%,55%)]",
  building: "text-[hsl(220,60%,50%)]",
  "message-circle": "text-[hsl(200,70%,50%)]",
  utensils: "text-[hsl(25,90%,50%)]",
  calendar: "text-[hsl(250,60%,55%)]",
  star: "text-[hsl(45,93%,47%)]",
  briefcase: "text-[hsl(190,70%,42%)]",
  car: "text-[hsl(170,65%,40%)]",
  book: "text-[hsl(260,55%,55%)]",
  heart: "text-[hsl(350,80%,55%)]"
};
const parseNumericValue = (value) => {
  var _a, _b;
  const prefix = ((_a = value.match(/^[^0-9]*/)) == null ? void 0 : _a[0]) || "";
  const suffix = ((_b = value.match(/[^0-9,.]*$/)) == null ? void 0 : _b[0]) || "";
  const numStr = value.replace(/[^0-9.]/g, "");
  return { number: parseFloat(numStr) || 0, prefix, suffix };
};
const formatNumber = (num, original) => {
  var _a;
  const { prefix, suffix } = parseNumericValue(original);
  if (original.includes(",")) {
    return prefix + num.toLocaleString("en-US") + suffix;
  }
  if (original.includes(".") && !original.includes(",")) {
    const decimalPlaces = ((_a = original.split(".")[1]) == null ? void 0 : _a.replace(/[^0-9]/g, "").length) || 0;
    return prefix + num.toFixed(decimalPlaces) + suffix;
  }
  return prefix + num.toLocaleString("en-US") + suffix;
};
const MetricCard = ({ title, value, change, positive, icon }) => {
  const { number: targetNum } = parseNumericValue(value);
  const animatedNum = useAnimatedCounter(targetNum);
  const displayValue = formatNumber(animatedNum, value);
  return /* @__PURE__ */ jsxs("div", { className: "group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border animate-fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground", children: title }),
        /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-card-foreground tabular-nums tracking-tight", children: displayValue })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientMap[icon] || "from-primary/15 to-primary/5"} ${iconColorMap[icon] || "text-primary"} transition-transform duration-300 group-hover:scale-110`, children: iconMap[icon] || /* @__PURE__ */ jsx(TrendingUp, { className: "h-6 w-6" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(
        "span",
        {
          className: `inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`,
          children: [
            positive ? /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" }),
            change,
            "%"
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "vs last month" })
    ] })
  ] });
};
const fetchOverview = async (tenantId) => {
  try {
    const url = tenantId ? `/api/tracking/dashboard/overview?tenant_id=${tenantId}` : "/api/tracking/dashboard/overview";
    const { data } = await axios.get(url);
    return data;
  } catch {
    return null;
  }
};
const Index = () => {
  var _a;
  const { lang } = useLanguage();
  const { props } = usePage();
  const pageProps = props;
  const activeTenantId = pageProps.active_container_id;
  const { data: overview, isLoading } = useQuery({
    queryKey: ["tracking-overview", activeTenantId],
    queryFn: () => fetchOverview(activeTenantId),
    refetchInterval: 6e4,
    // refresh every minute
    enabled: !!activeTenantId || !pageProps.is_pixelmaster_model
  });
  const containers = (overview == null ? void 0 : overview.containers) ?? { total: 0, active: 0, k8s: 0, docker: 0 };
  const events24h = (overview == null ? void 0 : overview.events_24h) ?? { total: 0, processed: 0, error_rate: 0 };
  const topEvents = (overview == null ? void 0 : overview.top_events) ?? [];
  const hourlySpark = (overview == null ? void 0 : overview.hourly_sparkline) ?? [];
  const metrics = [
    { title: "Active Containers", value: String(containers.active), change: 0, positive: true, icon: "building" },
    { title: "Events (24h)", value: events24h.total.toLocaleString(), change: 0, positive: true, icon: "trending-up" },
    { title: "Processed", value: events24h.processed.toLocaleString(), change: 0, positive: true, icon: "target" },
    { title: "Error Rate", value: `${events24h.error_rate}%`, change: events24h.error_rate, positive: events24h.error_rate < 5, icon: events24h.error_rate < 5 ? "trending-up" : "trending-down" }
  ];
  const sparklineData = hourlySpark.length > 0 ? hourlySpark.map((count, i) => ({ hour: `${i}h`, events: count })) : Array.from({ length: 12 }, (_, i) => ({ hour: `${i}h`, events: 0 }));
  const [activeTab, setActiveTab] = useState("overview");
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Tracking Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Server-side tracking overview — containers, events, and health at a glance." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setActiveTab("overview"),
              className: `px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === "overview" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`,
              children: "Overview"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("analytics"),
              className: `px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab === "analytics" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                /* @__PURE__ */ jsx(BarChart3, { className: "h-3.5 w-3.5" }),
                "Real-time Analytics"
              ]
            }
          )
        ] }),
        pageProps.is_pixelmaster_model && pageProps.containers && pageProps.containers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white p-1.5 rounded-xl border border-border/60 shadow-sm max-w-[280px] sm:max-w-[320px]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground ml-2 hidden sm:inline-block", children: "Workspace:" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              className: "bg-slate-50 border-none text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer truncate w-full",
              value: pageProps.active_container_id || "",
              onChange: (e) => {
                window.location.href = `/dashboard?tenant_id=${e.target.value}`;
              },
              children: pageProps.containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
            }
          )
        ] })
      ] })
    ] }),
    activeTab === "overview" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: metrics.map((metric, index) => /* @__PURE__ */ jsx("div", { style: { animationDelay: `${index * 80}ms` }, children: /* @__PURE__ */ jsx(MetricCard, { ...metric }) }, metric.title)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Event Volume (Last 12h)" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Hourly processed events" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary", children: /* @__PURE__ */ jsx(Activity, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxs(AreaChart, { data: sparklineData, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "hsl(var(--primary))", stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "hsl(var(--primary))", stopOpacity: 0.02 })
            ] }) }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))", vertical: false }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "hour", axisLine: false, tickLine: false, tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }),
            /* @__PURE__ */ jsx(YAxis, { axisLine: false, tickLine: false, tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                contentStyle: {
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  padding: "8px 12px"
                }
              }
            ),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "events", stroke: "hsl(var(--primary))", fill: "url(#areaGrad)", strokeWidth: 2 })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground mb-4", children: "Top Events (24h)" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: topEvents.length > 0 ? topEvents.map((evt, i) => {
            var _a2;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-border/40 last:border-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold", children: i + 1 }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-card-foreground", children: evt.event_name })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-muted-foreground tabular-nums", children: (_a2 = evt.count) == null ? void 0 : _a2.toLocaleString() })
            ] }, evt.event_name);
          }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
            /* @__PURE__ */ jsx(Activity, { className: "mx-auto h-8 w-8 text-muted-foreground/30 mb-2" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No events yet" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Deploy a container to start tracking" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-150", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground mb-4", children: "Quick Actions" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
          { icon: Box, label: "New Container", desc: "Deploy sGTM container", href: "/containers" },
          { icon: Globe, label: "Setup Domain", desc: "Configure tracking domain", href: "/domains" },
          { icon: Code, label: "Get Embed Code", desc: "Install tracking snippet", href: "/embed" },
          { icon: Zap, label: "Power-Ups", desc: "Enable enhancements", href: "/power-ups" }
        ].map((action) => /* @__PURE__ */ jsxs(
          "a",
          {
            href: action.href,
            className: "group flex items-start gap-3 rounded-xl border border-border/60 p-4 text-left hover:bg-accent/50 hover:border-border transition-all duration-200",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsx(action.icon, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-card-foreground", children: action.label }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: action.desc })
              ] }),
              /* @__PURE__ */ jsx(ArrowRight, { className: "ml-auto h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" })
            ]
          },
          action.label
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-blue-500/10 text-blue-500", children: /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Standard Power-Ups" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            { label: "Custom Loader", icon: Code, color: "text-blue-500" },
            { label: "Cookie Keeper", icon: Zap, color: "text-emerald-500" },
            { label: "Bot Detection", icon: Bug, color: "text-purple-500" },
            { label: "Ad Blocker Info", icon: Activity, color: "text-amber-500" },
            { label: "PixelMaster Store", icon: Star, color: "text-indigo-500" },
            { label: "POAS Data Feed", icon: BarChart3, color: "text-rose-500" }
          ].map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 transition-hover hover:border-border hover:bg-muted/50 cursor-default group", children: [
            /* @__PURE__ */ jsx(f.icon, { className: `h-4 w-4 ${f.color} opacity-70 group-hover:opacity-100 transition-opacity` }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-foreground/80", children: f.label })
          ] }, f.label)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-250", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Elite Enterprise Features" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
            { label: "Multi-zone Infra", icon: Globe, color: "text-sky-500" },
            { label: "10 Days Logs", icon: History, color: "text-indigo-500" },
            { label: "Cookie (Custom)", icon: ShieldCheck, color: "text-emerald-500" },
            { label: "Multi Domains", icon: Layers, color: "text-teal-500" },
            { label: "Monitoring", icon: Activity, color: "text-rose-500" },
            { label: "File Proxy", icon: FileCode, color: "text-amber-500" },
            { label: "Block Request", icon: ShieldAlert, color: "text-rose-600" },
            { label: "Schedule", icon: Calendar, color: "text-violet-500" },
            { label: "Request Delay", icon: Clock, color: "text-blue-600" }
          ].map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 p-2 rounded-lg bg-primary/[0.02] border border-primary/5 transition-hover hover:border-primary/20 hover:bg-primary/[0.04]", children: [
            /* @__PURE__ */ jsx(f.icon, { className: `h-3.5 w-3.5 ${f.color}` }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold tracking-tight text-foreground/70 uppercase", children: f.label })
          ] }, f.label)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in delay-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Container Health" }),
          /* @__PURE__ */ jsxs("a", { href: "/containers", className: "text-xs text-primary hover:underline flex items-center gap-1", children: [
            "View all ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
          ] })
        ] }),
        containers.total > 0 ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-[hsl(160,84%,39%)]/10 to-transparent p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-[hsl(160,84%,39%)]" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Active" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-card-foreground", children: containers.active })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Server, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Total" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-card-foreground", children: containers.total })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-[hsl(280,68%,60%)]/10 to-transparent p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-[hsl(280,68%,60%)]" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Kubernetes" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-card-foreground", children: containers.k8s })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-to-br from-[hsl(38,92%,50%)]/10 to-transparent p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx(Box, { className: "h-4 w-4 text-[hsl(38,92%,50%)]" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Docker" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-card-foreground", children: containers.docker })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-10 border border-dashed border-border/60 rounded-xl bg-muted/20", children: [
          /* @__PURE__ */ jsx(Server, { className: "mx-auto h-10 w-10 text-muted-foreground/30 mb-3" }),
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-card-foreground", children: "No containers yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm mx-auto", children: "Create your first sGTM container to start server-side tracking" }),
          /* @__PURE__ */ jsxs("a", { href: "/containers", className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors", children: [
            /* @__PURE__ */ jsx(Box, { className: "h-4 w-4" }),
            " Create Container"
          ] })
        ] })
      ] })
    ] }) : (
      /* Metabase Analytics Tab */
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm animate-fade-in min-h-[700px] flex flex-col relative group", children: [
        ((_a = pageProps.metabase) == null ? void 0 : _a.full_embed) ? /* @__PURE__ */ jsx(
          "iframe",
          {
            src: pageProps.metabase.full_embed,
            frameBorder: "0",
            width: "100%",
            height: "800",
            allowTransparency: true,
            className: "w-full flex-grow rounded-2xl",
            title: "Real-time Analytics"
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-10 w-10 text-primary" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-2", children: "Analyzing Data Streams" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md mx-auto mb-8", children: "Your enterprise dashboard is being connected to our global data warehouse. This usually takes a few minutes after the first tracking event is received." }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20",
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
                " Check Status"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/analytics",
            className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white shadow-2xl",
            children: [
              "Go to Dedicated Analytics View ",
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
            ]
          }
        ) })
      ] })
    )
  ] }) });
};
export {
  Index as default
};
