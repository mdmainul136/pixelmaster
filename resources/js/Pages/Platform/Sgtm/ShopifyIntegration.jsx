import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ExternalLink, 
  RefreshCw,
  Code,
  ShieldCheck,
  Server,
  ArrowRight
} from 'lucide-react';

const StatusBadge = ({ success, label }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
        success ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
    }`}>
        {success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {label}
    </div>
);

const ShopifyIntegration = ({ shop, container }) => {
    const [status, setStatus] = useState(shop.settings?.setup_status || {});
    const [loading, setLoading] = useState(false);

    const runSetup = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/tracking/shopify/shops/${shop.id}/setup`);
            setStatus(res.data.data);
        } catch (error) {
            console.error('Setup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PlatformLayout>
            <Head title={`Shopify Integration — ${shop.shop_name}`} />

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#96bf48] p-2.5 rounded-2xl shadow-lg shadow-emerald-100 text-white">
                            <ShoppingBag size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shopify Ecosystem Sync</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Connected to <span className="text-slate-900 font-bold">{shop.shop_domain}</span> via OAuth 2.0.
                    </p>
                </div>

                <div className="flex gap-3">
                    <a 
                        href={`https://${shop.shop_domain}/admin`} 
                        target="_blank" 
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        Store Admin <ExternalLink size={14} />
                    </a>
                    <button 
                        onClick={runSetup}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                        Sync Integration
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Integration Checklist */}
                <div className="lg:col-span-12">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Code size={40} /></div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Script Injection</h3>
                                    <p className="text-sm font-black text-slate-900 mb-2">sGTM Master Loader</p>
                                    <p className="text-[10px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Injects the Google Tag Manager container dynamically through your first-party sGTM proxy.
                                    </p>
                                    <StatusBadge success={status.script_tag} label={status.script_tag ? "Active" : "Pending"} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity size={40} /></div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Event Webhooks</h3>
                                    <p className="text-sm font-black text-slate-900 mb-2">Back-office Signals</p>
                                    <p className="text-[10px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Registers webhooks for Orders, Refunds, and Checkouts to ensure 100% server-side accuracy.
                                    </p>
                                    <StatusBadge success={status.webhooks} label={status.webhooks ? "Connected" : "Pending"} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShieldCheck size={40} /></div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Identity Sync</h3>
                                    <p className="text-sm font-black text-slate-900 mb-2">Metafield Config</p>
                                    <p className="text-[10px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Pushes encryption keys and container configurations to Shopify metafields for Liquid-side resolution.
                                    </p>
                                    <StatusBadge success={status.metafields} label={status.metafields ? "Pushed" : "Pending"} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reporting Integration */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight">Real vs Reported Revenue</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shopify Financial Reconciliation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Shopify Total</p>
                                <p className="text-2xl font-black">$12,450</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Platform Tracked</p>
                                <p className="text-2xl font-black">$12,410</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Accuracy Gap</p>
                                <p className="text-2xl font-black text-emerald-400">99.7%</p>
                                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[99.7%]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Server size={18} className="text-indigo-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Seamless sGTM Handshake Active</span>
                            </div>
                            <button className="text-[10px] font-black text-white hover:text-indigo-400 transition-colors flex items-center gap-2 uppercase tracking-widest">
                                Manage Webhooks <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col justify-between">
                        <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 block">Theme App Extension</h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">
                                We've detected your theme supports <strong>App Blocks</strong>. Enabling the PixelMaster app block manually in your theme customizer provides the best performance and first-party cookie stability.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-700">App Block Not Detected</span>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-50 hover:bg-indigo-700 transition-all">
                            Open Theme Customizer
                        </button>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default ShopifyIntegration;
