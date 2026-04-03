import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import { 
  Settings, Save, RefreshCw, AlertTriangle, CheckCircle2, 
  BarChart3, Shield, Database, ExternalLink
} from "lucide-react";
import axios from "axios";

export default function MetabaseSettingsPage({ settings }) {
  const [activeTab, setActiveTab] = useState("self_hosted"); // "self_hosted" | "cloud"
  const [testStatus, setTestStatus] = useState({ loading: false, success: null, message: "" });

  const { data, setData, post, processing, errors } = useForm({
    self_hosted_url: settings.self_hosted?.url || "",
    self_hosted_admin_email: settings.self_hosted?.admin_email || "",
    self_hosted_admin_password: settings.self_hosted?.admin_password || "",
    self_hosted_embed_secret: settings.self_hosted?.embed_secret || "",
    self_hosted_template_id: settings.self_hosted?.template_id || 1,

    cloud_url: settings.cloud?.url || "",
    cloud_admin_email: settings.cloud?.admin_email || "",
    cloud_admin_password: settings.cloud?.admin_password || "",
    cloud_embed_secret: settings.cloud?.embed_secret || "",
    cloud_template_id: settings.cloud?.template_id || 1,

    admin_dashboard_id: settings.admin_dashboard_id || 2,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("platform.settings.update"));
  };

  const testConnection = async () => {
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
        message: error.response?.data?.message || `Connection to Metabase ${activeTab} failed.` 
      });
    }
  };

  return (
    <PlatformLayout>
      <Head title="Analytics Settings | PixelMaster" />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Analytics Infrastructure</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Metabase BI Configuration</p>
                </div>
            </div>

            <div className="flex bg-muted/50 p-1 rounded-2xl border border-border">
                <button
                    type="button"
                    onClick={() => setActiveTab("self_hosted")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "self_hosted" ? "bg-white text-slate-900 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Self-hosted
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("cloud")}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "cloud" ? "bg-white text-slate-900 shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Cloud SaaS
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    {activeTab === "self_hosted" ? "Self-hosted Cluster" : "Metabase Cloud"} Credentials
                </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${activeTab === "cloud" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                Metabase {activeTab === "self_hosted" ? "Self-hosted" : "Cloud"}
                </span>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Endpoint URL</label>
                    <input
                    type="url"
                    value={data[`${activeTab}_url`]}
                    onChange={(e) => setData(`${activeTab}_url`, e.target.value)}
                    className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Email</label>
                    <input
                    type="email"
                    value={data[`${activeTab}_admin_email`]}
                    onChange={(e) => setData(`${activeTab}_admin_email`, e.target.value)}
                    className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin Password</label>
                    <input
                    type="password"
                    value={data[`${activeTab}_admin_password`]}
                    onChange={(e) => setData(`${activeTab}_admin_password`, e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest leading-none">Embed Secret (HS256)</label>
                    <input
                    type="text"
                    value={data[`${activeTab}_embed_secret`]}
                    onChange={(e) => setData(`${activeTab}_embed_secret`, e.target.value)}
                    className="w-full rounded-xl border-border bg-indigo-50/10 px-4 py-2.5 text-[11px] font-mono focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Template Configuration</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">
                  The Master Dashboard ID in <strong>Metabase {activeTab.toUpperCase()}</strong> that serves as the blueprint for all tenant containers.
                </p>
                <input
                  type="number"
                  value={data[`${activeTab}_template_id`]}
                  onChange={(e) => setData(`${activeTab}_template_id`, e.target.value)}
                  className="w-32 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-indigo-500 text-center transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Platform Admin Dashboard (Global BI)</label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4 uppercase font-medium tracking-tight">
                Master dashboard ID for internal super-admin business intelligence metrics.
            </p>
            <input
                type="number"
                value={data.admin_dashboard_id}
                onChange={(e) => setData("admin_dashboard_id", e.target.value)}
                className="w-full max-w-[120px] rounded-xl border-border bg-background px-4 py-4 text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all text-center"
            />
            {errors.admin_dashboard_id && <p className="text-[10px] text-red-500 font-bold">{errors.admin_dashboard_id}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={testConnection}
                disabled={testStatus.loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-muted/50 text-xs font-bold hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
              >
                {testStatus.loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Test Connection
              </button>

              {testStatus.success === true && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {testStatus.message}
                </div>
              )}
              {testStatus.success === false && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" /> {testStatus.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {processing ? "Deploying..." : "Update Analytics"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4">
          <Shield className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-indigo-900 mb-1 leading-none uppercase">Centralized BI Security</h4>
            <p className="text-[10px] text-indigo-800/60 leading-relaxed uppercase tracking-tight font-black">
              Managed centrally at the platform level. Ensure the <code>Embed Secret</code> matches your Metabase Admin settings to prevent visualization errors.
            </p>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
