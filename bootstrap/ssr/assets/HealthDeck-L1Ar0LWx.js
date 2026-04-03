import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head } from "@inertiajs/react";
const StatCard = ({ title, value, icon, color }) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1", children: title }),
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-900 leading-none", children: value })
  ] }),
  /* @__PURE__ */ jsx("div", { className: `p-4 rounded-xl ${color}`, children: icon })
] });
function HealthDeck({ stats, infrastructure }) {
  const { post, processing } = useForm();
  const [lastSync, setLastSync] = useState(stats.timestamp);
  const handleSync = () => {
    if (confirm("Are you sure you want to rebuild global mappings? This will reload shared infrastructure containers.")) {
      post(route("api.tracking.dashboard.health.sync"), {
        onSuccess: () => {
          setLastSync((/* @__PURE__ */ new Date()).toLocaleString());
        }
      });
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Mission Control - sGTM Infrastructure" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex justify-between items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "sGTM Mission Control" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-slate-500 mt-1 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-2 w-2 rounded-full bg-emerald-500" }),
          "Real-time infrastructure health & billing enforcement deck."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [
          "Last Check: ",
          lastSync
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSync,
            disabled: processing,
            className: "bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 inline-flex items-center gap-2",
            children: processing ? "Syncing..." : "Rebuild Global Mappings"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Active Containers",
          value: stats.active_containers,
          color: "bg-emerald-50 text-emerald-600",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Suspended (Quota)",
          value: stats.suspended_containers,
          color: "bg-rose-50 text-rose-600",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Monthly Throughput",
          value: stats.total_monthly_events.toLocaleString(),
          color: "bg-indigo-50 text-indigo-600",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) })
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          title: "Cluster Engine",
          value: infrastructure.engine || "Mix Mode",
          color: "bg-amber-50 text-amber-600",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-gray-100", children: /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900", children: "Infrastructure Node Health" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: infrastructure.status === "healthy" ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-emerald-500 p-2 rounded-lg text-white", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.959 11.959 0 01-1.25 12.154c-1.129 1.488-2.66 2.766-4.368 3.664a11.938 11.938 0 01-8.618 0 11.93 11.93 0 01-4.368-3.664 11.959 11.959 0 01-1.25-12.154m17.236 0l-8.618 3.04L3.382 6.016" }) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-emerald-900", children: "Infrastructure Online" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-700 font-medium", children: "All tracking nodes are operational." })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "px-2 py-1 bg-emerald-200 text-emerald-800 text-[9px] font-black uppercase rounded", children: "Healthy" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 border border-gray-100 rounded-xl", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest", children: "Active Orchestrator" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-800", children: infrastructure.engine || "Docker Orcherstrator" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 border border-gray-100 rounded-xl", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest", children: "Resource Cluster" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-800", children: infrastructure.cluster || infrastructure.sidecar || "N/A" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-rose-500 p-2 rounded-lg text-white", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-rose-900", children: "Infrastructure Degraded" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-rose-700 font-medium", children: infrastructure.message || "Connecting to nodes failed." })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-gray-100", children: /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900", children: "Billing Enforcement" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 flex-1 flex flex-col justify-center items-center text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-50 p-4 rounded-full mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-indigo-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-800", children: "No recent suspensions." }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 mt-1", children: "Automatic quota enforcement is active. Next run at 03:00 PM." })
        ] })
      ] })
    ] })
  ] });
}
export {
  HealthDeck as default
};
