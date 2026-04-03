import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import { 
    Database, Save, RefreshCw, AlertTriangle, CheckCircle2, 
    Shield, Server, Globe
} from "lucide-react";
import axios from "axios";

export default function ClickHouseSettingsPage({ settings }) {
    const [activeTab, setActiveTab] = useState("self_hosted"); // "self_hosted" | "cloud"
    const [testStatus, setTestStatus] = useState({ loading: false, success: null, message: "" });

    const { data, setData, post, processing, errors } = useForm({
        ch_self_hosted_host: settings.self_hosted?.host || "",
        ch_self_hosted_port: settings.self_hosted?.port || 8123,
        ch_self_hosted_database: settings.self_hosted?.database || "sgtm_tracking",
        ch_self_hosted_user: settings.self_hosted?.user || "default",
        ch_self_hosted_password: settings.self_hosted?.password || "",

        ch_cloud_host: settings.cloud?.host || "",
        ch_cloud_port: settings.cloud?.port || 8443,
        ch_cloud_database: settings.cloud?.database || "sgtm_tracking",
        ch_cloud_user: settings.cloud?.user || "default",
        ch_cloud_password: settings.cloud?.password || "",
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
                message: error.response?.data?.message || `Connection to ClickHouse ${activeTab} failed.` 
            });
        }
    };

    return (
        <PlatformLayout>
            <Head title="ClickHouse Storage Settings | PixelMaster" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Data Storage</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ClickHouse Cluster Configuration</p>
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
                                <Database className="h-4 w-4 text-orange-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                    ClickHouse {activeTab === "self_hosted" ? "Local Engine" : "Cloud Instance"}
                                </h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${activeTab === "cloud" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                {activeTab === "self_hosted" ? "Self-hosted" : "Cloud"}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Connection Host</label>
                                    <input
                                        type="text"
                                        value={data[`ch_${activeTab}_host`]}
                                        onChange={(e) => setData(`ch_${activeTab}_host`, e.target.value)}
                                        className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Port</label>
                                    <input
                                        type="number"
                                        value={data[`ch_${activeTab}_port`]}
                                        onChange={(e) => setData(`ch_${activeTab}_port`, e.target.value)}
                                        className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all text-center font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Database</label>
                                    <input
                                        type="text"
                                        value={data[`ch_${activeTab}_database`]}
                                        onChange={(e) => setData(`ch_${activeTab}_database`, e.target.value)}
                                        className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Username</label>
                                    <input
                                        type="text"
                                        value={data[`ch_${activeTab}_user`]}
                                        onChange={(e) => setData(`ch_${activeTab}_user`, e.target.value)}
                                        className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
                                    <input
                                        type="password"
                                        value={data[`ch_${activeTab}_password`]}
                                        onChange={(e) => setData(`ch_${activeTab}_password`, e.target.value)}
                                        className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
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
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {processing ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 flex gap-4">
                    <Shield className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold text-orange-900 mb-1">Scale Warning</h4>
                        <p className="text-[10px] text-orange-800/60 leading-relaxed uppercase tracking-tight font-medium">
                            Self-hosted instances are great for privacy and control. For high-scale analytics with millions of events per day, consider switching to ClickHouse Cloud to ensure uptime and automated scaling.
                        </p>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}
