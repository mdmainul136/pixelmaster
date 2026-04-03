import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { Head, Link, router } from "@inertiajs/react";
import { Fingerprint, Search, Filter, Users, ShieldCheck, User, Mail, DollarSign, ChevronRight } from "lucide-react";
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
const CdpList = ({ container, identities }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const getSegmentStyles = (segment) => {
    switch (segment == null ? void 0 : segment.toLowerCase()) {
      case "vip":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "at risk":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "new":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Customer Data Platform — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(Fingerprint, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Unified Customer Intelligence" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Cross-device identity resolution for ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-bold underline decoration-indigo-200 decoration-2", children: "High-Fidelity tracking" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors", size: 16 }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search by ID or Hash...",
              className: "bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm transition-all",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx("button", { className: "p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all", children: /* @__PURE__ */ jsx(Filter, { size: 20 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Users, { size: 18, className: "text-slate-400" }),
          /* @__PURE__ */ jsxs("h3", { className: "text-[11px] font-black text-slate-900 uppercase tracking-widest", children: [
            "Identified Profiles (",
            identities.total,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { size: 10 }),
          " Identity Graph Active"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50", children: [
          /* @__PURE__ */ jsx("th", { className: "px-10 py-6 text-left font-black", children: "Customer / Identity" }),
          /* @__PURE__ */ jsx("th", { className: "px-8 py-6 text-center font-black", children: "Segment" }),
          /* @__PURE__ */ jsx("th", { className: "px-8 py-6 text-center font-black", children: "Orders" }),
          /* @__PURE__ */ jsx("th", { className: "px-8 py-6 text-center font-black", children: "Value (LTV)" }),
          /* @__PURE__ */ jsx("th", { className: "px-10 py-6 text-right font-black", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50", children: identities.data.map((identity) => {
          var _a;
          return /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-slate-50/50 transition-all cursor-pointer", onClick: () => router.get(route("user.sgtm.cdp.show", [container.container_id, identity.id])), children: [
            /* @__PURE__ */ jsx("td", { className: "px-10 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm", children: /* @__PURE__ */ jsx(User, { size: 20 }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[12px] font-black text-slate-900", children: [
                    "Identity #",
                    identity.id
                  ] }),
                  identity.email_hash && /* @__PURE__ */ jsx(Mail, { size: 12, className: "text-indigo-400" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-slate-400 truncate w-32", children: identity.primary_anonymous_id })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-8 py-6 text-center", children: /* @__PURE__ */ jsx("span", { className: `px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getSegmentStyles(identity.customer_segment)}`, children: identity.customer_segment || "Unknown" }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-8 py-6 text-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-900", children: identity.order_count || 0 }),
              /* @__PURE__ */ jsx("p", { className: "text-[8px] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap", children: "Total Transactions" })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-8 py-6 text-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-emerald-600", children: [
                "$",
                ((_a = identity.total_spent) == null ? void 0 : _a.toLocaleString()) || "0.00"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsx(DollarSign, { size: 8, className: "text-emerald-400" }),
                /* @__PURE__ */ jsx("p", { className: "text-[8px] font-bold text-slate-400 uppercase", children: "Predicted Upside" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-10 py-6 text-right", children: /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("user.sgtm.cdp.show", [container.container_id, identity.id]),
                className: "inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm group-hover:shadow-lg",
                children: [
                  "View Journey ",
                  /* @__PURE__ */ jsx(ChevronRight, { size: 14 })
                ]
              }
            ) })
          ] }, identity.id);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: [
          "Showing ",
          /* @__PURE__ */ jsxs("span", { className: "text-slate-900", children: [
            identities.from,
            "-",
            identities.to
          ] }),
          " of ",
          identities.total,
          " Profiles"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: identities.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url),
            className: `px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${link.active ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"} ${!link.url ? "opacity-30 cursor-not-allowed" : ""}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
};
export {
  CdpList as default
};
