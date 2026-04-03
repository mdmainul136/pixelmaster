import { jsxs, jsx } from "react/jsx-runtime";
import React__default, { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, router } from "@inertiajs/react";
import { Split, HelpCircle, Filter, TrendingUp, ArrowRight, Clock, MousePointer2, PieChart } from "lucide-react";
const Attribution = ({ container, report, paths, filters, models }) => {
  const [activeModel, setActiveModel] = useState(filters.model);
  const [activeDays, setActiveDays] = useState(filters.days);
  const updateFilters = (newModel, newDays) => {
    router.get(route("ior.tracking.attribution"), {
      model: newModel || activeModel,
      days: newDays || activeDays
    }, { preserveState: true });
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Attribution — ${container.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 text-white", children: /* @__PURE__ */ jsx(Split, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Attribution Analytics" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Understand the true ROI of your marketing ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: "across all touchpoints" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex bg-slate-100 p-1 rounded-xl border border-slate-200", children: [30, 60, 90].map((d) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setActiveDays(d);
              updateFilters(null, d);
            },
            className: `px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDays === d ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
            children: [
              d,
              "D"
            ]
          },
          d
        )) }),
        /* @__PURE__ */ jsx("button", { className: "px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200", children: "Export Dataset" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2", children: "Select Model" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: models.map((m) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setActiveModel(m.id);
              updateFilters(m.id, null);
            },
            className: `w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${activeModel === m.id ? "bg-white border-indigo-600 shadow-xl shadow-indigo-50" : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-300"}`,
            children: [
              activeModel === m.id && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-12 h-12 bg-indigo-600/5 rotate-45 -mr-6 -mt-6" }),
              /* @__PURE__ */ jsx("h4", { className: `text-xs font-black uppercase tracking-widest ${activeModel === m.id ? "text-indigo-600" : "text-slate-900"}`, children: m.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 mt-1 font-medium leading-relaxed", children: m.desc })
            ]
          },
          m.id
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-4 opacity-20", children: /* @__PURE__ */ jsx(HelpCircle, { size: 40 }) }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-black uppercase tracking-widest mb-3", children: "Model Comparison" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium leading-relaxed", children: 'Switch models to see how your "First Click" strategy performs against "Last Click". Position-based is recommended for balanced Growth.' })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-9", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-widest", children: "Channel ROI Breakdown" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 font-medium", children: "Attributed revenue grouped by acquisition source." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100", children: [
            /* @__PURE__ */ jsx(Filter, { size: 14, className: "text-indigo-600" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-indigo-600 uppercase tracking-widest", children: activeModel.replace("_", " ") })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-100 italic", children: [
            /* @__PURE__ */ jsx("th", { className: "pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Source Channel" }),
            /* @__PURE__ */ jsx("th", { className: "pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center", children: "Touchpoints" }),
            /* @__PURE__ */ jsx("th", { className: "pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center", children: "Conversions" }),
            /* @__PURE__ */ jsx("th", { className: "pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right", children: "Attributed Value" }),
            /* @__PURE__ */ jsx("th", { className: "pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right", children: "E-ROAS" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: (report.attributed || []).map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-slate-50 transition-colors border-b border-slate-50", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-5 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px]", style: { backgroundColor: row.color || "#6366f1" }, children: row.channel.charAt(0) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-slate-900", children: row.channel }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 uppercase tracking-tighter", children: row.campaign || "N/A" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-5 text-center text-xs font-bold text-slate-600", children: row.touchpoints || 0 }),
            /* @__PURE__ */ jsx("td", { className: "py-5 text-center text-xs font-black text-slate-900", children: Math.round(row.conversions) }),
            /* @__PURE__ */ jsxs("td", { className: "py-5 text-right text-xs font-black text-slate-900", children: [
              "$",
              (row.value || 0).toLocaleString()
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-5 text-right", children: /* @__PURE__ */ jsxs("span", { className: `px-2 py-1 rounded text-[10px] font-black ${(row.roi || 0) > 400 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`, children: [
              (row.roi || 4.2).toFixed(1),
              "x"
            ] }) })
          ] }, i)) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "text-indigo-600", size: 20 }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-widest", children: "Top Conversion Paths" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: (paths || []).map((p, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-3 mb-4", children: (p.path || []).map((step, si) => /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-700", children: step }),
            si < p.path.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { size: 12, className: "text-slate-300" })
          ] }, si)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-tighter", children: "Conv" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-900", children: p.count || p.conversions })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-tighter", children: "Revenue" }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-900", children: [
                  "$",
                  (p.total_value || p.revenue).toLocaleString()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-slate-400", children: [
              /* @__PURE__ */ jsx(Clock, { size: 12 }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold", children: [
                (p.avg_days || 12.5).toFixed(1),
                " Days To Purchase"
              ] })
            ] })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
            /* @__PURE__ */ jsx(MousePointer2, { className: "text-emerald-600", size: 20 }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-widest", children: "Identity Resolution Audit" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 rounded-3xl p-6 border border-emerald-100 group hover:shadow-xl hover:shadow-emerald-50 transition-all", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1", children: "Identified Customers" }),
              /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-emerald-900", children: "82.4%" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-600/60 mt-2 font-bold uppercase tracking-tight", children: "+14% Growth MoM" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50 rounded-3xl p-6 border border-indigo-100 group hover:shadow-xl hover:shadow-indigo-50 transition-all", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1", children: "Retroactive Links" }),
              /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-indigo-900", children: "4,280" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-600/60 mt-2 font-bold uppercase tracking-tight", children: "Anonymous Events Linked" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-5 bg-slate-900 rounded-3xl text-white", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(PieChart, { size: 20, className: "text-indigo-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-black uppercase tracking-widest mb-1", children: "Path Transparency enabled" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 leading-relaxed font-medium", children: "Our engine automatically merges visitor sessions across devices when they provide identity signals (email/phone). This reveals the full journey from the very first anonymous touchpoint." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 pt-8 border-t border-slate-100", children: /* @__PURE__ */ jsx("button", { className: "w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all", children: "Configure Attribution Rules" }) })
      ] })
    ] })
  ] });
};
export {
  Attribution as default
};
