import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { Head } from "@inertiajs/react";
import { User, Fingerprint, Mail, Phone, Clock, Map, ShieldCheck, Smartphone, Globe, Zap, ArrowUpRight } from "lucide-react";
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
const SingleCustomerView = ({ container, identity, timeline }) => {
  var _a;
  const [activeTab, setActiveTab] = useState("timeline");
  const getSourceIcon = (source) => {
    if (source == null ? void 0 : source.toLowerCase().includes("google")) return /* @__PURE__ */ jsx(Globe, { size: 14, className: "text-blue-500" });
    if ((source == null ? void 0 : source.toLowerCase().includes("facebook")) || (source == null ? void 0 : source.toLowerCase().includes("meta"))) return /* @__PURE__ */ jsx(Zap, { size: 14, className: "text-indigo-500" });
    return /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, className: "text-slate-400" });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `CDP: ${identity.email_hash ? "Unified Profile" : "Anonymous Journey"} — PixelMaster` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-start justify-between gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" }),
          /* @__PURE__ */ jsx(User, { size: 32 })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: identity.email_hash ? `Identity #${identity.id}` : "Anonymous Prospect" }),
            /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${identity.segment_color}-50 text-${identity.segment_color}-600 border border-${identity.segment_color}-100 shadow-sm`, children: identity.customer_segment })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl", children: [
              /* @__PURE__ */ jsx(Fingerprint, { size: 14 }),
              " ",
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px]", children: [
                (_a = identity.primary_anonymous_id) == null ? void 0 : _a.substr(0, 12),
                "..."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl", children: [
              /* @__PURE__ */ jsx(Mail, { size: 14 }),
              " ",
              identity.email_hash ? /* @__PURE__ */ jsx("span", { className: "blur-[3px] hover:blur-0 transition-all", children: "hashed_email_value" }) : "Unidentified"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl", children: [
              /* @__PURE__ */ jsx(Phone, { size: 14 }),
              " ",
              identity.phone_hash ? /* @__PURE__ */ jsx("span", { className: "blur-[3px] hover:blur-0 transition-all", children: "hashed_phone_value" }) : "Unidentified"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-center min-w-[120px]", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Lifetime Value" }),
          /* @__PURE__ */ jsxs("span", { className: "text-lg font-black text-emerald-600 tracking-tight", children: [
            "$",
            identity.total_spent.toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-center min-w-[120px]", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Total Orders" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-black text-slate-900 tracking-tight", children: identity.order_count })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-8 space-y-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Clock, { size: 18, className: "text-slate-400" }),
            " Unified Journey Timeline"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("button", { className: "px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest", children: "All Events" }),
            /* @__PURE__ */ jsx("button", { className: "px-5 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200", children: "Purchases Only" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-10 relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-[59px] top-10 bottom-10 w-0.5 bg-slate-100" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-12", children: timeline.map((event, idx) => {
            var _a2, _b, _c, _d;
            return /* @__PURE__ */ jsxs("div", { className: "relative flex items-start gap-8 group", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-[44px] text-right flex flex-col pt-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-900 uppercase", children: new Date(event.processed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold text-slate-400 uppercase tracking-tighter", children: new Date(event.processed_at).toLocaleDateString([], { month: "short", day: "numeric" }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `z-10 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 mt-0.5 ${event.event_name === "purchase" ? "bg-emerald-500" : "bg-slate-200 group-hover:bg-indigo-500 transition-all"}` }),
              /* @__PURE__ */ jsxs("div", { className: `flex-grow p-6 rounded-[2rem] border transition-all ${event.event_name === "purchase" ? "bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-50/50" : "bg-white border-slate-50 hover:border-slate-200 hover:shadow-lg"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-tight", children: event.event_name }),
                    event.identity_id && ((_a2 = event.payload) == null ? void 0 : _a2._merged) && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-tighter", children: "Heuristic Merged" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-400", children: event.source_ip })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-slate-400 uppercase tracking-widest", children: "Source" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold text-slate-900", children: [
                      getSourceIcon((_b = event.payload) == null ? void 0 : _b.source),
                      " ",
                      ((_c = event.payload) == null ? void 0 : _c.source) || "Direct"
                    ] })
                  ] }),
                  event.event_name === "purchase" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-emerald-400 uppercase tracking-widest", children: "Revenue" }),
                    /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-black text-emerald-600", children: [
                      "$",
                      ((_d = event.payload) == null ? void 0 : _d.value) || 0
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col gap-1 overflow-hidden", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black text-slate-400 uppercase tracking-widest", children: "Page Location" }),
                    /* @__PURE__ */ jsx("div", { className: "text-[9px] font-mono text-slate-500 truncate", children: event.page_url || "N/A" })
                  ] })
                ] })
              ] })
            ] }, event.id);
          }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-4 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2 rounded-xl text-white", children: /* @__PURE__ */ jsx(Map, { size: 18 }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Identity Network" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-8 relative", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex gap-3", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "text-indigo-600 shrink-0", size: 18 }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-indigo-900 uppercase leading-none mb-1", children: "Smart Stitching Active" }),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-indigo-700 font-medium leading-relaxed", children: "Profiles are linked when **IP + Device** matched within 90 days of an identified session." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Merged Fingerprints" }),
              (identity.merged_anonymous_ids || []).map((id, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl", children: [
                /* @__PURE__ */ jsx(Smartphone, { size: 16, className: "text-slate-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-900 truncate", children: id })
              ] }, i))
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4 border-t border-slate-50", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Known Locations" }),
              (identity.ip_addresses || []).slice(0, 3).map((ip, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(Globe, { size: 14, className: "text-slate-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-700", children: ip })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 uppercase", children: "Primary" })
              ] }, i))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 transition-all duration-700 group-hover:scale-150" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black uppercase tracking-widest mb-6", children: "Attribution History" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 italic text-[10px] font-black", children: "1st" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-indigo-400 uppercase tracking-widest", children: "Discovery Source" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-bold text-white capitalize", children: [
                    identity.first_touch_source,
                    " / ",
                    identity.first_touch_medium
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 italic text-[10px] font-black", children: "Last" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-emerald-400 uppercase tracking-widest", children: "Closing Touch" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-bold text-white capitalize", children: [
                    identity.last_touch_source || "Direct",
                    " / ",
                    identity.last_touch_medium || "None"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  SingleCustomerView as default
};
