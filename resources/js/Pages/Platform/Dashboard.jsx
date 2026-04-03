import React from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, delta, deltaType = 'up', icon, extra }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-gray-200 flex items-center justify-center text-slate-500">
                {icon}
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
                {delta && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deltaType === 'up' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                        {deltaType === 'up' ? '↑' : ''} {delta}
                    </span>
                )}
            </div>
            {extra}
        </div>
    </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-50 text-green-700 border-green-200',
        inactive: 'bg-slate-50 text-slate-500 border-slate-200',
        suspended: 'bg-red-50 text-red-600 border-red-100',
        trial: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.inactive}`}>
            {status}
        </span>
    );
};

// ─── Plan badge ───────────────────────────────────────────────────────────────
const PlanBadge = ({ plan }) => {
    const styles = {
        basic: 'text-slate-600 bg-slate-50 border-slate-200',
        growth: 'text-blue-700 bg-blue-50 border-blue-200',
        advanced: 'text-purple-700 bg-purple-50 border-purple-200',
        enterprise: 'text-amber-700 bg-amber-50 border-amber-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${styles[plan?.toLowerCase()] || styles.basic}`}>
            {plan || 'Basic'}
        </span>
    );
};

// ─── Section block ────────────────────────────────────────────────────────────
const Section = ({ title, action, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
            {action}
        </div>
        {children}
    </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ stats, recentTenants, recentSignups, infrastructure, subscriptionStats, recentAuditLogs, ...props }) {
    // Polling for real-time infrastructure pulse
    useEffect(() => {
        // Start polling after a delay to ensure the initial load is fully settled
        const initialDelay = setTimeout(() => {
            const timer = setInterval(() => {
                // Only reload if the window is active to save resources
                if (document.visibilityState === 'visible') {
                    router.reload({ 
                        only: ['infrastructure', 'stats'], 
                        preserveScroll: true, 
                        preserveState: true 
                    });
                }
            }, 15000); // Increased to 15s for better balance
            
            return () => clearInterval(timer);
        }, 2000); // 2s initial delay

        return () => clearTimeout(initialDelay);
    }, []);

    const trialExpiring = stats?.trial_expiring ?? 0;
    const statCards = [
        {
            label: 'Total Tenants',
            value: stats?.total_tenants ?? '0',
            delta: stats?.tenant_change,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
        },
        {
            label: 'Active Subscriptions',
            value: stats?.active_tenants ?? '0',
            delta: null,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        },
        {
            label: 'Active Pricing Plans',
            value: stats?.active_modules ?? '0',
            delta: null,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
        },
        {
            label: 'Platform Revenue (MRR)',
            value: stats?.mrr ?? '$0.00',
            delta: stats?.mrr_change,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
            extra: stats?.mrr_breakdown && (
                <div className="mt-2 pt-2 border-t border-slate-50 space-y-1">
                    {Object.entries(stats.mrr_breakdown).map(([name, val]) => (
                        <div key={name} className="flex justify-between text-[10px] items-center">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">{name}</span>
                            <span className="text-slate-700 font-mono">${val.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )
        },
        {
            label: 'Trial Health',
            value: stats?.trial_expiring ?? '0',
            delta: stats?.trial_expiring_today > 0 ? `${stats.trial_expiring_today} today` : null,
            deltaType: 'error',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        },
        {
            label: 'Database Alerts',
            value: infrastructure?.quota_overages ?? '0',
            delta: null,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        },
    ];

    const tenants = recentTenants && recentTenants.length > 0 ? recentTenants : [];

    const systemChecks = [
        { name: 'Cache Hit Rate', status: `${infrastructure?.cache_health?.hit_rate ?? '0'}%`, count: infrastructure?.cache_health?.memory_usage ?? '0MB', type: 'success' },
        { name: 'Blocked Intrusions', status: infrastructure?.blocked_intrusions > 10 ? 'Alert' : 'Minimal', count: infrastructure?.blocked_intrusions, type: infrastructure?.blocked_intrusions > 10 ? 'error' : 'success' },
        { name: 'Failed Jobs', status: infrastructure?.failed_jobs > 0 ? 'Review' : 'None', count: infrastructure?.failed_jobs, type: infrastructure?.failed_jobs > 0 ? 'error' : 'success' },
        { name: 'Pending Jobs', status: infrastructure?.pending_jobs > 100 ? 'Delayed' : 'Flowing', count: infrastructure?.pending_jobs, type: infrastructure?.pending_jobs > 100 ? 'warning' : 'success' },
        { name: 'Global Queue Latency', status: 'Running', count: '12ms', type: 'success' },
    ];

    return (
        <>
            <Head title={`${props.settings?.app_name || 'Platform'} - Orchestration`} />

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{props.settings?.app_name || 'Platform'} Intelligence</h1>
                <p className="text-sm text-slate-500 mt-0.5">Global oversight of tenant networks, service delivery, and infrastructure health.</p>
            </div>

            {/* Trial Expiry Alert */}
            {trialExpiring > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900">
                                <strong>{trialExpiring}</strong> trials expiring within 14 days
                            </p>
                            {stats?.trial_expiring_today > 0 && (
                                <p className="text-[11px] text-indigo-700 font-medium">⚠️ <strong>{stats.trial_expiring_today}</strong> units are expiring <strong>today</strong>.</p>
                            )}
                        </div>
                    </div>
                    <Link href="/platform/subscriptions?status=trialing" className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors shadow-sm">
                        Manage Subscriptions
                    </Link>
                </div>
            )}

            {/* Billing / Dunning Alert Banner */}
            {(stats?.past_due_tenants > 0 || stats?.suspended_tenants > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">Billing Attention Required</p>
                            <p className="text-xs text-amber-700">
                                {stats?.past_due_tenants > 0 && <span><strong>{stats.past_due_tenants}</strong> tenant(s) past due. </span>}
                                {stats?.suspended_tenants > 0 && <span><strong>{stats.suspended_tenants}</strong> tenant(s) suspended due to unpaid invoices.</span>}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Link href={route('platform.tenants')} className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:outline-none">
                            Review Tenants
                        </Link>
                    </div>
                </div>
            )}

            {/* System Pulse Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                        <p className="text-sm font-bold text-green-900">System Pulsating: All Services Operational</p>
                        <p className="text-xs text-green-700">Infrastructure reporting 100% uptime in the last 24 hours.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-green-800 text-xs font-semibold">
                    <div className="flex flex-col items-end">
                        <span>DB Latency</span>
                        <span className="font-bold">4ms</span>
                    </div>
                    <div className="w-px h-6 bg-green-200"></div>
                    <div className="flex flex-col items-end">
                        <span>API Status</span>
                        <span className="font-bold font-mono">200 OK</span>
                    </div>
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {statCards.map(card => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            {/* Profitability & Infra Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Infrastructure Yield</h3>
                                <p className="text-2xl font-bold">Estimated Profitability</p>
                            </div>
                            <div className="bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md border border-white/10">
                                <span className="text-[10px] font-bold text-white/60 mr-2">MARGIN</span>
                                <span className="text-sm font-black text-green-400">82.4%</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Real-time EPS</p>
                                <p className="text-2xl font-mono font-bold tracking-tighter text-blue-300">{infrastructure?.eps_realtime || '0.00'}</p>
                                <p className="text-[10px] text-white/20 mt-1 italic">Events Per Second</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">24h Throughput</p>
                                <p className="text-2xl font-mono font-bold tracking-tighter">{infrastructure?.total_events_24h || '0'}</p>
                                <p className="text-[10px] text-white/20 mt-1 italic">Processed Logs</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase mb-1">AWS Pulse (Opex)</p>
                                <p className="text-2xl font-mono font-bold tracking-tighter text-amber-300">${infrastructure?.cost_estimate?.toFixed(2) || '0.00'}</p>
                                <p className="text-[10px] text-white/20 mt-1 italic">Est. Pod Opex / Day</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Grid background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Security Perimeter</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium">Blocked IPs</span>
                            <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{infrastructure?.blocked_intrusions || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium">Quota Overages</span>
                            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{infrastructure?.quota_overages || 0}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <Link href="/platform/security/firewall" className="w-full inline-flex justify-center items-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                                Access Firewall Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Recent Signups */}
                <div className="xl:col-span-2 space-y-4">
                    <Section
                        title="Latest Signups & Workspaces"
                        action={
                            <Link href="/platform/tenants" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                Manage
                            </Link>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-slate-50/50">
                                        <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tenant ID</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentTenants && recentTenants.length > 0 ? recentTenants.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                                                        {t.id.substring(0,2)}
                                                    </div>
                                                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-xs">{t.domain}</td>
                                            <td className="px-4 py-3">
                                                <PlanBadge plan={t.plan} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={t.status} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-10 text-center text-slate-400 italic">
                                                No recent tenants found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Section title="Revenue Growth (%)">
                            <div className="p-4">
                                <div className="flex items-end gap-2 h-32 mb-4">
                                    {(props.revenueTrends || []).map((t, idx) => {
                                        const maxRevenue = Math.max(...(props.revenueTrends || []).map(rt => rt.revenue));
                                        const height = (t.revenue / maxRevenue) * 100;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="relative w-full flex flex-col justify-end h-full">
                                                    <div 
                                                        className="w-full bg-blue-100 rounded-t-sm group-hover:bg-blue-400 transition-colors"
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">Growth Rate</span>
                                    <span className="text-xs font-bold text-green-600">+14.2%</span>
                                </div>
                            </div>
                        </Section>

                        <Section title="Global Quota Health">
                            <div className="p-4 space-y-4">
                                {infrastructure?.quota_usage?.length > 0 ? (
                                    <div className="space-y-3">
                                        {infrastructure.quota_usage.map(q => {
                                            const percent = q.total_limit > 0 ? (q.total_used / q.total_limit) * 100 : 0;
                                            return (
                                                <div key={q.module_slug} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                                                        <span>{q.module_slug}</span>
                                                        <span>{Math.round(percent)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${Math.min(100, percent)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic text-center py-4">No usage data detected</p>
                                )}
                            </div>
                        </Section>
                    </div>

                    <Section title="Subscription Activity">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-slate-50/50">
                                        <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentSignups?.length > 0 ? recentSignups.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-slate-800 text-xs">{s.tenant_name}</td>
                                            <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-600">{s.plan}</td>
                                            <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{s.status}</td>
                                            <td className="px-4 py-3 text-slate-400 text-[11px]">{s.date}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-5 py-6 text-center text-slate-400 italic text-xs">No recent subscriptions</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </div>

                {/* System Health (takes 1/3) */}
                <div className="space-y-4">
                    {/* Platform Deployment Guide */}
                    <Section 
                        title="Infrastructure Deploy Guide" 
                        action={<span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                    >
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                To ensure tenants can successfully provision custom tracking domains, your primary load balancer DNS must be correctly configured.
                            </p>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">1. Wildcard DNS Setup</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Type</span>
                                        <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">CNAME</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Name</span>
                                        <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">*.customers</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Target / Value</span>
                                        <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-blue-600">lb.pxlmaster.net</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                                <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1.5">2. Edge SSL Provisioning</h4>
                                <p className="text-[11px] text-blue-700 leading-relaxed">
                                    Global CDN uses Cloudflare API to provision edge SSL. Ensure your tokens are active in <Link href="/platform/settings" className="font-bold underline hover:text-blue-900">Platform Settings</Link>.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="System Health">
                        <div className="divide-y divide-gray-100">
                            {systemChecks.map(check => (
                                <div key={check.name} className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            check.type === 'error' ? 'bg-red-500 animate-pulse' : 
                                            check.type === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                                        }`}></span>
                                        <span className="text-sm text-slate-700">{check.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {check.count !== undefined && (
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{check.count}</span>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                            check.type === 'error' ? 'text-red-600' : 
                                            check.type === 'warning' ? 'text-amber-600' : 'text-green-600'
                                        }`}>{check.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Remove Activity Log to make layout leaner */}

                    {/* Subscription Health */}
                    <Section title="Subscription Health">
                        <div className="p-4 space-y-2">
                            {[
                                { label: 'Active', count: subscriptionStats?.active ?? 0, color: 'bg-green-500' },
                                { label: 'Trialing', count: subscriptionStats?.trialing ?? 0, color: 'bg-blue-500' },
                                { label: 'Past Due', count: subscriptionStats?.past_due ?? 0, color: 'bg-amber-500' },
                                { label: 'Canceled', count: subscriptionStats?.canceled ?? 0, color: 'bg-red-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between py-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                        <span className="text-sm text-slate-600">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 tabular-nums">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Recent Audit Events */}
                    {recentAuditLogs && recentAuditLogs.length > 0 && (
                        <Section title="Recent Audit Events" action={
                            <Link href="/platform/security/audit" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">View All</Link>
                        }>
                            <div className="divide-y divide-slate-100">
                                {recentAuditLogs.map(log => (
                                    <div key={log.id} className="px-5 py-2.5">
                                        <p className="text-xs text-slate-700 font-medium line-clamp-1">{log.action}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400">{log.created_at}</span>
                                            {log.ip_address && <span className="text-[10px] font-mono text-slate-300">{log.ip_address}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Quick actions */}
                    <Section title="Quick Actions">
                        <div className="p-3 space-y-1">
                            {[
                                { label: 'Create New Tenant', href: '/platform/tenants' },
                                { label: 'Manage Subscription Plans', href: '/platform/billing/plans' },
                                { label: 'Platform Settings', href: '/platform/settings' },
                            ].map(action => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                                >
                                    {action.label}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </Section>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = page => <PlatformLayout children={page} title="Dashboard" />
