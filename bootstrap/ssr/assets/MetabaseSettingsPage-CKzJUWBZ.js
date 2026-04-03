import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { BarChart3, Settings, RefreshCw, Database, CheckCircle2, AlertTriangle, Save, Shield } from "lucide-react";
import axios from "axios";
function MetabaseSettingsPage({ settings }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [activeTab, setActiveTab] = useState("self_hosted");
  const [testStatus, setTestStatus] = useState({ loading: false, success: null, message: "" });
  const { data, setData, post, processing, errors } = useForm({
    self_hosted_url: ((_a = settings.self_hosted) == null ? void 0 : _a.url) || "",
    self_hosted_admin_email: ((_b = settings.self_hosted) == null ? void 0 : _b.admin_email) || "",
    self_hosted_admin_password: ((_c = settings.self_hosted) == null ? void 0 : _c.admin_password) || "",
    self_hosted_embed_secret: ((_d = settings.self_hosted) == null ? void 0 : _d.embed_secret) || "",
    self_hosted_template_id: ((_e = settings.self_hosted) == null ? void 0 : _e.template_id) || 1,
    cloud_url: ((_f = settings.cloud) == null ? void 0 : _f.url) || "",
    cloud_admin_email: ((_g = settings.cloud) == null ? void 0 : _g.admin_email) || "",
    cloud_admin_password: ((_h = settings.cloud) == null ? void 0 : _h.admin_password) || "",
    cloud_embed_secret: ((_i = settings.cloud) == null ? void 0 : _i.embed_secret) || "",
    cloud_template_id: ((_j = settings.cloud) == null ? void 0 : _j.template_id) || 1,
    admin_dashboard_id: settings.admin_dashboard_id || 2
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("platform.settings.update"));
  };
  const testConnection = async () => {
    var _a2, _b2;
    setTestStatus({ loading: true, success: null, message: "" });
    try {
      const response = await axios.post(route("platform.settings.test"), {
        type: activeTab,
        target: "metabase"
      });
      setTestStatus({
        loading: false,
        success: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      setTestStatus({
        loading: false,
        success: false,
        message: ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || `Connection to Metabase ${activeTab} failed.`
      });
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Analytics Settings | PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-black uppercase tracking-tight text-slate-900", children: "Analytics Infrastructure" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "Metabase BI Configuration" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex bg-muted/50 p-1 rounded-2xl border border-border", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("self_hosted"),
              className: `px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "self_hosted" ? "bg-white text-slate-900 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`,
              children: "Self-hosted"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("cloud"),
              className: `px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "cloud" ? "bg-white text-slate-900 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`,
              children: "Cloud SaaS"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-indigo-500" }),
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold uppercase tracking-wider text-foreground", children: [
                activeTab === "self_hosted" ? "Self-hosted Cluster" : "Metabase Cloud",
                " Credentials"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${activeTab === "cloud" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`, children: [
              "Metabase ",
              activeTab === "self_hosted" ? "Self-hosted" : "Cloud"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Endpoint URL" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "url",
                    value: data[`${activeTab}_url`],
                    onChange: (e) => setData(`${activeTab}_url`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Admin Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    value: data[`${activeTab}_admin_email`],
                    onChange: (e) => setData(`${activeTab}_admin_email`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Admin Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "password",
                    value: data[`${activeTab}_admin_password`],
                    onChange: (e) => setData(`${activeTab}_admin_password`, e.target.value),
                    autoComplete: "new-password",
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-indigo-600 uppercase tracking-widest leading-none", children: "Embed Secret (HS256)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data[`${activeTab}_embed_secret`],
                    onChange: (e) => setData(`${activeTab}_embed_secret`, e.target.value),
                    className: "w-full rounded-xl border-border bg-indigo-50/10 px-4 py-2.5 text-[11px] font-mono focus:ring-2 focus:ring-indigo-500 transition-all"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 text-indigo-500" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold uppercase tracking-wider text-foreground", children: "Template Configuration" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground leading-relaxed flex-1", children: [
              "The Master Dashboard ID in ",
              /* @__PURE__ */ jsxs("strong", { children: [
                "Metabase ",
                activeTab.toUpperCase()
              ] }),
              " that serves as the blueprint for all tenant containers."
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: data[`${activeTab}_template_id`],
                onChange: (e) => setData(`${activeTab}_template_id`, e.target.value),
                className: "w-32 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-indigo-500 text-center transition-all"
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-8 border-t border-border/40", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-indigo-600" }),
            /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-foreground uppercase tracking-widest", children: "Platform Admin Dashboard (Global BI)" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed mb-4 uppercase font-medium tracking-tight", children: "Master dashboard ID for internal super-admin business intelligence metrics." }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: data.admin_dashboard_id,
              onChange: (e) => setData("admin_dashboard_id", e.target.value),
              className: "w-full max-w-[120px] rounded-xl border-border bg-background px-4 py-4 text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all text-center"
            }
          ),
          errors.admin_dashboard_id && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-red-500 font-bold", children: errors.admin_dashboard_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: testConnection,
                disabled: testStatus.loading,
                className: "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-muted/50 text-xs font-bold hover:bg-muted transition-all active:scale-95 disabled:opacity-50",
                children: [
                  testStatus.loading ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Database, { className: "h-4 w-4" }),
                  "Test Connection"
                ]
              }
            ),
            testStatus.success === true && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
              " ",
              testStatus.message
            ] }),
            testStatus.success === false && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-red-500 text-[10px] font-bold", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5" }),
              " ",
              testStatus.message
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                " ",
                processing ? "Deploying..." : "Update Analytics"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-indigo-600 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-indigo-900 mb-1 leading-none uppercase", children: "Centralized BI Security" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-indigo-800/60 leading-relaxed uppercase tracking-tight font-black", children: [
            "Managed centrally at the platform level. Ensure the ",
            /* @__PURE__ */ jsx("code", { children: "Embed Secret" }),
            " matches your Metabase Admin settings to prevent visualization errors."
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  MetabaseSettingsPage as default
};
