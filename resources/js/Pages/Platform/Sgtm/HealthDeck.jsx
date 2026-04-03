import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, useForm } from '@inertiajs/react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
            {icon}
        </div>
    </div>
);

export default function HealthDeck({ stats, infrastructure }) {
    const { post, processing } = useForm();
    const [lastSync, setLastSync] = useState(stats.timestamp);

    const handleSync = () => {
        if (confirm("Are you sure you want to rebuild global mappings? This will reload shared infrastructure containers.")) {
            post(route('api.tracking.dashboard.health.sync'), {
                onSuccess: () => {
                    setLastSync(new Date().toLocaleString());
                }
            });
        }
    };

    return (
        <PlatformLayout>
            <Head title="Mission Control - sGTM Infrastructure" />

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">sGTM Mission Control</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        Real-time infrastructure health & billing enforcement deck.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Check: {lastSync}</span>
                    <button 
                        onClick={handleSync}
                        disabled={processing}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {processing ? 'Syncing...' : 'Rebuild Global Mappings'}
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Active Containers" 
                    value={stats.active_containers}
                    color="bg-emerald-50 text-emerald-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                />
                <StatCard 
                    title="Suspended (Quota)" 
                    value={stats.suspended_containers}
                    color="bg-rose-50 text-rose-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                />
                <StatCard 
                    title="Monthly Throughput" 
                    value={stats.total_monthly_events.toLocaleString()}
                    color="bg-indigo-50 text-indigo-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                />
                <StatCard 
                    title="Cluster Engine" 
                    value={infrastructure.engine || 'Mix Mode'}
                    color="bg-amber-50 text-amber-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Infrastructure Details */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-black text-slate-900">Infrastructure Node Health</h3>
                    </div>
                    <div className="p-6">
                        {infrastructure.status === 'healthy' ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 p-2 rounded-lg text-white">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.959 11.959 0 01-1.25 12.154c-1.129 1.488-2.66 2.766-4.368 3.664a11.938 11.938 0 01-8.618 0 11.93 11.93 0 01-4.368-3.664 11.959 11.959 0 01-1.25-12.154m17.236 0l-8.618 3.04L3.382 6.016"></path></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-900">Infrastructure Online</p>
                                            <p className="text-[10px] text-emerald-700 font-medium">All tracking nodes are operational.</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-[9px] font-black uppercase rounded">Healthy</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl">
                                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Active Orchestrator</p>
                                        <p className="text-sm font-bold text-slate-800">{infrastructure.engine || 'Docker Orcherstrator'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl">
                                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Resource Cluster</p>
                                        <p className="text-sm font-bold text-slate-800">{infrastructure.cluster || infrastructure.sidecar || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                                <div className="bg-rose-500 p-2 rounded-lg text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-rose-900">Infrastructure Degraded</p>
                                    <p className="text-[10px] text-rose-700 font-medium">{infrastructure.message || 'Connecting to nodes failed.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation Log */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-black text-slate-900">Billing Enforcement</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </div>
                        <p className="text-xs font-bold text-slate-800">No recent suspensions.</p>
                        <p className="text-[10px] text-slate-500 mt-1">Automatic quota enforcement is active. Next run at 03:00 PM.</p>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}
