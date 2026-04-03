import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head, router } from "@inertiajs/react";
function Firewall({ rules, filters }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    ip_address: "",
    type: "block",
    reason: "",
    expires_at: ""
  });
  const [search, setSearch] = useState(filters.search || "");
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("platform.security.firewall"), { search }, { preserveState: true });
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.security.firewall.store"), {
      onSuccess: () => reset()
    });
  };
  const toggleRule = (id) => {
    router.post(route("platform.security.firewall.toggle", id));
  };
  const deleteRule = (id) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      router.delete(route("platform.security.firewall.delete", id));
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Firewall Management" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex justify-between items-center", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Firewall Management" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Control access to the platform by blocking or allowing specific IP addresses." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 mb-4", children: "Add Firewall Rule" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "IP Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.ip_address,
                onChange: (e) => setData("ip_address", e.target.value),
                placeholder: "e.g. 192.168.1.1",
                className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
              }
            ),
            errors.ip_address && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-[10px] mt-1 font-bold", children: errors.ip_address })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "Rule Type" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.type,
                onChange: (e) => setData("type", e.target.value),
                className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-medium",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "block", children: "Block Access" }),
                  /* @__PURE__ */ jsx("option", { value: "allow", children: "Whitelist (Allow)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "Reason / Note" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.reason,
                onChange: (e) => setData("reason", e.target.value),
                placeholder: "e.g. Malicious script patterns",
                className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1", children: "Expiration (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: data.expires_at,
                onChange: (e) => setData("expires_at", e.target.value),
                className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50",
              children: processing ? "Creating..." : "Add Rule"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800", children: "Active Firewall Rules" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "relative", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search IP or Reason...",
                className: "bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              }
            ),
            /* @__PURE__ */ jsxs("svg", { className: "absolute left-2.5 top-2 text-slate-400", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: [
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
              /* @__PURE__ */ jsx("path", { d: "m21 21-4.3-4.3" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "IP Address" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Reason" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100 font-medium", children: rules.data.length > 0 ? rules.data.map((rule) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200", children: rule.ip_address }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${rule.type === "block" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`, children: rule.type }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-600 truncate max-w-[200px]", children: rule.reason || "No reason provided" }),
              rule.expires_at && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-400 mt-1", children: [
                "Expires: ",
                new Date(rule.expires_at).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("button", { onClick: () => toggleRule(rule.id), className: `w-8 h-4 rounded-full relative transition-colors ${rule.is_active ? "bg-green-500" : "bg-slate-200"}`, children: /* @__PURE__ */ jsx("div", { className: `absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${rule.is_active ? "left-4.5" : "left-0.5"}` }) }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("button", { onClick: () => deleteRule(rule.id), className: "text-red-400 hover:text-red-600 transition-colors", children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }) }) }) })
          ] }, rule.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center text-slate-400 italic", children: "No firewall rules defined." }) }) })
        ] })
      ] }) })
    ] })
  ] });
}
Firewall.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  Firewall as default
};
