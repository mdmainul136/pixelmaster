import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head, Link } from "@inertiajs/react";
function Quotas({ tenant, quotas }) {
  const { data, setData, post, processing, errors } = useForm({
    quotas: quotas.map((q) => ({
      id: q.id,
      module_slug: q.module_slug,
      used_count: q.used_count,
      quota_limit: q.quota_limit
    }))
  });
  const handleLimitChange = (index, value) => {
    const newQuotas = [...data.quotas];
    newQuotas[index].quota_limit = parseInt(value) || 0;
    setData("quotas", newQuotas);
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.tenants.quotas.update", tenant.id));
  };
  const getModuleIcon = (slug) => {
    if (slug.includes("whatsapp")) return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.5.9L21 3z" }) });
    if (slug.includes("scraping")) return /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M12 2v20M2 12h20M5.07 5.07l13.86 13.86M5.07 18.93l13.86-13.86" }) });
    return /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
      /* @__PURE__ */ jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
      /* @__PURE__ */ jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
      /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
    ] });
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Manage Quotas - ${tenant.tenant_name}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("platform.tenants"),
            className: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all",
            children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Manage Usage Quotas" }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate-500", children: [
            "Override base resource limits for ",
            tenant.tenant_name
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm p-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          data.quotas.map((quota, idx) => {
            const usagePercent = quota.used_count / quota.quota_limit * 100;
            return /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-2xl border border-slate-100 bg-slate-50/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2 bg-white rounded-lg border border-slate-100 text-slate-400", children: getModuleIcon(quota.module_slug) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 uppercase tracking-wide text-xs", children: quota.module_slug }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 font-medium", children: [
                      quota.used_count.toLocaleString(),
                      " units consumed"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Set New Limit" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      value: quota.quota_limit,
                      onChange: (e) => handleLimitChange(idx, e.target.value),
                      className: "w-32 px-3 py-2 text-sm font-bold rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-slate-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full transition-all duration-500 ease-out ${usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-amber-500" : "bg-blue-500"}`,
                  style: { width: `${Math.min(usagePercent, 100)}%` }
                }
              ) })
            ] }, quota.id);
          }),
          data.quotas.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "No active quotas found for this tenant." }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-4 flex gap-4 border-t border-slate-100 pt-8", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black shadow-lg shadow-slate-100 transition-all disabled:opacity-50",
              children: processing ? "Saving..." : "Update Quotas"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("platform.tenants"),
              className: "px-8 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-center",
              children: "Cancel"
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Quotas as default
};
