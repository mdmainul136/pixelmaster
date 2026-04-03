import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  Save, 
  ChevronRight, 
  Zap, 
  Lock, 
  Globe,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const BillingSettingsPage = ({ settings }) => {
    const { data, setData, post, processing, errors } = useForm({
        stripe_key: settings.stripe_key || '',
        stripe_secret: settings.stripe_secret || '',
        stripe_webhook_secret: settings.stripe_webhook_secret || '',
        sslcommerz_store_id: settings.sslcommerz_store_id || '',
        sslcommerz_store_password: settings.sslcommerz_store_password || '',
        default_trial_days: settings.default_trial_days || 7,
        quota_alert_percent: settings.quota_alert_percent || 80,
        is_stripe_enabled: settings.is_stripe_enabled,
        is_sslcommerz_enabled: settings.is_sslcommerz_enabled,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('platform.settings.billing.update'));
    };

    return (
        <PlatformLayout>
            <Head title="Global Billing Settings — PixelMaster" />

            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
                        <DollarSign size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Billing & Gateway Settings</h1>
                </div>
                <p className="text-sm text-slate-500 font-medium ml-12">
                    Centralized configuration for <span className="text-slate-900 font-bold underline decoration-indigo-300 decoration-2">Monetization & Quota Enforcement</span>.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-8">
                {/* Stripe Configuration */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#635BFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <span className="font-black italic text-xl">S</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Stripe Gateway (Global)</h3>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Primary Multi-Currency Processor</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={data.is_stripe_enabled}
                                onChange={e => setData('is_stripe_enabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635BFF]"></div>
                        </label>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Publishable Key</label>
                            <input 
                                type="text"
                                value={data.stripe_key}
                                onChange={e => setData('stripe_key', e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="pk_test_..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Secret Key</label>
                            <input 
                                type="password"
                                value={data.stripe_secret}
                                onChange={e => setData('stripe_secret', e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                placeholder="sk_test_..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Webhook Secret</label>
                            <input 
                                type="password"
                                value={data.stripe_webhook_secret}
                                onChange={e => setData('stripe_webhook_secret', e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                placeholder="whsec_..."
                            />
                        </div>
                    </div>
                </div>

                {/* SSLCommerz Configuration */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FF1F5B] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                                <span className="font-black italic text-xl">S</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">SSLCommerz (Bangladesh)</h3>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Regional PPP Processor (BDT)</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={data.is_sslcommerz_enabled}
                                onChange={e => setData('is_sslcommerz_enabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF1F5B]"></div>
                        </label>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Store ID</label>
                            <input 
                                type="text"
                                value={data.sslcommerz_store_id}
                                onChange={e => setData('sslcommerz_store_id', e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all font-mono"
                                placeholder="..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Store Password</label>
                            <input 
                                type="password"
                                value={data.sslcommerz_store_password}
                                onChange={e => setData('sslcommerz_store_password', e.target.value)}
                                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all font-mono"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </div>

                {/* Quota & Strategy Settings */}
                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white">
                            <ShieldCheck size={18} />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Quota & Trial Strategy</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Default Trial Duration</label>
                                <p className="text-[9px] text-slate-500 font-medium mb-3">Days of Pro Tier access given to new containers.</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" max="30"
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        value={data.default_trial_days}
                                        onChange={e => setData('default_trial_days', e.target.value)}
                                    />
                                    <span className="text-xs font-black text-indigo-600 w-12 text-center">{data.default_trial_days}d</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Quota Alert Threshold</label>
                                <p className="text-[9px] text-slate-500 font-medium mb-3">Trigger AI Advisor notification when usage exceeds % limit.</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="50" max="100"
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        value={data.quota_alert_percent}
                                        onChange={e => setData('quota_alert_percent', e.target.value)}
                                    />
                                    <span className="text-xs font-black text-indigo-600 w-12 text-center">{data.quota_alert_percent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                        <Lock size={12} /> Encrypted at rest in GlobalSettings
                    </div>
                    <button 
                        type="submit"
                        disabled={processing}
                        className="px-8 py-3.5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
                    >
                        {processing ? 'Saving...' : <><Save size={16} /> Save Configurations</>}
                    </button>
                </div>
            </form>
        </PlatformLayout>
    );
};

export default BillingSettingsPage;
