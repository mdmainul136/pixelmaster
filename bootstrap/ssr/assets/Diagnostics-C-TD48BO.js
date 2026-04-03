import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { Activity, ShieldCheck, Zap, CheckCircle2, AlertCircle, Database, ChevronRight, Fingerprint, Info, TrendingUp } from "lucide-react";
const ProgressBar = ({ label, percentage, color = "indigo" }) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500", children: [
    /* @__PURE__ */ jsx("span", { children: label }),
    /* @__PURE__ */ jsxs("span", { children: [
      Math.round(percentage * 100),
      "%"
    ] })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50", children: /* @__PURE__ */ jsx(
    "div",
    {
      className: `h-full bg-${color}-500 shadow-lg shadow-${color}-100 transition-all duration-1000`,
      style: { width: `${percentage * 100}%` }
    }
  ) })
] });
const Diagnostics = ({ container }) => {
  const [quality, setQuality] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        axios.get(`/api/tracking/diagnostics/${container.id}/quality`),
        axios.get(`/api/tracking/diagnostics/${container.id}/trends`)
      ]);
      setQuality(qRes.data.data);
      setTrends(tRes.data.data);
    } catch (error) {
      console.error("Failed to fetch diagnostics");
    } finally {
      setLoading(false);
    }
  };
  if (loading) return /* @__PURE__ */ jsx(PlatformLayout, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsx(Activity, { className: "w-10 h-10 text-indigo-500 animate-pulse" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-slate-400 uppercase tracking-widest", children: "Running Diagnostic Engine..." })
  ] }) }) });
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Diagnostics — ${container.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex justify-between items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-rose-500 p-2.5 rounded-2xl shadow-lg shadow-rose-100 text-white", children: /* @__PURE__ */ jsx(ShieldCheck, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "CAPI Diagnostics & Quality" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Deep-dive analysis of ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: "Event Match Quality (EMQ)" }),
          " and parameter coverage."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: fetchData,
            className: "px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { size: 14 }),
              " Refresh Audit"
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200", children: "Export Report" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" }),
          /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 block", children: "Global Signal Quality" }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center relative scale-110", children: /* @__PURE__ */ jsxs("div", { className: "relative w-48 h-48 flex items-center justify-center", children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-full h-full -rotate-90", children: [
              /* @__PURE__ */ jsx("circle", { cx: "96", cy: "96", r: "88", fill: "none", stroke: "#f1f5f9", strokeWidth: "12" }),
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: "96",
                  cy: "96",
                  r: "88",
                  fill: "none",
                  stroke: "#4f46e5",
                  strokeWidth: "12",
                  strokeDasharray: "552.92",
                  strokeDashoffset: 552.92 - 552.92 * (quality.score / 10),
                  strokeLinecap: "round",
                  className: "transition-all duration-1000 ease-out"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-6xl font-black text-slate-900 tracking-tighter", children: quality.score }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-indigo-500 uppercase tracking-widest", children: "Score / 10" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-10 text-center", children: [
            /* @__PURE__ */ jsxs("span", { className: `px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${quality.rating === "Great" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : quality.rating === "Good" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`, children: [
              quality.rating,
              " Quality"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-400 mt-4 font-medium leading-relaxed", children: [
              "Your signal match quality is ",
              /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: quality.rating.toLowerCase() }),
              ". High scores directly reduce ad acquisition costs."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx(Zap, { size: 18, className: "text-amber-400" }),
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-widest", children: "Deduplication Matching" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-b border-white/5 pb-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-tighter", children: "Matched Events" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xl font-black", children: [
                  Math.round(quality.stats.deduplication.matched * 100),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(CheckCircle2, { className: "text-emerald-400 pb-1", size: 20 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-b border-white/5 pb-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-tighter", children: "Server Only (Gap)" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xl font-black", children: [
                  Math.round(quality.stats.deduplication.unmatched_server * 100),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(AlertCircle, { className: "text-amber-400 pb-1", size: 20 })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-10", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-widest", children: "Parameter Coverage Audit" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 font-medium", children: "Tracking percentage of individual user identifiers." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100", children: [
              /* @__PURE__ */ jsx(Database, { size: 14, className: "text-slate-400" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-600 uppercase", children: "30D Dataset" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10", children: [
            /* @__PURE__ */ jsx(ProgressBar, { label: "Email Hash (sha256)", percentage: quality.stats.coverage.em, color: "indigo" }),
            /* @__PURE__ */ jsx(ProgressBar, { label: "FBP (Browser ID)", percentage: quality.stats.coverage.fbp, color: "emerald" }),
            /* @__PURE__ */ jsx(ProgressBar, { label: "FBC (Click ID)", percentage: quality.stats.coverage.fbc, color: "blue" }),
            /* @__PURE__ */ jsx(ProgressBar, { label: "Phone Hash", percentage: quality.stats.coverage.ph, color: "rose" }),
            /* @__PURE__ */ jsx(ProgressBar, { label: "First/Last Name", percentage: quality.stats.coverage.fn, color: "amber" }),
            /* @__PURE__ */ jsx(ProgressBar, { label: "User Agent / IP", percentage: quality.stats.coverage.ua, color: "slate" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-6 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h4", { className: "flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }),
              " Optimization Advisor"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: quality.recommendations.map((rec, i) => /* @__PURE__ */ jsxs("div", { className: "group p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxs("span", { className: `text-[9px] font-black uppercase px-2 py-0.5 rounded ${rec.priority === "High" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`, children: [
                  rec.priority,
                  " PRIO"
                ] }),
                /* @__PURE__ */ jsx(ChevronRight, { size: 14, className: "text-slate-300 group-hover:text-indigo-400 transition-colors" })
              ] }),
              /* @__PURE__ */ jsx("h5", { className: "text-xs font-bold text-slate-900", children: rec.title }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 mt-1 leading-relaxed font-medium", children: rec.message })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Fingerprint, { size: 32, className: "mb-4 text-indigo-200/50" }),
              /* @__PURE__ */ jsx("h4", { className: "text-lg font-black tracking-tight leading-tight mb-2", children: "Secure Identity Resolution" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-indigo-100/80 leading-relaxed font-medium", children: "All parameters are hashed on the fly before being transmitted to third-party endpoints. Your tracking remains GDPR/CCPA compliant while maximizing match quality." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-indigo-400/30 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Info, { size: 14, className: "text-indigo-200" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest", children: "Automatic Hashing Enabled" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 p-8 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col md:flex-row items-center gap-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative w-32 h-32 shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-slate-100 rounded-3xl rotate-6" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-indigo-500 rounded-3xl -rotate-3 flex items-center justify-center text-white shadow-2xl", children: /* @__PURE__ */ jsx(TrendingUp, { size: 40 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-900 tracking-tight", children: "Understanding EMQ Scores" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed font-medium", children: [
          "Event Match Quality (EMQ) measures how well Facebook can link server-side events back to a specific person. A score of ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: "10.0" }),
          " means perfect identification, resulting in higher attribution precision and up to 30% lower CPA for your marketing campaigns."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-8 mt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-indigo-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-700 uppercase", children: "First-Party Signals" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-700 uppercase", children: "Cryptographic Anonymization" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-rose-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-700 uppercase", children: "Dataset Health Alerts" })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  Diagnostics as default
};
