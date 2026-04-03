import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Save, Shield } from "lucide-react";
import axios from "axios";
function ClickHouseSettingsPage({ settings }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [activeTab, setActiveTab] = useState("self_hosted");
  const [testStatus, setTestStatus] = useState({ loading: false, success: null, message: "" });
  const { data, setData, post, processing, errors } = useForm({
    ch_self_hosted_host: ((_a = settings.self_hosted) == null ? void 0 : _a.host) || "",
    ch_self_hosted_port: ((_b = settings.self_hosted) == null ? void 0 : _b.port) || 8123,
    ch_self_hosted_database: ((_c = settings.self_hosted) == null ? void 0 : _c.database) || "sgtm_tracking",
    ch_self_hosted_user: ((_d = settings.self_hosted) == null ? void 0 : _d.user) || "default",
    ch_self_hosted_password: ((_e = settings.self_hosted) == null ? void 0 : _e.password) || "",
    ch_cloud_host: ((_f = settings.cloud) == null ? void 0 : _f.host) || "",
    ch_cloud_port: ((_g = settings.cloud) == null ? void 0 : _g.port) || 8443,
    ch_cloud_database: ((_h = settings.cloud) == null ? void 0 : _h.database) || "sgtm_tracking",
    ch_cloud_user: ((_i = settings.cloud) == null ? void 0 : _i.user) || "default",
    ch_cloud_password: ((_j = settings.cloud) == null ? void 0 : _j.password) || ""
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
        target: "clickhouse"
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
        message: ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || `Connection to ClickHouse ${activeTab} failed.`
      });
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "ClickHouse Storage Settings | PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600", children: /* @__PURE__ */ jsx(Database, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-black uppercase tracking-tight text-slate-900", children: "Data Storage" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-500 uppercase tracking-widest", children: "ClickHouse Cluster Configuration" })
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
              /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-orange-500" }),
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold uppercase tracking-wider text-foreground", children: [
                "ClickHouse ",
                activeTab === "self_hosted" ? "Local Engine" : "Cloud Instance"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${activeTab === "cloud" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`, children: activeTab === "self_hosted" ? "Self-hosted" : "Cloud" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "Connection Host" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data[`ch_${activeTab}_host`],
                    onChange: (e) => setData(`ch_${activeTab}_host`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "Port" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    value: data[`ch_${activeTab}_port`],
                    onChange: (e) => setData(`ch_${activeTab}_port`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all text-center font-bold"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "Database" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data[`ch_${activeTab}_database`],
                    onChange: (e) => setData(`ch_${activeTab}_database`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "Username" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data[`ch_${activeTab}_user`],
                    onChange: (e) => setData(`ch_${activeTab}_user`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground uppercase", children: "Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "password",
                    value: data[`ch_${activeTab}_password`],
                    onChange: (e) => setData(`ch_${activeTab}_password`, e.target.value),
                    className: "w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 py-4", children: [
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
              className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                " ",
                processing ? "Saving..." : "Save Settings"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 flex gap-4", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-orange-500 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold text-orange-900 mb-1", children: "Scale Warning" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-orange-800/60 leading-relaxed uppercase tracking-tight font-medium", children: "Self-hosted instances are great for privacy and control. For high-scale analytics with millions of events per day, consider switching to ClickHouse Cloud to ensure uptime and automated scaling." })
        ] })
      ] })
    ] })
  ] });
}
export {
  ClickHouseSettingsPage as default
};
