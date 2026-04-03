import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import { 
    Globe, Zap, Shield, Cpu, RefreshCw, CheckCircle2, AlertTriangle, 
    Save, Settings
} from "lucide-react";
import axios from "axios";

export default function InfrastructureSettingsPage({ settings }) {
    const [testStatus, setTestStatus] = useState({ loading: false, success: null, message: "" });

    const { data, setData, post, processing, errors } = useForm({
        cdn_tracking_enabled: settings.enabled || false,
        cdn_tracking_url: settings.url || "",
        cdn_provider: settings.provider || "none",
        cdn_hostname: settings.hostname || "",
        cdn_cloudflare_api_token: settings.cf_token || "",
        cdn_cloudflare_zone_id: settings.cf_zone || "",
        cdn_bunny_api_key: settings.bunny_key || "",
        cdn_bunny_pull_zone_id: settings.bunny_zone || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("platform.settings.update"));
    };

    const testConnection = async () => {
        setTestStatus({ loading: true, success: null, message: "" });
        try {
            const response = await axios.post(route("platform.settings.test"), {
                target: "cdn"
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
                message: error.response?.data?.message || `CDN Connectivity test failed.` 
            });
        }
    };

    const handlePurgeCache = () => {
        if (confirm('Are you sure you want to purge the entire CDN cache? This may cause a temporary increase in origin load.')) {
            import('@inertiajs/react').then(({ router }) => {
                router.post(route("platform.settings.cdn.purge"));
            });
        }
    };

    return (
        <PlatformLayout>
            <Head title="Infrastructure Settings | PixelMaster" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                            <Globe className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Infrastructure</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Delivery Network (CDN)</p>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={testConnection}
                        disabled={testStatus.loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {testStatus.loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                        Verify API
                    </button>
                </div>

                {testStatus.success !== null && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${testStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                        <div className="flex items-center gap-3">
                            {testStatus.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            <span className="text-xs font-bold tracking-tight uppercase">{testStatus.message}</span>
                        </div>
                        <button onClick={() => setTestStatus({ ...testStatus, success: null })} className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">Dismiss</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Global CDN & Edge Delivery</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Status:</span>
                                <button
                                    type="button"
                                    onClick={() => setData("cdn_tracking_enabled", !data.cdn_tracking_enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.cdn_tracking_enabled ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.cdn_tracking_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {data.cdn_tracking_enabled ? (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                    {/* Provider Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Provider</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['none', 'cloudflare', 'bunny', 'custom'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setData("cdn_provider", p)}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${data.cdn_provider === p ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-500/5' : 'border-border bg-background hover:bg-muted/30 opacity-70 hover:opacity-100'}`}
                                                >
                                                    <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${data.cdn_provider === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {p === 'none' && <Settings className="h-4 w-4" />}
                                                        {p === 'cloudflare' && <Shield className="h-4 w-4" />}
                                                        {p === 'bunny' && <Zap className="h-4 w-4" />}
                                                        {p === 'custom' && <Globe className="h-4 w-4" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{p}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Provider Specific fields */}
                                    {data.cdn_provider === 'custom' && (
                                        <div className="space-y-2 animate-in fade-in duration-300">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global CDN URL</label>
                                            <input
                                                type="url"
                                                value={data.cdn_tracking_url}
                                                onChange={(e) => setData("cdn_tracking_url", e.target.value)}
                                                placeholder="https://cdn.yourtracking.com"
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    )}

                                    {(data.cdn_provider === 'cloudflare' || data.cdn_provider === 'bunny') && (
                                        <div className="space-y-4 animate-in fade-in duration-300 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CDN Hostname (CNAME)</label>
                                                <input
                                                    type="text"
                                                    value={data.cdn_hostname}
                                                    onChange={(e) => setData("cdn_hostname", e.target.value)}
                                                    placeholder="e.g., cdn.tracking.com"
                                                    className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>

                                            {data.cdn_provider === 'cloudflare' && (
                                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">API Token (Purge)</label>
                                                        <input
                                                            type="password"
                                                            value={data.cdn_cloudflare_api_token}
                                                            onChange={(e) => setData("cdn_cloudflare_api_token", e.target.value)}
                                                            className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Zone ID</label>
                                                        <input
                                                            type="text"
                                                            value={data.cdn_cloudflare_zone_id}
                                                            onChange={(e) => setData("cdn_cloudflare_zone_id", e.target.value)}
                                                            className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-[11px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {data.cdn_provider === 'bunny' && (
                                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bunny API Key</label>
                                                        <input
                                                            type="password"
                                                            value={data.cdn_bunny_api_key}
                                                            onChange={(e) => setData("cdn_bunny_api_key", e.target.value)}
                                                            className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pull Zone ID</label>
                                                        <input
                                                            type="text"
                                                            value={data.cdn_bunny_pull_zone_id}
                                                            onChange={(e) => setData("cdn_bunny_pull_zone_id", e.target.value)}
                                                            className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-[11px]"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handlePurgeCache}
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-rose-500/20 bg-rose-500/5 text-rose-700 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    Purge Global Cache
                                                </button>
                                                <p className="text-[9px] text-muted-foreground uppercase font-black italic tracking-widest">
                                                    Instant wipe on {data.cdn_provider} edge nodes
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto border-2 border-dashed border-slate-200">
                                        <Globe className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Global Edge Delivery is Disabled</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                                            Tracking scripts will be served directly from your tracker origin server. Enabling CDN will improve global load times and bypass localized blocks.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cpu className="h-3.5 w-3.5 text-slate-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Content Optimization</h4>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-tight uppercase font-medium">Brotli compression and minification enabled at edge.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-3.5 w-3.5 text-slate-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">WAF Policy</h4>
                                    </div>
                                    <p className="text-[9px] text-slate-500 leading-tight uppercase font-medium">Anti-bot protection active for tracking endpoints.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 px-10 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {processing ? "Deploying..." : "Publish Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </PlatformLayout>
    );
}
