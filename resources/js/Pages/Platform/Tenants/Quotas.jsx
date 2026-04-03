import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Quotas({ tenant, quotas }) {
    const { data, setData, post, processing, errors } = useForm({
        quotas: quotas.map(q => ({
            id: q.id,
            module_slug: q.module_slug,
            used_count: q.used_count,
            quota_limit: q.quota_limit,
        }))
    });

    const handleLimitChange = (index, value) => {
        const newQuotas = [...data.quotas];
        newQuotas[index].quota_limit = parseInt(value) || 0;
        setData('quotas', newQuotas);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('platform.tenants.quotas.update', tenant.id));
    };

    const getModuleIcon = (slug) => {
        if (slug.includes('whatsapp')) return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.5.9L21 3z"/></svg>;
        if (slug.includes('scraping')) return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M5.07 5.07l13.86 13.86M5.07 18.93l13.86-13.86"/></svg>;
        return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    };

    return (
        <PlatformLayout>
            <Head title={`Manage Quotas - ${tenant.tenant_name}`} />

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href={route('platform.tenants')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Manage Usage Quotas</h2>
                        <p className="text-slate-500">Override base resource limits for {tenant.tenant_name}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="space-y-6">
                            {data.quotas.map((quota, idx) => {
                                const usagePercent = (quota.used_count / quota.quota_limit) * 100;
                                return (
                                    <div key={quota.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                                                    {getModuleIcon(quota.module_slug)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">{quota.module_slug}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{quota.used_count.toLocaleString()} units consumed</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Set New Limit</div>
                                                <input 
                                                    type="number"
                                                    value={quota.quota_limit}
                                                    onChange={e => handleLimitChange(idx, e.target.value)}
                                                    className="w-32 px-3 py-2 text-sm font-bold rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ease-out ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {data.quotas.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-400">No active quotas found for this tenant.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex gap-4 border-t border-slate-100 pt-8">
                            <button 
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black shadow-lg shadow-slate-100 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Update Quotas'}
                            </button>
                            <Link 
                                href={route('platform.tenants')}
                                className="px-8 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </PlatformLayout>
    );
}
