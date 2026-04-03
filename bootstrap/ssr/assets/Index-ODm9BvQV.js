import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head, router } from "@inertiajs/react";
const StatusBadge = ({ active }) => /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${active ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-500 border-slate-200"}`, children: active ? "Active" : "Testing" });
function Index({ configs }) {
  const handleToggle = (id) => {
    if (confirm("Change sGTM active status?")) {
      router.post(route("platform.sgtm.toggle", id));
    }
  };
  const handleRotate = (id) => {
    if (confirm("CRITICAL: Rotate API Key? Existing tracking for this tenant will BREAK until they update their container settings.")) {
      router.post(route("platform.sgtm.rotate-key", id));
    }
  };
  const handleReprovision = (id, type) => {
    if (confirm(`Switch to Metabase ${type.toUpperCase()}? This will re-clone the dashboard template.`)) {
      axios.post(`/api/tracking/admin/containers/${id}/reprovision`, { type }).then(() => {
        toast == null ? void 0 : toast.success(`Re-provisioning for ${type} queued`);
        router.reload({ preserveScroll: true });
      }).catch(() => toast == null ? void 0 : toast.error("Failed to queue provisioning"));
    }
  };
  const handleCHSwitch = (id, type) => {
    if (confirm(`Switch this container to ClickHouse ${type.toUpperCase()}? Future events will be stored in the new instance.`)) {
      router.post(route("platform.sgtm.switch-clickhouse", id), { type }, {
        preserveScroll: true,
        onSuccess: () => toast == null ? void 0 : toast.success(`Switched to ${type}`)
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "sGTM Global Oversight" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "sGTM Global Oversight" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Centralized management for all server-side GTM containers and API visibility." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-500", children: [
        "Total Containers: ",
        /* @__PURE__ */ jsx("span", { className: "text-slate-900", children: configs.total })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100 italic", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Tenant / Owner" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Container ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Custom Domain" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Secret Key" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Analytics Engine" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Data Storage" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: configs.data.length > 0 ? configs.data.map((config) => {
          var _a, _b;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-black text-slate-900 leading-none", children: (_a = config.tenant) == null ? void 0 : _a.tenant_name }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 mt-1 font-medium", children: (_b = config.tenant) == null ? void 0 : _b.admin_email })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter", children: config.container_id }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium text-slate-600 truncate max-w-[150px]", children: config.custom_domain || "—" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 group", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-slate-400 truncate max-w-[80px]", children: config.secret_key || "—" }),
              config.secret_key && /* @__PURE__ */ jsx("button", { onClick: () => navigator.clipboard.writeText(config.secret_key), className: "opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 font-bold uppercase transition-opacity", children: "Copy" })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.metabase_type === "cloud" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-500 border-slate-200"}`, children: config.metabase_type === "cloud" ? "Cloud" : "Self-hosted" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleReprovision(config.id, config.metabase_type === "cloud" ? "self_hosted" : "cloud"),
                  className: "text-[9px] font-bold text-slate-400 hover:text-slate-900 border-b border-dotted border-slate-300",
                  children: "Switch"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.clickhouse_type === "cloud" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200"}`, children: config.clickhouse_type === "cloud" ? "Cloud" : "Self-hosted" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleCHSwitch(config.id, config.clickhouse_type === "cloud" ? "self_hosted" : "cloud"),
                  className: "text-[9px] font-bold text-slate-400 hover:text-slate-900 border-b border-dotted border-slate-300",
                  children: "Switch"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(StatusBadge, { active: config.is_active }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleToggle(config.id),
                  className: "px-2.5 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors",
                  children: config.is_active ? "Disable" : "Enable"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleRotate(config.id),
                  className: "px-2.5 py-1.5 text-[10px] font-black text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors",
                  children: "Rotate Key"
                }
              )
            ] }) })
          ] }, config.id);
        }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "6", className: "px-6 py-12 text-center text-slate-400 italic text-sm font-medium uppercase tracking-widest", children: "No tenant sGTM configurations detected." }) }) })
      ] }),
      configs.links && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-slate-100 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider", children: [
          "Page ",
          configs.current_page,
          " of ",
          configs.last_page
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: configs.links.map((link, i) => /* @__PURE__ */ jsx(
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
Index.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  Index as default
};
