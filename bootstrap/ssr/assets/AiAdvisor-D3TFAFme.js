import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { BrainCircuit, Zap, RefreshCw, Cpu, Sparkles, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
const InsightCard = ({ insight }) => {
  const isAi = insight.type === "AI_STRATEGY";
  const borders = {
    Critical: "border-rose-200 bg-rose-50/30",
    Warning: "border-amber-200 bg-amber-50/30",
    Opportunity: "border-indigo-200 bg-indigo-50/30",
    Info: "border-slate-200 bg-slate-50/30"
  };
  return /* @__PURE__ */ jsxs("div", { className: `p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl hover:scale-[1.01] ${borders[insight.severity]} relative overflow-hidden group`, children: [
    isAi && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform", children: /* @__PURE__ */ jsx(BrainCircuit, { size: 48, className: "text-indigo-600" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${insight.severity === "Critical" ? "bg-rose-500 text-white" : insight.severity === "Warning" ? "bg-amber-500 text-white" : "bg-slate-900 text-white"}`, children: insight.severity }),
        isAi && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse", children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 10 }),
          " AI Powered"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest italic", children: [
        insight.impact,
        " IMPACT"
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 mb-2 tracking-tight", children: insight.title }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-600 font-medium leading-relaxed mb-6 whitespace-pre-wrap", children: insight.message }),
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: insight.action_link,
        className: "inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm",
        children: [
          insight.action_label,
          " ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
        ]
      }
    )
  ] });
};
const AiAdvisor = () => {
  const [insights, setInsights] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchInsights();
  }, []);
  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/tracking/ai/insights");
      setInsights(res.data.data);
      setBenchmarks({
        avg_emq: 7.2,
        avg_dedup: 96,
        top_performing: 9.4,
        coverage: { em: 88, ph: 55, fbp: 99, fbc: 75 }
      });
    } catch (error) {
      console.error("Failed to fetch AI insights");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "AI Strategic Advisor — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-100 text-white", children: /* @__PURE__ */ jsx(BrainCircuit, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "AI Strategic Advisor" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Leveraging ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: "Google Gemini 1.5 Pro" }),
          " to analyze your sGTM datasets."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-col items-end mr-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Automation Status" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-emerald-600 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Zap, { size: 12, fill: "currentColor" }),
            " Critical Alerts Active"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: fetchInsights,
            disabled: loading,
            className: "px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsx(RefreshCw, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsx(Cpu, { size: 14 }),
              "Refresh Analysis"
            ]
          }
        )
      ] })
    ] }),
    !loading && benchmarks && /* @__PURE__ */ jsxs("div", { className: "mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 p-8 bg-indigo-50/50 border-2 border-indigo-100 rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1 space-y-1", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 16, className: "text-indigo-500" }),
          " Market Benchmarking"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium uppercase tracking-tighter italic", children: "Comparison against E-commerce Average" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Avg EMQ" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-indigo-600 tracking-tight", children: benchmarks.avg_emq }),
        /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold text-slate-400 uppercase mt-1", children: "Industry Standard" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Deduplication" }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black text-emerald-600 tracking-tight", children: [
          benchmarks.avg_dedup,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold text-slate-400 uppercase mt-1", children: "Target Match Rate" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm flex flex-col items-center justify-center text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Top 1% ROI" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-amber-500 tracking-tight", children: "9.4x" }),
        /* @__PURE__ */ jsx("div", { className: "text-[8px] font-bold text-slate-400 uppercase mt-1", children: "Max Optimization" })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[40vh] bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-[3rem]", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-indigo-200 rounded-full blur-xl animate-ping opacity-50" }),
        /* @__PURE__ */ jsx(BrainCircuit, { size: 48, className: "text-indigo-600 relative" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-indigo-900 uppercase tracking-[0.2em] animate-pulse", children: "Gemini 1.5 is analyzing your signals..." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
      insights.map((insight, i) => /* @__PURE__ */ jsx(InsightCard, { insight }, i)),
      /* @__PURE__ */ jsxs("div", { className: "p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-all cursor-pointer", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all mb-4", children: /* @__PURE__ */ jsx(Lightbulb, { size: 24 }) }),
        /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-widest mb-2", children: "Continuous Learning" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter", children: "Check back in 24 hours as the model digests more of your ClickHouse event stream." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row items-center gap-10", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Zap, { size: 32, className: "text-amber-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-black tracking-tight", children: "How the AI Advisor Works" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 mt-2 max-w-3xl leading-relaxed font-medium", children: "Our AI Advisor doesn't just look at numbers. It combines **Heuristic Rule-Checking** (for critical infrastructure errors) with **Generative Intelligence** (for high-level marketing strategy). By analyzing the relationship between your EMQ Match Quality and your First-Party Attribution Gaps, it provides the same value as a $5,000/mo marketing consultant." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 mt-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-slate-300 uppercase border border-white/5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 12, className: "text-emerald-400" }),
              " Clickhouse Data Stream"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-slate-300 uppercase border border-white/5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 12, className: "text-indigo-400" }),
              " Gemini 1.5 Pro Analysis"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-slate-300 uppercase border border-white/5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { size: 12, className: "text-rose-400" }),
              " PII Anonymization"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  AiAdvisor as default
};
