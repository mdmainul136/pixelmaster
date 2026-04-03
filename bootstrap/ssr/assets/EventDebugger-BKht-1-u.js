import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import { Terminal, Search, Square, Play, Trash2, Activity, Zap, X, ShieldCheck, Globe } from "lucide-react";
const EventDebugger = ({ auth, initialLogs = [] }) => {
  const [events, setEvents] = useState(initialLogs);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newEvent = {
          id: Math.random().toString(36).substr(2, 9),
          event_name: ["page_view", "add_to_cart", "purchase", "view_item"][Math.floor(Math.random() * 4)],
          source_ip: "192.168.1." + Math.floor(Math.random() * 255),
          status: "processed",
          status_code: 200,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          payload: {
            event_id: "eid_" + Math.random().toString(36).substr(2, 9),
            client_id: "cid_" + Math.random().toString(36).substr(2, 9),
            user_data: {
              email: "sha256_hashed_email_value_here",
              phone: "sha256_hashed_phone_value_here",
              external_id: "sha256_hashed_id_here"
            },
            page_location: "https://myshop.com/products/awesome-item",
            currency: "USD",
            value: 29.99
          }
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 100));
      }
    }, 2e3);
    return () => clearInterval(interval);
  }, [isLive]);
  const filteredEvents = events.filter(
    (e) => e.event_name.toLowerCase().includes(searchTerm.toLowerCase()) || e.source_ip.includes(searchTerm)
  );
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Event Debugger Console — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[calc(100vh-140px)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2 rounded-xl shadow-lg text-white", children: /* @__PURE__ */ jsx(Terminal, { size: 18 }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-black text-slate-900 tracking-tight", children: "Real-time Event Debugger" }),
            isLive && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100 animate-pulse", children: [
              /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 bg-rose-600 rounded-full" }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase tracking-widest", children: "Live Stream" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-500 font-medium ml-10", children: [
            "Monitor incoming server-side tracking requests. ",
            /* @__PURE__ */ jsx("span", { className: "text-rose-600 font-black decoration-rose-200 decoration-2 underline", children: "PII is SHA-256 Hashed for Privacy." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 14 }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Filter by event or IP...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsLive(!isLive),
              className: `flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLive ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`,
              children: isLive ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Square, { size: 12, fill: "currentColor" }),
                " Stop Stream"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Play, { size: 12, fill: "currentColor" }),
                " Resume Stream"
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEvents([]),
              className: "p-2 bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all",
              children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-grow gap-6 min-h-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-grow bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 px-6 py-4 border-b border-slate-50 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-5", children: "Event Name" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "Source IP" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Status" }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right", children: "Time" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-grow overflow-y-auto", ref: scrollRef, children: filteredEvents.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center opacity-30", children: [
            /* @__PURE__ */ jsx(Activity, { size: 48, className: "mb-4" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-widest", children: "Waiting for incoming events..." })
          ] }) : filteredEvents.map((event) => /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => setSelectedEvent(event),
              className: `grid grid-cols-12 px-6 py-3 border-b border-slate-50 items-center cursor-pointer transition-all hover:bg-slate-50 ${(selectedEvent == null ? void 0 : selectedEvent.id) === event.id ? "bg-indigo-50/50 border-indigo-100" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "col-span-5 flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-slate-900", children: event.event_name })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "col-span-3 text-[10px] font-mono text-slate-500", children: event.source_ip }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-tighter", children: [
                  event.status_code,
                  " OK"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right text-[10px] font-medium text-slate-400", children: new Date(event.created_at).toLocaleTimeString([], { hour12: false }) })
              ]
            },
            event.id
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `w-[450px] bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col transition-all overflow-hidden ${selectedEvent ? "translate-x-0" : "translate-x-full hidden"}`, children: selectedEvent && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-1.5 rounded-lg", children: /* @__PURE__ */ jsx(Zap, { size: 14, fill: "currentColor" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-widest", children: selectedEvent.event_name }),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] font-medium text-slate-400 font-mono tracking-tighter", children: selectedEvent.id })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setSelectedEvent(null), className: "p-2 hover:bg-white/10 rounded-xl transition-all", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-100 shadow-sm", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Source IP" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-mono text-slate-900", children: selectedEvent.source_ip })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-100 shadow-sm", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Timestamp" }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] font-mono text-slate-900", children: new Date(selectedEvent.created_at).toLocaleString() })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex gap-3", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "text-indigo-600 shrink-0", size: 18 }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-indigo-900 uppercase", children: "PII Guard Active" }),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-indigo-700 font-medium leading-relaxed", children: "Sensitive fields (Email, Phone) were SHA-256 hashed on the proxy server before being displayed here." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest", children: "Event JSON Payload" }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 capitalize", children: "Read-only Stream" })
              ] }),
              /* @__PURE__ */ jsx("pre", { className: "p-6 bg-slate-900 text-indigo-300 rounded-[2rem] text-[10px] font-mono leading-relaxed overflow-x-auto border-4 border-slate-800 shadow-xl", children: JSON.stringify(selectedEvent.payload, null, 2) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest px-1", children: "Diagnostic Context" }),
              /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3", children: [
                /* @__PURE__ */ jsx(Globe, { className: "text-slate-400 mt-0.5", size: 14 }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h6", { className: "text-[10px] font-black text-slate-900 uppercase", children: "Origin Validation" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium", children: "Valid server-side request from sidecar node." })
                ] })
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  EventDebugger as default
};
