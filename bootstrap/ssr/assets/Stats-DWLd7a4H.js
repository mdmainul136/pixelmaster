import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
function Stats({ recent_blocked, blocked_count_24h }) {
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Security Statistics" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Security Statistics" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Real-time overview of blocked attempts and rate-limit violations." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Blocked (24h)" }),
      /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-red-600", children: blocked_count_24h })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800", children: "Recent Rate Limit Violations" }) }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest", children: "IP Address" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest", children: "Route" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest", children: "Timestamp" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 font-medium", children: recent_blocked.length > 0 ? recent_blocked.map((item, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 font-mono text-slate-900", children: item.ip }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-600", children: item.route || "N/A" }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-500", children: new Date(item.timestamp * 1e3).toLocaleString() })
        ] }, idx)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "3", className: "px-6 py-12 text-center text-slate-400 italic", children: "No recent violations detected." }) }) })
      ] })
    ] })
  ] });
}
export {
  Stats as default
};
