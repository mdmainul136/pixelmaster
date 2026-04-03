import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, Link, router } from "@inertiajs/react";
const statusConfig = {
  active: { label: "Active", cls: "bg-green-50 text-green-700 border-green-200" },
  trialing: { label: "Trialing", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  past_due: { label: "Past Due", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  canceled: { label: "Canceled", cls: "bg-red-50 text-red-700 border-red-200" },
  expired: { label: "Expired", cls: "bg-slate-50 text-slate-500 border-slate-200" }
};
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? statusConfig.expired;
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${cfg.cls}`, children: [
    /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full inline-block ${status === "active" ? "bg-green-500 animate-pulse" : status === "past_due" ? "bg-amber-500" : "bg-current opacity-50"}` }),
    cfg.label
  ] });
};
const ActionsMenu = ({ sub }) => {
  const [open, setOpen] = useState(false);
  const handleAction = (routeName, label) => {
    if (!confirm(`${label}?

Tenant: ${sub.tenant_name}
Subscription: #${sub.id}`)) return;
    router.post(route(routeName, sub.id), {}, {
      onFinish: () => setOpen(false)
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx("button", { onClick: () => setOpen(!open), className: "px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors", children: "Manage ▾" }),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs overflow-hidden", children: [
        sub.status !== "active" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleAction("platform.subscriptions.renew", "Renew / Reinstate subscription"),
            className: "w-full text-left px-4 py-2.5 hover:bg-green-50 text-green-700 font-bold transition-colors",
            children: "✓ Renew / Reinstate"
          }
        ),
        sub.status === "trialing" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleAction("platform.subscriptions.extend-trial", "Extend trial by 14 days"),
            className: "w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-700 font-bold transition-colors",
            children: "⏱ Extend Trial +14 days"
          }
        ),
        sub.status === "active" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleAction("platform.subscriptions.mark-pastdue", "Mark as past due"),
            className: "w-full text-left px-4 py-2.5 hover:bg-amber-50 text-amber-700 font-bold transition-colors",
            children: "⚠ Mark Past Due"
          }
        ),
        sub.status !== "canceled" && sub.status !== "expired" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleAction("platform.subscriptions.cancel", "Cancel subscription (7-day grace)"),
            className: "w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-700 font-bold border-t border-slate-100 mt-1 transition-colors",
            children: "✕ Cancel Subscription"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("platform.tenants.show", sub.tenant_id),
            className: "block px-4 py-2.5 hover:bg-slate-50 text-slate-600 font-bold border-t border-slate-100 mt-1 transition-colors",
            children: "→ View Tenant"
          }
        )
      ] })
    ] })
  ] });
};
function Index({ subscriptions, stats, filters, plans }) {
  const [statusFilter, setStatusFilter] = useState((filters == null ? void 0 : filters.status) ?? "all");
  const [planFilter, setPlanFilter] = useState((filters == null ? void 0 : filters.plan) ?? "all");
  const applyFilters = () => {
    router.get(route("platform.subscriptions"), {
      status: statusFilter !== "all" ? statusFilter : "",
      plan: planFilter !== "all" ? planFilter : ""
    }, { preserveState: true });
  };
  const clearFilters = () => {
    setStatusFilter("all");
    setPlanFilter("all");
    router.get(route("platform.subscriptions"));
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscription Billing" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Subscription & Billing" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Track platform revenue, active plans, and billing health in real-time." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Total MRR" }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black text-slate-900", children: [
          "$",
          (stats.total_mrr ?? 0).toLocaleString(void 0, { minimumFractionDigits: 2 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold", children: "LIVE" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400", children: [
            stats.counts.active,
            " active subscriptions"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `bg-white border border-slate-200 p-5 rounded-2xl shadow-sm ${stats.counts.trialing > 0 ? "border-l-4 border-l-blue-400" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Active Trials" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-blue-600", children: stats.counts.trialing }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-400 mt-2 font-medium", children: [
          "Potential MRR: $",
          (stats.counts.trialing * 29).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `bg-white border border-slate-200 p-5 rounded-2xl shadow-sm ${stats.counts.past_due > 0 ? "border-l-4 border-l-amber-400" : ""}`, children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Past Due" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-amber-600", children: stats.counts.past_due }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 mt-2 font-medium", children: stats.counts.past_due > 0 ? "⚠ Requires dunning action" : "All payments current" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 p-5 rounded-2xl shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2", children: "Revenue by Plan" }),
        stats.breakdown && Object.keys(stats.breakdown).length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: Object.entries(stats.breakdown).map(([name, amount]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-500 truncate", children: name }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono text-slate-700 font-bold", children: [
            "$",
            Number(amount).toLocaleString()
          ] })
        ] }, name)) }) : /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 italic", children: "No revenue data yet." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "Canceled" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-red-500", children: stats.counts.canceled })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-5 flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500", children: "Status:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 appearance-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx("option", { value: "trialing", children: "Trialing" }),
              /* @__PURE__ */ jsx("option", { value: "past_due", children: "Past Due" }),
              /* @__PURE__ */ jsx("option", { value: "canceled", children: "Canceled" }),
              /* @__PURE__ */ jsx("option", { value: "expired", children: "Expired" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-500", children: "Plan:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: planFilter,
            onChange: (e) => setPlanFilter(e.target.value),
            className: "bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 appearance-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All Plans" }),
              plans && Object.entries(plans).map(([key, name]) => /* @__PURE__ */ jsx("option", { value: key, children: name }, key))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: applyFilters, className: "px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all", children: "Filter" }),
      (statusFilter !== "all" || planFilter !== "all") && /* @__PURE__ */ jsx("button", { onClick: clearFilters, className: "text-xs text-slate-400 hover:text-slate-600 font-medium", children: "Clear filters" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: "Tenant" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: "Plan" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right", children: "MRR" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right", children: "Renew / Trial End" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right", children: "Canceled At" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: subscriptions.data.length > 0 ? subscriptions.data.map((sub) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors group", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx(Link, { href: route("platform.tenants.show", sub.tenant_id), className: "font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors", children: sub.tenant_name }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]", children: sub.tenant_id })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-700", children: sub.plan_name }),
            /* @__PURE__ */ jsx("div", { className: "text-[9px] text-slate-400 uppercase tracking-wider mt-0.5", children: sub.billing_cycle })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
            /* @__PURE__ */ jsx(StatusBadge, { status: sub.status }),
            sub.trial_days_remaining !== null && sub.trial_days_remaining !== void 0 && /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-blue-500 font-bold mt-1", children: [
              sub.trial_days_remaining,
              "d left"
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-slate-700", children: sub.monthly_revenue > 0 ? `$${sub.monthly_revenue.toLocaleString()}` : /* @__PURE__ */ jsx("span", { className: "text-slate-300 font-normal italic text-xs", children: "—" }) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500 font-medium", children: sub.renews_at ?? sub.trial_ends_at ?? /* @__PURE__ */ jsx("span", { className: "text-slate-300 italic", children: "N/A" }) }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: sub.canceled_at ? /* @__PURE__ */ jsx("div", { className: "text-[10px] text-red-400 font-bold", children: sub.canceled_at }) : /* @__PURE__ */ jsx("span", { className: "text-slate-300 text-xs", children: "—" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx(ActionsMenu, { sub }) })
        ] }, sub.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "7", className: "px-6 py-14 text-center text-slate-400 italic text-sm", children: "No subscriptions found matching your filters." }) }) })
      ] }),
      subscriptions.links && /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 font-medium", children: [
          "Showing ",
          subscriptions.from ?? 0,
          " – ",
          subscriptions.to ?? 0,
          " of ",
          subscriptions.total ?? 0,
          " subscriptions"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: subscriptions.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url, { preserveState: true }),
            className: `px-2 py-1 text-[10px] rounded border font-bold transition-all ${link.active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-30"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
}
Index.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  Index as default
};
