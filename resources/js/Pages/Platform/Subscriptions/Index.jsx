import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';

const statusConfig = {
    active:   { label: 'Active',    cls: 'bg-green-50 text-green-700 border-green-200' },
    trialing: { label: 'Trialing',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    past_due: { label: 'Past Due',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    canceled: { label: 'Canceled',  cls: 'bg-red-50 text-red-700 border-red-200' },
    expired:  { label: 'Expired',   cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] ?? statusConfig.expired;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${status === 'active' ? 'bg-green-500 animate-pulse' : status === 'past_due' ? 'bg-amber-500' : 'bg-current opacity-50'}`}></span>
            {cfg.label}
        </span>
    );
};

const ActionsMenu = ({ sub }) => {
    const [open, setOpen] = useState(false);

    const handleAction = (routeName, label) => {
        if (!confirm(`${label}?\n\nTenant: ${sub.tenant_name}\nSubscription: #${sub.id}`)) return;
        router.post(route(routeName, sub.id), {}, {
            onFinish: () => setOpen(false),
        });
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Manage ▾
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs overflow-hidden">
                        {sub.status !== 'active' && (
                            <button onClick={() => handleAction('platform.subscriptions.renew', 'Renew / Reinstate subscription')}
                                className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-green-700 font-bold transition-colors">
                                ✓ Renew / Reinstate
                            </button>
                        )}
                        {sub.status === 'trialing' && (
                            <button onClick={() => handleAction('platform.subscriptions.extend-trial', 'Extend trial by 14 days')}
                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-700 font-bold transition-colors">
                                ⏱ Extend Trial +14 days
                            </button>
                        )}
                        {sub.status === 'active' && (
                            <button onClick={() => handleAction('platform.subscriptions.mark-pastdue', 'Mark as past due')}
                                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 text-amber-700 font-bold transition-colors">
                                ⚠ Mark Past Due
                            </button>
                        )}
                        {sub.status !== 'canceled' && sub.status !== 'expired' && (
                            <button onClick={() => handleAction('platform.subscriptions.cancel', 'Cancel subscription (7-day grace)')}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-700 font-bold border-t border-slate-100 mt-1 transition-colors">
                                ✕ Cancel Subscription
                            </button>
                        )}
                        <Link href={route('platform.tenants.show', sub.tenant_id)}
                            className="block px-4 py-2.5 hover:bg-slate-50 text-slate-600 font-bold border-t border-slate-100 mt-1 transition-colors">
                            → View Tenant
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default function Index({ subscriptions, stats, filters, plans }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [planFilter, setPlanFilter] = useState(filters?.plan ?? 'all');

    const applyFilters = () => {
        router.get(route('platform.subscriptions'), {
            status: statusFilter !== 'all' ? statusFilter : '',
            plan:   planFilter  !== 'all' ? planFilter  : '',
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setPlanFilter('all');
        router.get(route('platform.subscriptions'));
    };

    return (
        <>
            <Head title="Subscription Billing" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Subscription & Billing</h1>
                <p className="text-sm text-slate-500 mt-0.5">Track platform revenue, active plans, and billing health in real-time.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* MRR */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total MRR</div>
                    <div className="text-2xl font-black text-slate-900">
                        ${(stats.total_mrr ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                        <span className="text-[10px] text-slate-400">{stats.counts.active} active subscriptions</span>
                    </div>
                </div>

                {/* Trialing */}
                <div className={`bg-white border border-slate-200 p-5 rounded-2xl shadow-sm ${stats.counts.trialing > 0 ? 'border-l-4 border-l-blue-400' : ''}`}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Trials</div>
                    <div className="text-2xl font-black text-blue-600">{stats.counts.trialing}</div>
                    <div className="text-[10px] text-slate-400 mt-2 font-medium">
                        Potential MRR: ${(stats.counts.trialing * 29).toLocaleString()}
                    </div>
                </div>

                {/* Past Due */}
                <div className={`bg-white border border-slate-200 p-5 rounded-2xl shadow-sm ${stats.counts.past_due > 0 ? 'border-l-4 border-l-amber-400' : ''}`}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Past Due</div>
                    <div className="text-2xl font-black text-amber-600">{stats.counts.past_due}</div>
                    <div className="text-[10px] text-slate-400 mt-2 font-medium">
                        {stats.counts.past_due > 0 ? '⚠ Requires dunning action' : 'All payments current'}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Revenue by Plan</div>
                    {stats.breakdown && Object.keys(stats.breakdown).length > 0 ? (
                        <div className="space-y-1.5">
                            {Object.entries(stats.breakdown).map(([name, amount]) => (
                                <div key={name} className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 truncate">{name}</span>
                                    <span className="text-[10px] font-mono text-slate-700 font-bold">${Number(amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-400 italic">No revenue data yet.</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[10px]">
                        <span className="text-slate-400">Canceled</span>
                        <span className="font-bold text-red-500">{stats.counts.canceled}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-5 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Status:</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 appearance-none">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="past_due">Past Due</option>
                        <option value="canceled">Canceled</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Plan:</label>
                    <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 appearance-none">
                        <option value="all">All Plans</option>
                        {plans && Object.entries(plans).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <button onClick={applyFilters} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">
                    Filter
                </button>
                {(statusFilter !== 'all' || planFilter !== 'all') && (
                    <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">MRR</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Renew / Trial End</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Canceled At</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subscriptions.data.length > 0 ? subscriptions.data.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <Link href={route('platform.tenants.show', sub.tenant_id)} className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                                        {sub.tenant_name}
                                    </Link>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">{sub.tenant_id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-slate-700">{sub.plan_name}</div>
                                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{sub.billing_cycle}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={sub.status} />
                                    {sub.trial_days_remaining !== null && sub.trial_days_remaining !== undefined && (
                                        <div className="text-[9px] text-blue-500 font-bold mt-1">{sub.trial_days_remaining}d left</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-sm font-black text-slate-700">
                                        {sub.monthly_revenue > 0 ? `$${sub.monthly_revenue.toLocaleString()}` : <span className="text-slate-300 font-normal italic text-xs">—</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-xs text-slate-500 font-medium">
                                        {sub.renews_at ?? sub.trial_ends_at ?? <span className="text-slate-300 italic">N/A</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {sub.canceled_at ? (
                                        <div className="text-[10px] text-red-400 font-bold">{sub.canceled_at}</div>
                                    ) : (
                                        <span className="text-slate-300 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ActionsMenu sub={sub} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-14 text-center text-slate-400 italic text-sm">
                                    No subscriptions found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {subscriptions.links && (
                    <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] text-slate-400 font-medium">
                            Showing {subscriptions.from ?? 0} – {subscriptions.to ?? 0} of {subscriptions.total ?? 0} subscriptions
                        </p>
                        <div className="flex gap-1">
                            {subscriptions.links.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, { preserveState: true })}
                                    className={`px-2 py-1 text-[10px] rounded border font-bold transition-all ${link.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-30'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <PlatformLayout children={page} />;
