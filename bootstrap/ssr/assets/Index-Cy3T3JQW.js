import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { router, Head, Link } from "@inertiajs/react";
function EventsIndex({ logs, infra, yield: yieldData, filters }) {
  useEffect(() => {
    const timer = setInterval(() => {
      router.reload({
        only: ["infra", "logs"],
        preserveScroll: true,
        preserveState: true
      });
    }, 5e3);
    return () => clearInterval(timer);
  }, []);
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "all");
  const [activeTab, setActiveTab] = useState("monitor");
  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route("platform.events"), { search, status }, { preserveState: true });
  };
  const handleRetry = () => {
    if (confirm("Are you sure you want to retry the last 100 failed events?")) {
      router.post(route("platform.events.retry"), {}, {
        onSuccess: () => alert("Batch retry triggered successfully.")
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Event & Tracking Infrastructure" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "Event Pipeline Intelligence" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Global monitor for tracking throughput, queue latency, and infrastructure yield." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleRetry,
            className: "bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: /* @__PURE__ */ jsx("path", { d: "M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6m12-4a9 9 0 0 1-15 6.7L3 16" }) }),
              "Bulk Retry Failed"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-slate-200 mx-2 hidden md:block" }),
        /* @__PURE__ */ jsx("div", { className: "flex bg-slate-100 p-1 rounded-xl", children: ["monitor", "yield"].map((tab) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab(tab),
            className: `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
            children: tab.charAt(0).toUpperCase() + tab.slice(1)
          },
          tab
        )) })
      ] })
    ] }),
    activeTab === "monitor" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Throughput (EPS)" }),
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-mono font-bold text-slate-900", children: infra.stats.eps_60s }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400", children: "evt/sec" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-green-500 w-[70%]" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4", children: "Queue Depth (Pro)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-mono font-bold text-indigo-600", children: infra.queues.tracking_pro }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400", children: "jobs" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 mt-2", children: [
            "Avg. Latency: ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-slate-600", children: [
              infra.stats.avg_latency_ms,
              "ms"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4", children: "Queue Depth (Free)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 text-slate-900", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-mono font-bold", children: infra.queues.tracking_free }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400", children: "jobs" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-2 text-amber-600 font-bold", children: "Standard priority" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 italic", children: "Failed (24h)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl font-mono font-bold text-red-600", children: infra.stats.failed_24h }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-red-400", children: "errors" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-red-500 mt-2 font-bold uppercase tracking-tight", children: "Requires Attention" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between md:items-center gap-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-bold text-slate-800 flex items-center gap-2", children: [
            "Event Explorer",
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase", children: [
              logs.total,
              " Total"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleFilter, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: status,
                onChange: (e) => setStatus(e.target.value),
                className: "bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none font-bold text-slate-600",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
                  /* @__PURE__ */ jsx("option", { value: "processed", children: "Processed" }),
                  /* @__PURE__ */ jsx("option", { value: "failed", children: "Failed" }),
                  /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  placeholder: "Search Event/Tenant/Code...",
                  className: "bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 font-medium w-64"
                }
              ),
              /* @__PURE__ */ jsxs("svg", { className: "absolute left-2.5 top-2 text-slate-400", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: [
                /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                /* @__PURE__ */ jsx("path", { d: "m21 21-4.3-4.3" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "hidden", children: "Filter" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-x-auto text-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "ID" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Tenant" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Event Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Timestamp" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 font-medium", children: logs.data.length > 0 ? logs.data.map((log) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors group cursor-pointer", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-slate-400", children: [
              "#",
              log.id
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsx(Link, { href: route("platform.tenants.show", log.tenant_id), className: "text-slate-900 hover:text-indigo-600 hover:underline", children: log.tenant_id }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "text-slate-700 font-bold", children: log.event_name }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-center", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${log.status === "processed" ? "bg-green-50 text-green-700 border-green-200" : log.status === "failed" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`, children: log.status_code || log.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-slate-500 text-xs", children: new Date(log.created_at).toLocaleString() })
          ] }, log.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-20 text-center text-slate-400 italic", children: "No event logs found matching criteria." }) }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/20", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-slate-500 font-bold", children: [
            "Showing ",
            logs.from || 0,
            " to ",
            logs.to || 0,
            " of ",
            logs.total,
            " entries"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: logs.links.map((link, idx) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              dangerouslySetInnerHTML: { __html: link.label },
              className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? "bg-slate-900 text-white" : link.url ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" : "text-slate-300 pointer-events-none"}`
            },
            idx
          )) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2", children: "Profitability Engine" }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold mb-8", children: "Yield Analysis (30d)" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "Estimated MRR" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-4xl font-mono font-bold tabular-nums text-white", children: [
                    "$",
                    yieldData.total_mrr.toLocaleString()
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "AWS Pulse (Opex)" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-2xl font-mono font-bold text-green-400", children: [
                    "-$",
                    yieldData.total_cost.toFixed(2)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-8 border-t border-white/10 flex justify-between items-center", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-white/40 text-[10px] font-bold uppercase mb-1", children: "Global Gross Margin" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxs("p", { className: "text-5xl font-mono font-bold text-indigo-400", children: [
                      yieldData.net_margin.toFixed(1),
                      "%"
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "max-w-[150px] text-right", children: /* @__PURE__ */ jsxs("p", { className: "text-white/30 text-[10px] italic leading-tight", children: [
                  "Optimized Pods: ",
                  yieldData.pro_pods,
                  " Dedicated + Global Shared Cluster."
                ] }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[120px] -z-0" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-0" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6", children: "Efficiency Benchmarking" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Event Volume (Processed)" }),
                /* @__PURE__ */ jsxs("span", { className: "text-slate-900", children: [
                  yieldData.monthly_events,
                  " / month"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-slate-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-indigo-500 w-[65%]" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Unit Economics Efficiency" }),
                /* @__PURE__ */ jsxs("span", { className: "text-slate-900", children: [
                  "$",
                  yieldData.efficiency,
                  " / 1M events"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-slate-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-green-500 w-[85%]" }) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-8 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 mb-6", children: "Unit Economics Breakdown" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          [
            { label: "Global Shared Cluster", desc: "AWS EKS Fargate - Spot Instances", cost: "$4.00" },
            { label: "Dedicated Pro Pods", desc: `${yieldData.pro_pods} Small Shared Pods @ $3.50`, cost: `$${(yieldData.pro_pods * 3.5).toFixed(2)}` },
            { label: "Egress & API Overhead", desc: "Cloudfront + Internal Networking", cost: "$0.00" },
            { label: "Database & Redis", desc: "Shared Multi-tenant Core", cost: "$0.00" }
          ].map((item, idx) => /* @__PURE__ */ jsx("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-900", children: item.label }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: item.desc })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "font-mono font-bold text-slate-600 group-hover:text-slate-900", children: item.cost })
          ] }) }, idx)),
          /* @__PURE__ */ jsxs("div", { className: "pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-lg font-bold", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-900", children: "Total Monthly Opex" }),
            /* @__PURE__ */ jsxs("span", { className: "text-indigo-600 font-mono", children: [
              "$",
              yieldData.total_cost.toLocaleString(void 0, { minimumFractionDigits: 2 })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
EventsIndex.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  EventsIndex as default
};
