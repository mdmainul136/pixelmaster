import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';

export default function Plans({ plans }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        plan_key: '',
        description: '',
        price_monthly: 0,
        is_active: true,
        event_quota: 100000,
        container_limit: 1,
        domain_limit: 1
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingPlan(null);
        reset();
        clearErrors();
        document.getElementById('plan_modal').showModal();
    };

    const openEditModal = (plan) => {
        setIsEditing(true);
        setEditingPlan(plan);
        setData({
            name: plan.name || '',
            plan_key: plan.plan_key || '',
            description: plan.description || '',
            price_monthly: plan.price_monthly || 0,
            is_active: plan.is_active !== undefined ? plan.is_active : true,
            event_quota: plan.quotas?.events || 100000,
            container_limit: plan.quotas?.containers !== undefined ? plan.quotas?.containers : (plan.plan_key === 'custom' ? -1 : 1),
            domain_limit: plan.quotas?.multi_domains !== undefined ? plan.quotas?.multi_domains : 1,
        });
        clearErrors();
        document.getElementById('plan_modal').showModal();
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('platform.billing.plans.update', editingPlan.id), {
                onSuccess: () => {
                    document.getElementById('plan_modal').close();
                    reset();
                }
            });
        } else {
            post(route('platform.billing.plans.store'), {
                onSuccess: () => {
                    document.getElementById('plan_modal').close();
                    reset();
                }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this plan? Tenants using this plan will lose access if you proceed.')) {
            destroy(route('platform.billing.plans.destroy', id));
        }
    };

    return (
        <PlatformLayout title="Subscription Plans">
            <Head title="Plans Management" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Subscription Plans</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage pricing tiers, limits, and features available to your tenants.</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-inner shadow-white/20"
                >
                    + Create Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">{plan.plan_key}</div>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {plan.is_active ? 'Active' : 'Disabled'}
                            </span>
                        </div>
                        
                        <div className="p-6 flex-1">
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-extrabold text-slate-900">${parseFloat(plan.price_monthly)}</span>
                                <span className="text-sm font-medium text-slate-500">/mo</span>
                            </div>

                            <ul className="space-y-3 mt-6">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <span className="font-semibold">
                                        {plan.quotas?.events === -1 
                                            ? 'Unlimited' 
                                            : plan.quotas?.events >= 1000000 
                                                ? (plan.quotas.events / 1000000) + ' Million' 
                                                : (plan.quotas?.events / 1000).toLocaleString() + 'k'} Events
                                    </span> /mo
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    <span className="font-semibold">{plan.quotas?.containers === -1 ? 'Unlimited' : plan.quotas?.containers || 0}</span> sGTM Containers
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    <span className="font-semibold">{plan.quotas?.multi_domains === -1 ? 'Unlimited' : plan.quotas?.multi_domains || 1}</span> Custom Domains
                                </li>
                                <li className="flex flex-col gap-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-semibold">{plan.features?.length || 0} Core Features</span>
                                    </div>
                                    
                                    {plan.features?.length > 0 && (
                                        <details className="group mt-1 cursor-pointer">
                                            <summary className="text-xs font-semibold text-blue-600 list-none flex justify-between items-center bg-blue-50/50 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                                                <span>View Feature List</span>
                                                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </summary>
                                            <div className="mt-2 text-xs text-slate-500 max-h-48 overflow-y-auto pr-1 bg-white border border-slate-100 rounded-lg p-3 custom-scrollbar shadow-inner">
                                                <ul className="space-y-1.5">
                                                    {plan.features.map(feat => (
                                                        <li key={feat} className="flex gap-2 items-start">
                                                            <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                            <span className="leading-tight">
                                                                {feat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </details>
                                    )}
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                            <button onClick={() => openEditModal(plan)} className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition">
                                Edit Plan
                            </button>
                            <button onClick={() => handleDelete(plan.id)} className="px-3 py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                        <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <h3 className="text-lg font-medium text-slate-900">No subscription plans</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">You haven't created any subscription plans yet.</p>
                        <button onClick={openCreateModal} className="text-blue-600 font-semibold hover:underline bg-blue-50 px-4 py-2 rounded-lg text-sm">Create your first plan</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <dialog id="plan_modal" className="modal modal-bottom sm:modal-middle bg-black/40 backdrop-blur-sm rounded-none p-0 mx-auto mt-0 w-full max-w-none h-full max-h-none overflow-y-auto">
                <div className="modal-box bg-white rounded-2xl shadow-2xl overflow-hidden m-auto mt-10 sm:mt-20 max-w-xl outline-none p-0 relative h-auto mb-20">
                    <form onSubmit={submit}>
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Subscription Plan' : 'Create New Plan'}</h3>
                            <button type="button" onClick={() => document.getElementById('plan_modal').close()} className="text-slate-400 hover:text-slate-600 transition">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plan Name</label>
                                    <input type="text" value={data.name ?? ''} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. Pro Plan" required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Key <span className="text-slate-400 font-normal">(no spaces)</span></label>
                                    <input type="text" value={data.plan_key ?? ''} onChange={e => setData('plan_key', e.target.value)} disabled={isEditing} className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none ${isEditing ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'}`} placeholder="e.g. pro" required />
                                    {errors.plan_key && <p className="text-red-500 text-xs mt-1">{errors.plan_key}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monthly Price (USD)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 sm:text-sm">$</span>
                                    </div>
                                    <input type="number" step="0.01" value={data.price_monthly ?? 0} onChange={e => setData('price_monthly', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                </div>
                                {errors.price_monthly && <p className="text-red-500 text-xs mt-1">{errors.price_monthly}</p>}
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Plan Quotas (sGTM)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monthly Events Limit</label>
                                        <input type="number" step="10000" value={data.event_quota ?? 0} onChange={e => setData('event_quota', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                        {errors.event_quota && <p className="text-red-500 text-xs mt-1">{errors.event_quota}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Container Limit (-1 = ∞)</label>
                                        <input type="number" value={data.container_limit ?? 0} onChange={e => setData('container_limit', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                        {errors.container_limit && <p className="text-red-500 text-xs mt-1">{errors.container_limit}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Domain Limit (-1 = ∞)</label>
                                        <input type="number" value={data.domain_limit ?? 1} onChange={e => setData('domain_limit', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
                                        {errors.domain_limit && <p className="text-red-500 text-xs mt-1">{errors.domain_limit}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Plan is Active & Visible</label>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => document.getElementById('plan_modal').close()} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50">
                                {processing ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </PlatformLayout>
    );
}
