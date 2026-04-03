import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, Link, router } from "@inertiajs/react";
const InfoRow = ({ label, value, mono = false }) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 py-3 border-b border-slate-100 last:border-0", children: [
  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider w-40 flex-shrink-0 pt-0.5", children: label }),
  /* @__PURE__ */ jsx("span", { className: `text-sm text-slate-800 font-medium break-all ${mono ? "font-mono text-xs" : ""}`, children: value ?? "—" })
] });
const Badge = ({ value, color = "slate" }) => {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${colors[color] || colors.slate}`, children: value });
};
const statusColor = (s) => ({ active: "green", suspended: "red", terminated: "red", inactive: "slate", trialing: "blue" })[s] || "slate";
function Show({ tenant, subscription, modules, sgtm, quotas, auditLogs }) {
  var _a, _b;
  const handleApprove = () => {
    if (confirm(`Approve and activate ${tenant.tenant_name}?`)) {
      router.post(route("platform.tenants.approve", tenant.id));
    }
  };
  const handleSuspend = () => {
    if (confirm(`Suspend ${tenant.tenant_name}?`)) {
      router.post(route("platform.tenants.suspend", tenant.id));
    }
  };
  const handleDelete = () => {
    if (confirm(`Terminate tenant ${tenant.tenant_name}? This cannot be undone.`)) {
      router.delete(route("platform.tenants.delete", tenant.id));
    }
  };
  const handleImpersonate = () => {
    if (confirm(`Login as ${tenant.tenant_name}?`)) {
      router.post(route("platform.impersonate", tenant.id));
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Tenant: ${tenant.tenant_name}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { href: "/platform/tenants", className: "text-slate-400 hover:text-slate-600 transition-colors", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: tenant.tenant_name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-mono mt-0.5", children: tenant.id })
        ] }),
        /* @__PURE__ */ jsx(Badge, { value: tenant.status, color: statusColor(tenant.status) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: handleImpersonate, className: "px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm", children: "Login as Tenant" }),
        tenant.status !== "active" && /* @__PURE__ */ jsx("button", { onClick: handleApprove, className: "px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm", children: "Approve" }),
        tenant.status === "active" && /* @__PURE__ */ jsx("button", { onClick: handleSuspend, className: "px-3 py-2 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm", children: "Suspend" }),
        /* @__PURE__ */ jsx(Link, { href: route("platform.tenants.edit", tenant.id), className: "px-3 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm", children: "Edit" }),
        /* @__PURE__ */ jsx("button", { onClick: handleDelete, className: "px-3 py-2 text-xs font-bold bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all", children: "Terminate" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "xl:col-span-2 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "Workspace Information" }) }),
          /* @__PURE__ */ jsxs("div", { className: "px-5 py-2", children: [
            /* @__PURE__ */ jsx(InfoRow, { label: "Workspace Name", value: tenant.tenant_name }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Admin Name", value: tenant.admin_name }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Admin Email", value: tenant.admin_email }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Domain", value: tenant.domain }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Database", value: tenant.database_name, mono: true }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Plan", value: (_a = tenant.plan) == null ? void 0 : _a.toUpperCase() }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Created", value: new Date(tenant.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Trial Ends", value: tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : "No Trial" }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Onboarded", value: tenant.onboarded_at ? new Date(tenant.onboarded_at).toLocaleDateString() : "Not yet" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "Subscription" }) }),
          /* @__PURE__ */ jsx("div", { className: "px-5 py-2", children: subscription ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(InfoRow, { label: "Status", value: /* @__PURE__ */ jsx(Badge, { value: subscription.status, color: statusColor(subscription.status) }) }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Plan", value: subscription.plan_name }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Billing Cycle", value: subscription.billing_cycle }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Renews At", value: subscription.renews_at ? new Date(subscription.renews_at).toLocaleDateString() : "—" }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Trial Ends", value: subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : "—" })
          ] }) : /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-sm text-slate-400 italic", children: "No subscription record found." }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsxs("h2", { className: "text-sm font-bold text-slate-800", children: [
            "Active Modules (",
            (modules == null ? void 0 : modules.length) ?? 0,
            ")"
          ] }) }),
          (modules == null ? void 0 : modules.length) > 0 ? /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: "Module" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: "Plan Level" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: "Status" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: modules.map((m) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50", children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-medium text-slate-800", children: m.name }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-slate-500 uppercase font-bold", children: m.plan_level }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(Badge, { value: m.status, color: m.status === "active" ? "green" : "slate" }) })
            ] }, m.id)) })
          ] }) : /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-sm text-slate-400 italic", children: "No modules subscribed." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "Quick Actions" }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1", children: [
            /* @__PURE__ */ jsxs(Link, { href: route("platform.tenants.edit", tenant.id), className: "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group", children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-slate-400 group-hover:text-slate-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
              "Edit Workspace Info"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: `${route("platform.tenants.edit", tenant.id)}#password`, onClick: (e) => {
              e.preventDefault();
              window.location = route("platform.tenants.edit", tenant.id) + "?tab=password";
            }, className: "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-amber-700 hover:bg-amber-50 transition-colors group", children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-amber-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" }) }),
              "Reset Admin Password"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: `${route("platform.tenants.edit", tenant.id)}?tab=sgtm`, className: "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors group", children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
              "Configure sGTM"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-slate-100 my-1" }),
            /* @__PURE__ */ jsxs(Link, { href: route("platform.tenants.quotas", tenant.id), className: "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group", children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-slate-400 group-hover:text-slate-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }),
              "Manage Quotas"
            ] }),
            /* @__PURE__ */ jsxs(Link, { href: route("platform.tenants.domains", tenant.id), className: "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group", children: [
              /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 text-slate-400 group-hover:text-slate-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", strokeWidth: 2 }),
                /* @__PURE__ */ jsx("line", { x1: "2", y1: "12", x2: "22", y2: "12", strokeWidth: 2 }),
                /* @__PURE__ */ jsx("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", strokeWidth: 2 })
              ] }),
              "Manage Domains"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "sGTM Configuration" }) }),
          /* @__PURE__ */ jsx("div", { className: "px-5 py-2", children: sgtm ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(InfoRow, { label: "Container ID", value: sgtm.container_id, mono: true }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Custom Domain", value: sgtm.custom_domain }),
            /* @__PURE__ */ jsx(InfoRow, { label: "Status", value: /* @__PURE__ */ jsx(Badge, { value: sgtm.is_active ? "Active" : "Inactive", color: sgtm.is_active ? "green" : "slate" }) }),
            /* @__PURE__ */ jsx(InfoRow, { label: "API Key", value: ((_b = sgtm.api_key) == null ? void 0 : _b.substring(0, 8)) + "...", mono: true })
          ] }) : /* @__PURE__ */ jsx("p", { className: "py-4 text-center text-xs text-slate-400 italic", children: "No sGTM config." }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "Quota Usage" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-4 space-y-3", children: (quotas == null ? void 0 : quotas.length) > 0 ? quotas.map((q) => {
            const pct = q.quota_limit > 0 ? Math.round(q.used_count / q.quota_limit * 100) : 0;
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1", children: [
                /* @__PURE__ */ jsx("span", { children: q.module_slug }),
                /* @__PURE__ */ jsxs("span", { children: [
                  q.used_count,
                  "/",
                  q.quota_limit,
                  " (",
                  pct,
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-slate-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-green-500"}`, style: { width: `${Math.min(100, pct)}%` } }) })
            ] }, q.id);
          }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 italic text-center py-2", children: "No quota records." }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-3.5 border-b border-slate-100 bg-slate-50/50", children: /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-slate-800", children: "Recent Events" }) }),
          /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: (auditLogs == null ? void 0 : auditLogs.length) > 0 ? auditLogs.map((log) => /* @__PURE__ */ jsxs("div", { className: "px-5 py-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-700", children: log.action }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400", children: log.created_at }),
              log.ip_address && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-400", children: log.ip_address })
            ] })
          ] }, log.id)) : /* @__PURE__ */ jsx("p", { className: "px-5 py-4 text-xs text-slate-400 italic", children: "No events logged." }) })
        ] })
      ] })
    ] })
  ] });
}
Show.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page, title: "Tenant Detail" });
export {
  Show as default
};
