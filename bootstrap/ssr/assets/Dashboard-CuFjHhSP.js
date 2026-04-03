import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useEffect } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { router, Head, Link } from "@inertiajs/react";
const StatCard = ({ label, value, delta, deltaType = "up", icon, extra }) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: label }),
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-md bg-slate-50 border border-gray-200 flex items-center justify-center text-slate-500", children: icon })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-slate-900 tabular-nums", children: value }),
      delta && /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${deltaType === "up" ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`, children: [
        deltaType === "up" ? "↑" : "",
        " ",
        delta
      ] })
    ] }),
    extra
  ] })
] });
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-slate-50 text-slate-500 border-slate-200",
    suspended: "bg-red-50 text-red-600 border-red-100",
    trial: "bg-amber-50 text-amber-700 border-amber-200"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.inactive}`, children: status });
};
const PlanBadge = ({ plan }) => {
  const styles = {
    basic: "text-slate-600 bg-slate-50 border-slate-200",
    growth: "text-blue-700 bg-blue-50 border-blue-200",
    advanced: "text-purple-700 bg-purple-50 border-purple-200",
    enterprise: "text-amber-700 bg-amber-50 border-amber-200"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${styles[plan == null ? void 0 : plan.toLowerCase()] || styles.basic}`, children: plan || "Basic" });
};
const Section = ({ title, action, children }) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg overflow-hidden", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3.5 border-b border-gray-100", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-slate-800", children: title }),
    action
  ] }),
  children
] });
function Dashboard({ stats, recentTenants, recentSignups, infrastructure, subscriptionStats, recentAuditLogs, ...props }) {
  var _a, _b, _c, _d, _e, _f;
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      const timer = setInterval(() => {
        if (document.visibilityState === "visible") {
          router.reload({
            only: ["infrastructure", "stats"],
            preserveScroll: true,
            preserveState: true
          });
        }
      }, 15e3);
      return () => clearInterval(timer);
    }, 2e3);
    return () => clearTimeout(initialDelay);
  }, []);
  const trialExpiring = (stats == null ? void 0 : stats.trial_expiring) ?? 0;
  const statCards = [
    {
      label: "Total Tenants",
      value: (stats == null ? void 0 : stats.total_tenants) ?? "0",
      delta: stats == null ? void 0 : stats.tenant_change,
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" }) })
    },
    {
      label: "Active Subscriptions",
      value: (stats == null ? void 0 : stats.active_tenants) ?? "0",
      delta: null,
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      label: "Active Pricing Plans",
      value: (stats == null ? void 0 : stats.active_modules) ?? "0",
      delta: null,
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" }) })
    },
    {
      label: "Platform Revenue (MRR)",
      value: (stats == null ? void 0 : stats.mrr) ?? "$0.00",
      delta: stats == null ? void 0 : stats.mrr_change,
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      extra: (stats == null ? void 0 : stats.mrr_breakdown) && /* @__PURE__ */ jsx("div", { className: "mt-2 pt-2 border-t border-slate-50 space-y-1", children: Object.entries(stats.mrr_breakdown).map(([name, val]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-bold uppercase tracking-wider", children: name }),
        /* @__PURE__ */ jsxs("span", { className: "text-slate-700 font-mono", children: [
          "$",
          val.toLocaleString()
        ] })
      ] }, name)) })
    },
    {
      label: "Trial Health",
      value: (stats == null ? void 0 : stats.trial_expiring) ?? "0",
      delta: (stats == null ? void 0 : stats.trial_expiring_today) > 0 ? `${stats.trial_expiring_today} today` : null,
      deltaType: "error",
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      label: "Database Alerts",
      value: (infrastructure == null ? void 0 : infrastructure.quota_overages) ?? "0",
      delta: null,
      icon: /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) })
    }
  ];
  recentTenants && recentTenants.length > 0 ? recentTenants : [];
  const systemChecks = [
    { name: "Cache Hit Rate", status: `${((_a = infrastructure == null ? void 0 : infrastructure.cache_health) == null ? void 0 : _a.hit_rate) ?? "0"}%`, count: ((_b = infrastructure == null ? void 0 : infrastructure.cache_health) == null ? void 0 : _b.memory_usage) ?? "0MB", type: "success" },
    { name: "Blocked Intrusions", status: (infrastructure == null ? void 0 : infrastructure.blocked_intrusions) > 10 ? "Alert" : "Minimal", count: infrastructure == null ? void 0 : infrastructure.blocked_intrusions, type: (infrastructure == null ? void 0 : infrastructure.blocked_intrusions) > 10 ? "error" : "success" },
    { name: "Failed Jobs", status: (infrastructure == null ? void 0 : infrastructure.failed_jobs) > 0 ? "Review" : "None", count: infrastructure == null ? void 0 : infrastructure.failed_jobs, type: (infrastructure == null ? void 0 : infrastructure.failed_jobs) > 0 ? "error" : "success" },
    { name: "Pending Jobs", status: (infrastructure == null ? void 0 : infrastructure.pending_jobs) > 100 ? "Delayed" : "Flowing", count: infrastructure == null ? void 0 : infrastructure.pending_jobs, type: (infrastructure == null ? void 0 : infrastructure.pending_jobs) > 100 ? "warning" : "success" },
    { name: "Global Queue Latency", status: "Running", count: "12ms", type: "success" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${((_c = props.settings) == null ? void 0 : _c.app_name) || "Platform"} - Orchestration` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: [
        ((_d = props.settings) == null ? void 0 : _d.app_name) || "Platform",
        " Intelligence"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Global oversight of tenant networks, service delivery, and infrastructure health." })
    ] }),
    trialExpiring > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-indigo-900", children: [
            /* @__PURE__ */ jsx("strong", { children: trialExpiring }),
            " trials expiring within 14 days"
          ] }),
          (stats == null ? void 0 : stats.trial_expiring_today) > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-indigo-700 font-medium", children: [
            "⚠️ ",
            /* @__PURE__ */ jsx("strong", { children: stats.trial_expiring_today }),
            " units are expiring ",
            /* @__PURE__ */ jsx("strong", { children: "today" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { href: "/platform/subscriptions?status=trialing", className: "text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm", children: "Manage Subscriptions" })
    ] }),
    ((stats == null ? void 0 : stats.past_due_tenants) > 0 || (stats == null ? void 0 : stats.suspended_tenants) > 0) && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600", children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }),
          /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-amber-900", children: "Billing Attention Required" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700", children: [
            (stats == null ? void 0 : stats.past_due_tenants) > 0 && /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: stats.past_due_tenants }),
              " tenant(s) past due. "
            ] }),
            (stats == null ? void 0 : stats.suspended_tenants) > 0 && /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: stats.suspended_tenants }),
              " tenant(s) suspended due to unpaid invoices."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link, { href: route("platform.tenants"), className: "text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:outline-none", children: "Review Tenants" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-green-900", children: "System Pulsating: All Services Operational" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-green-700", children: "Infrastructure reporting 100% uptime in the last 24 hours." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4 text-green-800 text-xs font-semibold", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
          /* @__PURE__ */ jsx("span", { children: "DB Latency" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: "4ms" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-green-200" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end", children: [
          /* @__PURE__ */ jsx("span", { children: "API Status" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold font-mono", children: "200 OK" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8", children: statCards.map((card) => /* @__PURE__ */ jsx(StatCard, { ...card }, card.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-8", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1", children: "Infrastructure Yield" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: "Estimated Profitability" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md border border-white/10", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-white/60 mr-2", children: "MARGIN" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-green-400", children: "82.4%" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "Real-time EPS" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-mono font-bold tracking-tighter text-blue-300", children: (infrastructure == null ? void 0 : infrastructure.eps_realtime) || "0.00" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/20 mt-1 italic", children: "Events Per Second" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "24h Throughput" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-mono font-bold tracking-tighter", children: (infrastructure == null ? void 0 : infrastructure.total_events_24h) || "0" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/20 mt-1 italic", children: "Processed Logs" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "AWS Pulse (Opex)" }),
              /* @__PURE__ */ jsxs("p", { className: "text-2xl font-mono font-bold tracking-tighter text-amber-300", children: [
                "$",
                ((_e = infrastructure == null ? void 0 : infrastructure.cost_estimate) == null ? void 0 : _e.toFixed(2)) || "0.00"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/20 mt-1 italic", children: "Est. Pod Opex / Day" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-10 pointer-events-none", style: { backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4", children: "Security Perimeter" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-600 font-medium", children: "Blocked IPs" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full", children: (infrastructure == null ? void 0 : infrastructure.blocked_intrusions) || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-600 font-medium", children: "Quota Overages" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full", children: (infrastructure == null ? void 0 : infrastructure.quota_overages) || 0 })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-slate-100 mt-4", children: /* @__PURE__ */ jsx(Link, { href: "/platform/security/firewall", className: "w-full inline-flex justify-center items-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors", children: "Access Firewall Settings" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsx(
          Section,
          {
            title: "Latest Signups & Workspaces",
            action: /* @__PURE__ */ jsx(Link, { href: "/platform/tenants", className: "text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline", children: "Manage" }),
            children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-slate-50/50", children: [
                /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Tenant ID" }),
                /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Domain" }),
                /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Plan" }),
                /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Status" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: recentTenants && recentTenants.length > 0 ? recentTenants.map((t) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase", children: t.id.substring(0, 2) }),
                  /* @__PURE__ */ jsx("p", { className: "font-semibold text-slate-800 text-sm", children: t.name })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-600 text-xs", children: t.domain }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(PlanBadge, { plan: t.plan }) }),
                /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(StatusBadge, { status: t.status }) })
              ] }, t.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "4", className: "px-5 py-10 text-center text-slate-400 italic", children: "No recent tenants found." }) }) })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(Section, { title: "Revenue Growth (%)", children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-end gap-2 h-32 mb-4", children: (props.revenueTrends || []).map((t, idx) => {
              const maxRevenue = Math.max(...(props.revenueTrends || []).map((rt) => rt.revenue));
              const height = t.revenue / maxRevenue * 100;
              return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-2 group", children: [
                /* @__PURE__ */ jsx("div", { className: "relative w-full flex flex-col justify-end h-full", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-full bg-blue-100 rounded-t-sm group-hover:bg-blue-400 transition-colors",
                    style: { height: `${height}%` }
                  }
                ) }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-bold uppercase", children: t.month })
              ] }, idx);
            }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-slate-50", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Growth Rate" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-green-600", children: "+14.2%" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Section, { title: "Global Quota Health", children: /* @__PURE__ */ jsx("div", { className: "p-4 space-y-4", children: ((_f = infrastructure == null ? void 0 : infrastructure.quota_usage) == null ? void 0 : _f.length) > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: infrastructure.quota_usage.map((q) => {
            const percent = q.total_limit > 0 ? q.total_used / q.total_limit * 100 : 0;
            return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] font-bold uppercase text-slate-500", children: [
                /* @__PURE__ */ jsx("span", { children: q.module_slug }),
                /* @__PURE__ */ jsxs("span", { children: [
                  Math.round(percent),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-slate-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full rounded-full transition-all duration-500 ${percent > 90 ? "bg-red-500" : percent > 70 ? "bg-amber-500" : "bg-green-500"}`,
                  style: { width: `${Math.min(100, percent)}%` }
                }
              ) })
            ] }, q.module_slug);
          }) }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 italic text-center py-4", children: "No usage data detected" }) }) })
        ] }),
        /* @__PURE__ */ jsx(Section, { title: "Subscription Activity", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-slate-50/50", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Tenant" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Plan" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider", children: "Joined" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: (recentSignups == null ? void 0 : recentSignups.length) > 0 ? recentSignups.map((s) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-semibold text-slate-800 text-xs", children: s.tenant_name }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 uppercase text-[10px] font-bold text-slate-600", children: s.plan }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 uppercase text-[10px] font-bold text-slate-500", children: s.status }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-400 text-[11px]", children: s.date })
          ] }, s.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "4", className: "px-5 py-6 text-center text-slate-400 italic text-xs", children: "No recent subscriptions" }) }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          Section,
          {
            title: "Infrastructure Deploy Guide",
            action: /* @__PURE__ */ jsxs("span", { className: "flex h-2 w-2 relative", children: [
              /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" }),
              /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-blue-500" })
            ] }),
            children: /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: "To ensure tenants can successfully provision custom tracking domains, your primary load balancer DNS must be correctly configured." }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-md p-3", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2", children: "1. Wildcard DNS Setup" }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-medium", children: "Type" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm", children: "CNAME" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-medium", children: "Name" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm", children: "*.customers" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-slate-500 font-medium", children: "Target / Value" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-blue-600", children: "lb.pxlmaster.net" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-blue-50/50 border border-blue-100 rounded-md p-3", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5", children: "2. Edge SSL Provisioning" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-blue-700 leading-relaxed", children: [
                  "Global CDN uses Cloudflare API to provision edge SSL. Ensure your tokens are active in ",
                  /* @__PURE__ */ jsx(Link, { href: "/platform/settings", className: "font-bold underline hover:text-blue-900", children: "Platform Settings" }),
                  "."
                ] })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(Section, { title: "System Health", children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-100", children: systemChecks.map((check) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full flex-shrink-0 ${check.type === "error" ? "bg-red-500 animate-pulse" : check.type === "warning" ? "bg-amber-500" : "bg-green-500"}` }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-700", children: check.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            check.count !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded", children: check.count }),
            /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold uppercase tracking-wider ${check.type === "error" ? "text-red-600" : check.type === "warning" ? "text-amber-600" : "text-green-600"}`, children: check.status })
          ] })
        ] }, check.name)) }) }),
        /* @__PURE__ */ jsx(Section, { title: "Subscription Health", children: /* @__PURE__ */ jsx("div", { className: "p-4 space-y-2", children: [
          { label: "Active", count: (subscriptionStats == null ? void 0 : subscriptionStats.active) ?? 0, color: "bg-green-500" },
          { label: "Trialing", count: (subscriptionStats == null ? void 0 : subscriptionStats.trialing) ?? 0, color: "bg-blue-500" },
          { label: "Past Due", count: (subscriptionStats == null ? void 0 : subscriptionStats.past_due) ?? 0, color: "bg-amber-500" },
          { label: "Canceled", count: (subscriptionStats == null ? void 0 : subscriptionStats.canceled) ?? 0, color: "bg-red-500" }
        ].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${item.color}` }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-600", children: item.label })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-slate-900 tabular-nums", children: item.count })
        ] }, item.label)) }) }),
        recentAuditLogs && recentAuditLogs.length > 0 && /* @__PURE__ */ jsx(Section, { title: "Recent Audit Events", action: /* @__PURE__ */ jsx(Link, { href: "/platform/security/audit", className: "text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline", children: "View All" }), children: /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: recentAuditLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "px-5 py-2.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-700 font-medium line-clamp-1", children: log.action }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400", children: log.created_at }),
            log.ip_address && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-300", children: log.ip_address })
          ] })
        ] }, log.id)) }) }),
        /* @__PURE__ */ jsx(Section, { title: "Quick Actions", children: /* @__PURE__ */ jsx("div", { className: "p-3 space-y-1", children: [
          { label: "Create New Tenant", href: "/platform/tenants" },
          { label: "Manage Subscription Plans", href: "/platform/billing/plans" },
          { label: "Platform Settings", href: "/platform/settings" }
        ].map((action) => /* @__PURE__ */ jsxs(
          Link,
          {
            href: action.href,
            className: "flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group",
            children: [
              action.label,
              /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-slate-300 group-hover:text-slate-500 transition-colors", children: /* @__PURE__ */ jsx("path", { d: "M9 5l7 7-7 7", strokeLinecap: "round", strokeLinejoin: "round" }) })
            ]
          },
          action.href
        )) }) })
      ] })
    ] })
  ] });
}
Dashboard.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page, title: "Dashboard" });
export {
  Dashboard as default
};
