import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { usePage, Head, router } from "@inertiajs/react";
import { Target, Calendar, ArrowRight, TrendingUp, ChevronDown, GitMerge, ChevronRight, ShieldCheck, Zap } from "lucide-react";
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
const PLAN_COLORS = {
  free: { bg: "#1e293b", badge: "#475569", text: "#94a3b8" },
  pro: { bg: "#1e1b4b", badge: "#6366f1", text: "#a5b4fc" },
  business: { bg: "#1e3a1e", badge: "#16a34a", text: "#86efac" },
  enterprise: { bg: "#3b1a1a", badge: "#dc2626", text: "#fca5a5" },
  custom: { bg: "#1a1a2e", badge: "#9333ea", text: "#d8b4fe" }
};
function UpgradeBanner({
  feature,
  requiredPlan = "Pro",
  currentPlan,
  compact = false
}) {
  const { plan: sharedPlan = "free" } = usePage().props;
  const activePlan = currentPlan ?? sharedPlan;
  const colors = PLAN_COLORS[requiredPlan == null ? void 0 : requiredPlan.toLowerCase()] ?? PLAN_COLORS.pro;
  if (compact) {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: "upgrade-badge-compact",
        title: `Requires ${requiredPlan} plan`,
        style: {
          background: colors.badge,
          color: "#fff",
          fontSize: "0.65rem",
          padding: "2px 7px",
          borderRadius: "999px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          verticalAlign: "middle",
          marginLeft: "6px"
        },
        children: requiredPlan
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "upgrade-banner",
      style: {
        background: colors.bg,
        border: `1px solid ${colors.badge}33`,
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "12px",
        width: "100%"
      },
      children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "2.5rem", lineHeight: 1 }, children: "🔒" }),
        /* @__PURE__ */ jsxs(
          "span",
          {
            style: {
              background: colors.badge,
              color: "#fff",
              padding: "3px 12px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            },
            children: [
              requiredPlan,
              " Plan"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "p",
            {
              style: {
                margin: 0,
                fontWeight: 600,
                fontSize: "1rem",
                color: "#f1f5f9"
              },
              children: [
                "This feature requires the",
                " ",
                /* @__PURE__ */ jsx("span", { style: { color: colors.text }, children: requiredPlan }),
                " plan"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "p",
            {
              style: {
                margin: "4px 0 0",
                fontSize: "0.82rem",
                color: "#64748b"
              },
              children: [
                "You are currently on the",
                " ",
                /* @__PURE__ */ jsx("strong", { style: { color: "#94a3b8", textTransform: "capitalize" }, children: activePlan }),
                " ",
                "plan."
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/billing",
            style: {
              background: colors.badge,
              color: "#fff",
              padding: "9px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.87rem",
              fontWeight: 600,
              display: "inline-block",
              marginTop: "4px",
              transition: "opacity 0.2s"
            },
            onMouseEnter: (e) => e.target.style.opacity = "0.85",
            onMouseLeave: (e) => e.target.style.opacity = "1",
            children: [
              "Upgrade to ",
              requiredPlan,
              " →"
            ]
          }
        )
      ]
    }
  );
}
function FeatureGate({
  feature,
  requiredPlan = "Pro",
  children,
  fallback = null,
  quiet = false,
  showLock = false
}) {
  const { features = [], plan: serverPlan = "free" } = usePage().props;
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const devPlan = isLocal ? localStorage.getItem("dev_plan_override") : null;
  const plan = devPlan || serverPlan;
  const PLAN_RANK = { free: 0, pro: 1, business: 2, enterprise: 3, custom: 4 };
  const hasPlan = (PLAN_RANK[plan.toLowerCase()] ?? 0) >= (PLAN_RANK[requiredPlan.toLowerCase()] ?? 99);
  const hasFeature = features.includes(feature) || hasPlan;
  if (hasFeature) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  if (quiet) return null;
  if (showLock) {
    return /* @__PURE__ */ jsxs("div", { className: "feature-gate-lock-wrapper", children: [
      /* @__PURE__ */ jsx("div", { className: "feature-gate-blurred", "aria-hidden": "true", children }),
      /* @__PURE__ */ jsx("div", { className: "feature-gate-lock-overlay", children: /* @__PURE__ */ jsx(LockOverlay, { feature, requiredPlan }) })
    ] });
  }
  if (fallback) return /* @__PURE__ */ jsx(Fragment, { children: fallback });
  return /* @__PURE__ */ jsx(
    UpgradeBanner,
    {
      feature,
      requiredPlan,
      currentPlan: plan
    }
  );
}
function LockOverlay({ feature, requiredPlan }) {
  return /* @__PURE__ */ jsxs("div", { className: "feature-gate-lock-content", children: [
    /* @__PURE__ */ jsx("div", { className: "feature-gate-lock-icon", children: "🔒" }),
    /* @__PURE__ */ jsxs("p", { className: "feature-gate-lock-label", children: [
      "Upgrade to ",
      /* @__PURE__ */ jsx("strong", { children: requiredPlan }),
      " to unlock this feature"
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/billing",
        className: "feature-gate-lock-btn",
        children: "Upgrade Now"
      }
    )
  ] });
}
const AttributionModeler = ({ container, matrix, paths, filters }) => {
  const [selectedModel, setSelectedModel] = useState("position_based");
  const [comparisonModel, setComparisonModel] = useState("last_touch");
  const [days, setDays] = useState(filters.days || 30);
  const models = [
    { id: "first_touch", name: "First Click", desc: "Gives 100% credit to the very first touchpoint." },
    { id: "last_touch", name: "Last Click", desc: "Gives 100% credit to the final touchpoint before conversion." },
    { id: "linear", name: "Linear", desc: "Distributes credit equally across all touchpoints." },
    { id: "position_based", name: "Position Based", desc: "40% to first, 40% to last, 20% to the middle." },
    { id: "time_decay", name: "Time Decay", desc: "Touches closer to conversion get more credit." }
  ];
  const getModelLabel = (id) => {
    var _a;
    return ((_a = models.find((m) => m.id === id)) == null ? void 0 : _a.name) || id;
  };
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    router.get(window.location.pathname, { days: newDays }, { preserveState: true });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Attribution Modeler — PixelMaster" }),
    /* @__PURE__ */ jsxs(FeatureGate, { feature: "monitoring", requiredPlan: "Business", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(Target, { size: 20 }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Advanced Attribution Modeler" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
            "Compare Multi-Touch models and identify ",
            /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-bold underline decoration-indigo-200 decoration-2", children: "Incremental Growth" }),
            " across channels."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest", children: [
            /* @__PURE__ */ jsx(Calendar, { size: 14 }),
            " Lookback Window"
          ] }),
          [7, 30, 90].map((d) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleDaysChange(d),
              className: `px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${days === d ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"}`,
              children: [
                d,
                " Days"
              ]
            },
            d
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-8 space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Channel Comparison Matrix" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium tracking-widest uppercase", children: "Performance by Attribution Strategy" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Primary Model" }),
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      value: selectedModel,
                      onChange: (e) => setSelectedModel(e.target.value),
                      className: "w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer",
                      children: models.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, children: m.name }, m.id))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-3 mt-4 text-slate-300", children: /* @__PURE__ */ jsx(ArrowRight, { size: 18 }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Bench Model" }),
                  /* @__PURE__ */ jsx(
                    "select",
                    {
                      value: comparisonModel,
                      onChange: (e) => setComparisonModel(e.target.value),
                      className: "w-48 px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer",
                      children: models.map((m) => /* @__PURE__ */ jsx("option", { value: m.id, children: m.name }, m.id))
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-8 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50", children: [
                /* @__PURE__ */ jsx("th", { className: "pb-4 text-left", children: "Channel Group" }),
                /* @__PURE__ */ jsx("th", { className: "pb-4 text-center", children: getModelLabel(selectedModel) }),
                /* @__PURE__ */ jsx("th", { className: "pb-4 text-center", children: getModelLabel(comparisonModel) }),
                /* @__PURE__ */ jsx("th", { className: "pb-4 text-right", children: "Delta / Lift" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50", children: matrix.map((row, idx) => {
                var _a, _b;
                const primaryVal = ((_a = row.models[selectedModel]) == null ? void 0 : _a.conversions) || 0;
                const benchVal = ((_b = row.models[comparisonModel]) == null ? void 0 : _b.conversions) || 0;
                const delta = benchVal === 0 ? 0 : (primaryVal - benchVal) / benchVal * 100;
                return /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-slate-50/50 transition-all", children: [
                  /* @__PURE__ */ jsx("td", { className: "py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[12px] font-black text-slate-900", children: row.group })
                  ] }) }),
                  /* @__PURE__ */ jsxs("td", { className: "py-5 text-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-900", children: primaryVal.toFixed(2) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5", children: "Conversions" })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "py-5 text-center", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500", children: benchVal.toFixed(2) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-medium text-slate-300 uppercase tracking-tighter mt-0.5", children: "Bench Score" })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "py-5 text-right", children: /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${delta > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`, children: [
                    delta > 0 ? /* @__PURE__ */ jsx(TrendingUp, { size: 12 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 12 }),
                    delta > 0 ? "+" : "",
                    delta.toFixed(1),
                    "% Lift"
                  ] }) })
                ] }, idx);
              }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-10", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Top Conversion Journeys" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5", children: "Most common multi-touch paths to purchase" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl", children: /* @__PURE__ */ jsx(GitMerge, { size: 20 }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-6", children: paths.map((p, idx) => /* @__PURE__ */ jsxs("div", { className: "group p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border-l-4 border-l-indigo-500", children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-3 mb-4", children: p.path.map((step, sIdx) => /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 transition-all group-hover:scale-105", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-1.5 h-1.5 rounded-full ${sIdx === 0 ? "bg-emerald-500" : sIdx === p.path.length - 1 ? "bg-indigo-600" : "bg-slate-300"}` }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-700 uppercase tracking-tight", children: step })
                ] }),
                sIdx < p.path.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { size: 14, className: "text-slate-300" })
              ] }, sIdx)) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [
                    "Occurrences: ",
                    /* @__PURE__ */ jsx("span", { className: "text-slate-900", children: p.count })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [
                    "Total ROI Value: ",
                    /* @__PURE__ */ jsxs("span", { className: "text-emerald-600", children: [
                      "$",
                      p.total_value.toLocaleString()
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("button", { className: "text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all", children: [
                  "Audit Journey ",
                  /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
                ] })
              ] })
            ] }, idx)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-4 space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(ShieldCheck, { size: 18, className: "text-indigo-400" }),
                " Attribution Intelligence"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-medium leading-relaxed mb-10", children: "Switching models changes how ROI is calculated. PixelMaster uses first-party cookies to track journeys for up to 90 days." }),
              /* @__PURE__ */ jsx("div", { className: "space-y-6", children: models.map((m) => /* @__PURE__ */ jsxs(
                "div",
                {
                  onClick: () => setSelectedModel(m.id),
                  className: `p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedModel === m.id ? "bg-white/10 border-indigo-500 shadow-xl" : "bg-white/5 border-transparent hover:bg-white/10"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-[11px] font-black uppercase tracking-widest", children: m.name }),
                      m.id === "position_based" && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-indigo-500 text-[8px] font-black uppercase rounded-lg", children: "Recommended" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium leading-normal", children: m.desc })
                  ]
                },
                m.id
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2 rounded-xl text-white", children: /* @__PURE__ */ jsx(Zap, { size: 16, fill: "currentColor" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-[11px] font-black text-slate-900 uppercase tracking-widest", children: "Incrementality Score" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium leading-relaxed mb-6", children: 'Determines the "True Value" of a channel. High lift in Position-Based vs Last-Click indicates a strong "Assist" channel.' }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-2xl", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-slate-400", children: "Meta Assist" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-emerald-600", children: "+22% Lift" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-2xl", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-slate-400", children: "Google Reach" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-indigo-600", children: "+14% Lift" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  AttributionModeler as default
};
