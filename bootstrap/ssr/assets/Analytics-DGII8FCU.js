import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import { BarChart3, Activity, Zap, Shield, Monitor, Fullscreen, RefreshCw, ExternalLink } from "lucide-react";
const Analytics = ({ container, analytics, stats }) => {
  const [view, setView] = useState("overview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    const iframe = document.getElementById("metabase-frame");
    if (!isFullscreen) {
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
      else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };
  if (!analytics.configured) {
    return /* @__PURE__ */ jsx(PlatformLayout, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] text-center p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-400", children: /* @__PURE__ */ jsx(BarChart3, { size: 40 }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-slate-900 uppercase tracking-widest", children: "Analytics Not Provisioned" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2 max-w-sm text-sm", children: "Your dedicated Metabase dashboard is being prepared. It will appear here automatically once your sGTM container is fully live." }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 flex gap-4", children: /* @__PURE__ */ jsx("button", { className: "px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200", children: "Check Readiness" }) })
    ] }) });
  }
  const currentUrl = view === "overview" ? analytics.embed_url : analytics.realtime_url;
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Analytics Hub — ${container.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2 rounded-2xl shadow-lg shadow-indigo-200 text-white", children: /* @__PURE__ */ jsx(Activity, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Marketing Intelligence Hub" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Advanced analytics filtered for ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: container.name }),
          " signals."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setView("overview"),
            className: `px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === "overview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
            children: "BI Overview"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setView("realtime"),
            className: `px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === "realtime" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
            children: "Live Events"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600", children: /* @__PURE__ */ jsx(Zap, { size: 22, className: "group-hover:scale-110 transition-transform" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Active Signals" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-slate-900 leading-tight", children: "Flowing" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-500 font-bold uppercase mt-0.5", children: "Real-time Stream OK" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600", children: /* @__PURE__ */ jsx(Shield, { size: 22, className: "group-hover:scale-110 transition-transform" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Data Privacy" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-slate-900 leading-tight", children: "Isolated" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-bold uppercase mt-0.5", children: "H256 JWT Signed Hash" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 group hover:border-rose-200 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600", children: /* @__PURE__ */ jsx(Monitor, { size: 22, className: "group-hover:scale-110 transition-transform" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Source Engine" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xl font-black text-slate-900 leading-tight", children: [
            "Metabase ",
            container.metabase_type === "cloud" ? "Cloud ☁️" : "Local 🏠"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-bold uppercase mt-0.5", children: container.metabase_type === "cloud" ? "SaaS Hub Connected" : "Dedicated Instance" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: toggleFullscreen,
            className: "p-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all",
            title: "Toggle Fullscreen",
            children: /* @__PURE__ */ jsx(Fullscreen, { size: 18, strokeWidth: 2.5 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all",
            title: "Refresh Report",
            onClick: () => {
              const frame = document.getElementById("metabase-frame");
              frame.src = frame.src;
            },
            children: /* @__PURE__ */ jsx(RefreshCw, { size: 18, strokeWidth: 2.5 })
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: analytics.embed_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "p-2.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all",
            title: "Open External",
            children: /* @__PURE__ */ jsx(ExternalLink, { size: 18, strokeWidth: 2.5 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-indigo-100/50 overflow-hidden min-h-[700px] flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between italic", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]", children: [
            view,
            " dashboard session active"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-4", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[10px] font-bold text-emerald-600", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
            "Secured via JWT"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 relative bg-slate-50", children: currentUrl ? /* @__PURE__ */ jsx(
          "iframe",
          {
            id: "metabase-frame",
            src: currentUrl,
            frameBorder: "0",
            width: "100%",
            height: "100%",
            className: "w-full h-full min-h-[700px] border-none",
            onLoad: () => console.log("Metabase loaded"),
            allowTransparency: true
          }
        ) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-slate-300 font-black italic uppercase tracking-widest", children: "Rendering Engine Failed" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-slate-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20", children: /* @__PURE__ */ jsx(BarChart3, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-white font-bold tracking-tight", children: "How this data is processed" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs mt-1 max-w-lg leading-relaxed", children: "Captured signals flow through your sGTM container into a high-performance ClickHouse cluster. Metabase queries this data in real-time, isolated by your dedicated Container ID using cryptographic signature verification." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "whitespace-nowrap px-8 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors", children: "Export Raw Dataset" })
    ] })
  ] });
};
export {
  Analytics as default
};
