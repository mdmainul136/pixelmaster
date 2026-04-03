import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { Head, Link } from "@inertiajs/react";
import { BrainCircuit, Sparkles, RefreshCcw, ShieldCheck, TrendingUp, AlertTriangle, Zap, ChevronRight, PieChart, BarChart3, Rocket, Users, ArrowUpRight, Activity } from "lucide-react";
import "@tanstack/react-query";
import "axios";
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
const AiInsightsDashboard = ({ insights = [], predictive = {}, container }) => {
  var _a;
  const [isLoading, setIsLoading] = useState(false);
  const getSeverityColor = (sev) => {
    switch (sev == null ? void 0 : sev.toLowerCase()) {
      case "critical":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "warning":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "success":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "AI Predictive Insights — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(BrainCircuit, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "AI Advisor & Predictive Analytics" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100", children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 10, fill: "currentColor" }),
            " Powered by Gemini"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Forward-looking growth strategies. ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-bold decoration-indigo-200 decoration-2 underline", children: "Predict LTV and prevent churn" }),
          " before it happens."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setIsLoading(true),
            className: "flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm",
            children: [
              /* @__PURE__ */ jsx(RefreshCcw, { size: 14, className: isLoading ? "animate-spin" : "" }),
              " Refresh AI Engine"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { size: 16 }),
          " Data Health: ",
          predictive.health_score || 0,
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4", children: "Predicted Revenue Upside" }),
            /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black tracking-tight mb-2", children: [
              "$",
              ((_a = predictive.total_predicted_upside) == null ? void 0 : _a.toLocaleString()) || 0
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 font-medium", children: "90-Day Retention Multiplier Forecast" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase", children: [
              /* @__PURE__ */ jsx(TrendingUp, { size: 12, className: "text-emerald-400" }),
              " +14.2% Growth Potential"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4", children: "VIP Churn Risk" }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black tracking-tight mb-2 text-rose-600", children: predictive.vip_at_risk || 0 }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 font-medium", children: 'High-LTV Contacts in "Critical" Zone' }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 px-4 py-2 bg-rose-50 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-rose-600 border border-rose-100", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { size: 12 }),
            " Priority 1: Retain"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4", children: "pLTV Accuracy Score" }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black tracking-tight mb-2 text-indigo-600", children: "92.4%" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 font-medium", children: "Confidence in 12-Month Predictions" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 px-4 py-2 bg-indigo-50 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 border border-indigo-100", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { size: 12 }),
            " High Signal Strength"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8 px-2", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Zap, { size: 18, fill: "currentColor", className: "text-amber-500" }),
            " AI Advisor Priority Insight Feed"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: "Real-time Analysis Feed" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: insights.map((insight, idx) => /* @__PURE__ */ jsxs("div", { className: `p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] ${getSeverityColor(insight.severity)}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 bg-white/50 border border-white rounded-full text-[9px] font-black uppercase tracking-widest", children: [
              insight.type,
              " — ",
              insight.severity
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-2 border border-current/20 rounded-xl", children: /* @__PURE__ */ jsx(Zap, { size: 14, fill: "currentColor" }) })
          ] }),
          /* @__PURE__ */ jsx("h4", { className: "text-[13px] font-black mb-2 uppercase tracking-tight", children: insight.title }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium leading-relaxed mb-6 opacity-80", children: insight.message }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-black uppercase tracking-tighter", children: [
              "Impact: ",
              /* @__PURE__ */ jsx("span", { className: "underline decoration-2", children: insight.impact })
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: insight.action_link, className: "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-0.5 hover:gap-4 transition-all", children: [
              "Explore Strategy ",
              /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
            ] })
          ] })
        ] }, idx)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10 overflow-hidden relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Predictive Health Matrix" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest", children: "Churn Probability Heatmap" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-slate-100 p-2.5 rounded-2xl", children: /* @__PURE__ */ jsx(PieChart, { size: 18, className: "text-slate-500" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-6 mb-10", children: Object.entries(predictive.risk_distribution || {}).map(([level, count]) => {
          const levelColors = {
            Safe: "bg-emerald-500",
            Warning: "bg-amber-400",
            High: "bg-orange-500",
            Critical: "bg-rose-600"
          };
          return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center relative group overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-0 w-full h-1 ${levelColors[level]}` }),
            /* @__PURE__ */ jsxs("h5", { className: "text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-2", children: [
              level,
              " Risk"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-black text-slate-900", children: count }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-slate-400 uppercase mt-1", children: "Customers" })
          ] }, level);
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-8 bg-indigo-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-4 bg-white/10 rounded-2.5xl", children: /* @__PURE__ */ jsx(BarChart3, { className: "text-indigo-400", size: 24 }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-[13px] font-black uppercase tracking-tight", children: "Generate Quarterly Revenue Strategy?" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: "Gemini will analyze your full CDP data to build a retention plan." })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105", children: "Upgrade to Pro" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-100 rounded-[3rem] p-10 h-full flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-emerald-600 p-2 rounded-xl text-white", children: /* @__PURE__ */ jsx(Rocket, { size: 16 }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-[11px] font-black text-slate-900 uppercase tracking-widest", children: "Master ROI Strategy" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6 flex-grow", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group cursor-pointer hover:border-emerald-500 transition-all", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-50 rounded-xl text-emerald-600", children: /* @__PURE__ */ jsx(Users, { size: 18 }) }),
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, className: "text-slate-300 group-hover:text-emerald-500" })
            ] }),
            /* @__PURE__ */ jsx("h5", { className: "text-[11px] font-black uppercase text-slate-900 mb-2", children: "Target At-Risk VIPs" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-500 font-medium leading-relaxed", children: [
              "We've found ",
              predictive.vip_at_risk || 0,
              " high-value customers who haven't ordered in 45+ days."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group cursor-pointer hover:border-indigo-500 transition-all", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-indigo-50 rounded-xl text-indigo-600", children: /* @__PURE__ */ jsx(Activity, { size: 18 }) }),
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, className: "text-slate-300 group-hover:text-indigo-500" })
            ] }),
            /* @__PURE__ */ jsx("h5", { className: "text-[11px] font-black uppercase text-slate-900 mb-2", children: "Boost pLTV Upside" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-500 font-medium leading-relaxed", children: [
              "Identify conversion gaps in Meta CAPI to recapture attribution worth \\$",
              (predictive.total_predicted_upside || 0) * 0.1,
              " in 30 days."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 p-6 bg-white rounded-[2rem] text-center border-2 border-dashed border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2", children: "CDP Integration Active" }),
          /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium leading-relaxed", children: "Every tracking event contributes to predictive learning." })
        ] })
      ] }) })
    ] })
  ] });
};
export {
  AiInsightsDashboard as default
};
