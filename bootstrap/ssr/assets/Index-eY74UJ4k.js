import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, Link, router } from "@inertiajs/react";
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-slate-50 text-slate-500 border-slate-200",
    suspended: "bg-red-50 text-red-600 border-red-200",
    terminated: "bg-red-100 text-red-700 border-red-300",
    pending: "bg-amber-50 text-amber-700 border-amber-200"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.inactive}`, children: status });
};
const ActionDropdown = ({ tenant }) => {
  const [open, setOpen] = useState(false);
  const handleAction = (action) => {
    setOpen(false);
    if (action === "impersonate") {
      if (confirm(`Login as ${tenant.tenant_name}?`)) router.post(route("platform.impersonate", tenant.id));
    } else if (action === "approve") {
      if (confirm(`Approve ${tenant.tenant_name}?`)) router.post(route("platform.tenants.approve", tenant.id));
    } else if (action === "suspend") {
      if (confirm(`Suspend ${tenant.tenant_name}?`)) router.post(route("platform.tenants.suspend", tenant.id));
    } else if (action === "delete") {
      if (confirm(`Terminate ${tenant.tenant_name}? This action marks them as terminated but keeps the database.`)) {
        router.delete(route("platform.tenants.delete", tenant.id));
      }
    } else if (action === "full_delete") {
      if (confirm(`CRITICAL: Fully delete ${tenant.tenant_name} and DROP their database? THIS CANNOT BE UNDONE.`)) {
        router.delete(route("platform.tenants.delete", tenant.id), {
          data: { drop_db: true }
        });
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", onBlur: () => setTimeout(() => setOpen(false), 150), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleAction("impersonate"),
          title: "Login as Tenant",
          className: "p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all",
          children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }),
            /* @__PURE__ */ jsx("polyline", { points: "10 17 15 12 10 7" }),
            /* @__PURE__ */ jsx("line", { x1: "15", y1: "12", x2: "3", y2: "12" })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setOpen(!open),
          className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all",
          children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1" }),
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "1" }),
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "19", r: "1" })
          ] })
        }
      )
    ] }),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden border border-slate-100", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("platform.tenants.show", tenant.id),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "text-slate-400 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" }) }),
            "View Details"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("platform.tenants.edit", tenant.id),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "text-slate-400 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
            "Edit Details"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("platform.tenants.quotas", tenant.id),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "text-slate-400 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
            "Manage Quotas"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("platform.tenants.domains", tenant.id),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsxs("svg", { className: "text-slate-400 w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsx("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
              /* @__PURE__ */ jsx("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
            ] }),
            "Manage Domains"
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-slate-100" }),
      tenant.status !== "active" && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("approve"),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-green-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
            "Approve Tenant"
          ]
        }
      ),
      tenant.status === "active" && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("suspend"),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-amber-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            "Suspend"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("delete"),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2.5",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" }) }),
            "Terminate Only"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("full_delete"),
          className: "flex w-full items-center px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 transition-colors gap-2.5 font-bold",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
            "FULL DELETE (Drop DB)"
          ]
        }
      )
    ] })
  ] });
};
function Index({ tenants, filters, plans }) {
  var _a;
  const [search, setSearch] = useState((filters == null ? void 0 : filters.search) ?? "");
  const [statusFilter, setStatusFilter] = useState((filters == null ? void 0 : filters.status) ?? "all");
  const [planFilter, setPlanFilter] = useState((filters == null ? void 0 : filters.plan) ?? "all");
  const applyFilters = (e) => {
    e == null ? void 0 : e.preventDefault();
    router.get("/platform/tenants", {
      search,
      status: statusFilter !== "all" ? statusFilter : "",
      plan: planFilter !== "all" ? planFilter : ""
    }, { preserveState: true });
  };
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPlanFilter("all");
    router.get("/platform/tenants");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Tenants Management" }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-5", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Tenant Workspaces" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Manage all tenant accounts, plans, and access on your platform." })
    ] }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: applyFilters, className: "bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-5 flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-60", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5", children: "Search" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Name, email, or tenant ID…",
            className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5", children: "Status" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
              /* @__PURE__ */ jsx("option", { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsx("option", { value: "terminated", children: "Terminated" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5", children: "Plan" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: planFilter,
            onChange: (e) => setPlanFilter(e.target.value),
            className: "bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Plans" }),
              plans && Object.entries(plans).map(([key, name]) => /* @__PURE__ */ jsx("option", { value: key, children: name }, key))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm", children: "Search" }),
      (search || statusFilter !== "all" || planFilter !== "all") && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: clearFilters,
          className: "px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all",
          children: "Clear"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400 font-medium pt-6", children: [
        (tenants == null ? void 0 : tenants.total) ?? 0,
        " tenants"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Workspace" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Admin" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Domain" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Plan" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Joined" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: ((_a = tenants == null ? void 0 : tenants.data) == null ? void 0 : _a.length) > 0 ? tenants.data.map((tenant) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx(Link, { href: route("platform.tenants.show", tenant.id), className: "font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm", children: tenant.tenant_name }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 font-mono mt-0.5 uppercase", children: tenant.id })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-slate-700", children: tenant.admin_name }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-400", children: tenant.admin_email })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-blue-600 font-medium", children: tenant.domain }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded uppercase tracking-wider", children: tenant.plan }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 items-start", children: [
            /* @__PURE__ */ jsx(StatusBadge, { status: tenant.status }),
            tenant.billing_status && tenant.billing_status !== "none" && /* @__PURE__ */ jsxs("span", { className: `text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${tenant.billing_status === "active" ? "text-green-600 bg-green-50" : tenant.billing_status === "past_due" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"}`, children: [
              "Sub: ",
              tenant.billing_status
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-xs text-slate-400", children: new Date(tenant.created_at).toLocaleDateString() }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx(ActionDropdown, { tenant }) })
        ] }, tenant.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "7", className: "px-6 py-16 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 italic", children: "No tenants found matching your filters." }) }) }) })
      ] }),
      (tenants == null ? void 0 : tenants.links) && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-slate-100 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
          "Showing ",
          tenants.from,
          "–",
          tenants.to,
          " of ",
          tenants.total,
          " tenants"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: tenants.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.visit(link.url),
            className: `px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${link.active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-40"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
}
Index.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page, title: "Tenants Management" });
export {
  Index as default
};
