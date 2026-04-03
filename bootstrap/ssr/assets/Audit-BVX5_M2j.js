import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, Link, router } from "@inertiajs/react";
const ActionBadge = ({ action }) => {
  const isError = action.toLowerCase().includes("fail") || action.toLowerCase().includes("unauthorized");
  const isDelete = action.toLowerCase().includes("delete") || action.toLowerCase().includes("remove");
  const isAuth = action.toLowerCase().includes("login") || action.toLowerCase().includes("logout");
  let style = "bg-slate-50 text-slate-500 border-slate-200";
  if (isError) style = "bg-red-50 text-red-700 border-red-200";
  if (isDelete) style = "bg-amber-50 text-amber-700 border-amber-200";
  if (isAuth) style = "bg-blue-50 text-blue-700 border-blue-200";
  return /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${style}`, children: action.split(" ")[0] });
};
function Audit({ logs, filters }) {
  const [search, setSearch] = useState((filters == null ? void 0 : filters.search) ?? "");
  const [type, setType] = useState((filters == null ? void 0 : filters.event_type) ?? "all");
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("platform.security.audit"), { search, event_type: type !== "all" ? type : "" }, { preserveState: true });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Security Audit Log" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Security Audit Log" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Immutable trail of all super-admin actions and system-level configuration changes." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex gap-4 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "Search Action / IP / ID" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Filter by keyword...",
            className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-48", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "Event Type" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: type,
            onChange: (e) => setType(e.target.value),
            className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-medium",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Events" }),
              /* @__PURE__ */ jsx("option", { value: "tenant_management", children: "Tenant Management" }),
              /* @__PURE__ */ jsx("option", { value: "subscription", children: "Subscription" }),
              /* @__PURE__ */ jsx("option", { value: "security", children: "Security" }),
              /* @__PURE__ */ jsx("option", { value: "configuration", children: "Configuration" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-slate-900 text-white font-bold h-10 px-6 rounded-xl hover:bg-black transition-colors shadow-lg", children: "Filter" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Time" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Actor / Context" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Action" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Type" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right", children: "IP Address" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: logs.data.length > 0 ? logs.data.map((log) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-900", children: new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 font-medium", children: new Date(log.created_at).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: log.tenant ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx(Link, { href: route("platform.tenants.show", log.tenant_id), className: "text-xs font-black text-indigo-600 hover:underline", children: log.tenant.tenant_name }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-mono uppercase", children: log.tenant_id })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-tighter", children: "GLOBAL SYSTEM" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 max-w-[400px]", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-700 font-medium leading-relaxed", children: log.action }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(ActionBadge, { action: log.event_type }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100", children: log.ip_address }) })
        ] }, log.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center text-slate-400 italic", children: "No audit entries matching your criteria." }) }) })
      ] }),
      logs.links && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-500 font-bold uppercase tracking-widest", children: [
          logs.total,
          " total logs recorded"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: logs.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url, { preserveState: true }),
            className: `px-3 py-1.5 text-[10px] rounded-lg border font-black transition-all ${link.active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-30"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
}
Audit.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  Audit as default
};
