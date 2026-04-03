import React from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';

const InfoRow = ({ label, value, mono = false }) => (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-40 flex-shrink-0 pt-0.5">{label}</span>
        <span className={`text-sm text-slate-800 font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}>{value ?? '—'}</span>
    </div>
);

const Badge = ({ value, color = 'slate' }) => {
    const colors = {
        green: 'bg-green-50 text-green-700 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${colors[color] || colors.slate}`}>
            {value}
        </span>
    );
};

const statusColor = (s) => ({ active: 'green', suspended: 'red', terminated: 'red', inactive: 'slate', trialing: 'blue' }[s] || 'slate');

export default function Show({ tenant, subscription, modules, sgtm, quotas, auditLogs }) {
    const handleApprove = () => {
        if (confirm(`Approve and activate ${tenant.tenant_name}?`)) {
            router.post(route('platform.tenants.approve', tenant.id));
        }
    };
    const handleSuspend = () => {
        if (confirm(`Suspend ${tenant.tenant_name}?`)) {
            router.post(route('platform.tenants.suspend', tenant.id));
        }
    };
    const handleDelete = () => {
        if (confirm(`Terminate tenant ${tenant.tenant_name}? This cannot be undone.`)) {
            router.delete(route('platform.tenants.delete', tenant.id));
        }
    };
    const handleImpersonate = () => {
        if (confirm(`Login as ${tenant.tenant_name}?`)) {
            router.post(route('platform.impersonate', tenant.id));
        }
    };

    return (
        <>
            <Head title={`Tenant: ${tenant.tenant_name}`} />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/platform/tenants" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{tenant.tenant_name}</h1>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{tenant.id}</p>
                    </div>
                    <Badge value={tenant.status} color={statusColor(tenant.status)} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleImpersonate} className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                        Login as Tenant
                    </button>
                    {tenant.status !== 'active' && (
                        <button onClick={handleApprove} className="px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm">
                            Approve
                        </button>
                    )}
                    {tenant.status === 'active' && (
                        <button onClick={handleSuspend} className="px-3 py-2 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm">
                            Suspend
                        </button>
                    )}
                    <Link href={route('platform.tenants.edit', tenant.id)} className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="px-3 py-2 text-xs font-bold bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                        Terminate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left — Main Info */}
                <div className="xl:col-span-2 space-y-5">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Workspace Information</h2>
                        </div>
                        <div className="px-5 py-2">
                            <InfoRow label="Workspace Name" value={tenant.tenant_name} />
                            <InfoRow label="Admin Name" value={tenant.admin_name} />
                            <InfoRow label="Admin Email" value={tenant.admin_email} />
                            <InfoRow label="Domain" value={tenant.domain} />
                            <InfoRow label="Database" value={tenant.database_name} mono />
                            <InfoRow label="Plan" value={tenant.plan?.toUpperCase()} />
                            <InfoRow label="Created" value={new Date(tenant.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                            <InfoRow label="Trial Ends" value={tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : 'No Trial'} />
                            <InfoRow label="Onboarded" value={tenant.onboarded_at ? new Date(tenant.onboarded_at).toLocaleDateString() : 'Not yet'} />
                        </div>
                    </div>

                    {/* Subscription */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Subscription</h2>
                        </div>
                        <div className="px-5 py-2">
                            {subscription ? (
                                <>
                                    <InfoRow label="Status" value={<Badge value={subscription.status} color={statusColor(subscription.status)} />} />
                                    <InfoRow label="Plan" value={subscription.plan_name} />
                                    <InfoRow label="Billing Cycle" value={subscription.billing_cycle} />
                                    <InfoRow label="Renews At" value={subscription.renews_at ? new Date(subscription.renews_at).toLocaleDateString() : '—'} />
                                    <InfoRow label="Trial Ends" value={subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : '—'} />
                                </>
                            ) : (
                                <p className="py-6 text-center text-sm text-slate-400 italic">No subscription record found.</p>
                            )}
                        </div>
                    </div>

                    {/* Modules */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Active Modules ({modules?.length ?? 0})</h2>
                        </div>
                        {modules?.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Level</th>
                                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {modules.map(m => (
                                        <tr key={m.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 font-medium text-slate-800">{m.name}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 uppercase font-bold">{m.plan_level}</td>
                                            <td className="px-4 py-3"><Badge value={m.status} color={m.status === 'active' ? 'green' : 'slate'} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="py-6 text-center text-sm text-slate-400 italic">No modules subscribed.</p>
                        )}
                    </div>
                </div>

                {/* Right — Sidebar Info */}
                <div className="space-y-5">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
                        </div>
                        <div className="p-3 space-y-1">
                            <Link href={route('platform.tenants.edit', tenant.id)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit Workspace Info
                            </Link>
                            <Link href={`${route('platform.tenants.edit', tenant.id)}#password`} onClick={e => { e.preventDefault(); window.location = route('platform.tenants.edit', tenant.id) + '?tab=password'; }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-amber-700 hover:bg-amber-50 transition-colors group">
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                Reset Admin Password
                            </Link>
                            <Link href={`${route('platform.tenants.edit', tenant.id)}?tab=sgtm`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors group">
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Configure sGTM
                            </Link>
                            <div className="border-t border-slate-100 my-1" />
                            <Link href={route('platform.tenants.quotas', tenant.id)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Manage Quotas
                            </Link>
                            <Link href={route('platform.tenants.domains', tenant.id)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><line x1="2" y1="12" x2="22" y2="12" strokeWidth={2}/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth={2}/></svg>
                                Manage Domains
                            </Link>
                        </div>
                    </div>

                    {/* sGTM Config */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">sGTM Configuration</h2>
                        </div>
                        <div className="px-5 py-2">
                            {sgtm ? (
                                <>
                                    <InfoRow label="Container ID" value={sgtm.container_id} mono />
                                    <InfoRow label="Custom Domain" value={sgtm.custom_domain} />
                                    <InfoRow label="Status" value={<Badge value={sgtm.is_active ? 'Active' : 'Inactive'} color={sgtm.is_active ? 'green' : 'slate'} />} />
                                    <InfoRow label="API Key" value={sgtm.api_key?.substring(0, 8) + '...'} mono />
                                </>
                            ) : (
                                <p className="py-4 text-center text-xs text-slate-400 italic">No sGTM config.</p>
                            )}
                        </div>
                    </div>

                    {/* Quota Usage */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Quota Usage</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {quotas?.length > 0 ? quotas.map(q => {
                                const pct = q.quota_limit > 0 ? Math.round((q.used_count / q.quota_limit) * 100) : 0;
                                return (
                                    <div key={q.id}>
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                            <span>{q.module_slug}</span>
                                            <span>{q.used_count}/{q.quota_limit} ({pct}%)</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-xs text-slate-400 italic text-center py-2">No quota records.</p>}
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-slate-800">Recent Events</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {auditLogs?.length > 0 ? auditLogs.map(log => (
                                <div key={log.id} className="px-5 py-3">
                                    <p className="text-xs font-medium text-slate-700">{log.action}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-slate-400">{log.created_at}</span>
                                        {log.ip_address && <span className="text-[10px] font-mono text-slate-400">{log.ip_address}</span>}
                                    </div>
                                </div>
                            )) : <p className="px-5 py-4 text-xs text-slate-400 italic">No events logged.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = page => <PlatformLayout children={page} title="Tenant Detail" />;
