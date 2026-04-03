import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';

const StatusBadge = ({ status }) => {
    const styles = {
        active:    'bg-green-50 text-green-700 border-green-200',
        inactive:  'bg-slate-50 text-slate-500 border-slate-200',
        suspended: 'bg-red-50 text-red-600 border-red-200',
        terminated:'bg-red-100 text-red-700 border-red-300',
        pending:   'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.inactive}`}>
            {status}
        </span>
    );
};

const ActionDropdown = ({ tenant }) => {
    const [open, setOpen] = useState(false);

    const handleAction = (action) => {
        setOpen(false);
        if (action === 'impersonate') {
            if (confirm(`Login as ${tenant.tenant_name}?`)) router.post(route('platform.impersonate', tenant.id));
        } else if (action === 'approve') {
            if (confirm(`Approve ${tenant.tenant_name}?`)) router.post(route('platform.tenants.approve', tenant.id));
        } else if (action === 'suspend') {
            if (confirm(`Suspend ${tenant.tenant_name}?`)) router.post(route('platform.tenants.suspend', tenant.id));
        } else if (action === 'delete') {
            if (confirm(`Terminate ${tenant.tenant_name}? This action marks them as terminated but keeps the database.`)) {
                router.delete(route('platform.tenants.delete', tenant.id));
            }
        } else if (action === 'full_delete') {
            if (confirm(`CRITICAL: Fully delete ${tenant.tenant_name} and DROP their database? THIS CANNOT BE UNDONE.`)) {
                router.delete(route('platform.tenants.delete', tenant.id), {
                    data: { drop_db: true }
                });
            }
        }
    };

    return (
        <div className="relative" onBlur={() => setTimeout(() => setOpen(false), 150)}>
            <div className="flex items-center gap-1">
                <button onClick={() => handleAction('impersonate')} title="Login as Tenant"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                </button>
                <button onClick={() => setOpen(!open)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>

            {open && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden border border-slate-100">
                    <Link href={route('platform.tenants.show', tenant.id)}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5">
                        <svg className="text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View Details
                    </Link>
                    <Link href={route('platform.tenants.edit', tenant.id)}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5">
                        <svg className="text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit Details
                    </Link>
                    <Link href={route('platform.tenants.quotas', tenant.id)}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5">
                        <svg className="text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Manage Quotas
                    </Link>
                    <Link href={route('platform.tenants.domains', tenant.id)}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors gap-2.5">
                        <svg className="text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        Manage Domains
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    {tenant.status !== 'active' && (
                        <button onClick={() => handleAction('approve')}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors gap-2.5">
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Approve Tenant
                        </button>
                    )}
                    {tenant.status === 'active' && (
                        <button onClick={() => handleAction('suspend')}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors gap-2.5">
                            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Suspend
                        </button>
                    )}
                    <button onClick={() => handleAction('delete')}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2.5">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Terminate Only
                    </button>
                    <button onClick={() => handleAction('full_delete')}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 transition-colors gap-2.5 font-bold">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        FULL DELETE (Drop DB)
                    </button>
                </div>
            )}
        </div>
    );
};

export default function Index({ tenants, filters, plans }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [planFilter, setPlanFilter] = useState(filters?.plan ?? 'all');

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get('/platform/tenants', {
            search,
            status: statusFilter !== 'all' ? statusFilter : '',
            plan: planFilter !== 'all' ? planFilter : '',
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatusFilter('all'); setPlanFilter('all');
        router.get('/platform/tenants');
    };

    return (
        <>
            <Head title="Tenants Management" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Tenant Workspaces</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage all tenant accounts, plans, and access on your platform.</p>
                </div>
            </div>

            {/* Search & Filters */}
            <form onSubmit={applyFilters} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-5 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-60">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Name, email, or tenant ID…"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Plan</label>
                    <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none">
                        <option value="all">All Plans</option>
                        {plans && Object.entries(plans).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                    Search
                </button>
                {(search || statusFilter !== 'all' || planFilter !== 'all') && (
                    <button type="button" onClick={clearFilters}
                        className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all">
                        Clear
                    </button>
                )}
                <div className="ml-auto">
                    <p className="text-xs text-slate-400 font-medium pt-6">{tenants?.total ?? 0} tenants</p>
                </div>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Domain</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tenants?.data?.length > 0 ? tenants.data.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <Link href={route('platform.tenants.show', tenant.id)} className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm">
                                        {tenant.tenant_name}
                                    </Link>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{tenant.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-700">{tenant.admin_name}</div>
                                    <div className="text-xs text-slate-400">{tenant.admin_email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{tenant.domain}</td>
                                <td className="px-6 py-4">
                                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded uppercase tracking-wider">
                                        {tenant.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <StatusBadge status={tenant.status} />
                                        {tenant.billing_status && tenant.billing_status !== 'none' && (
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                tenant.billing_status === 'active' ? 'text-green-600 bg-green-50' :
                                                tenant.billing_status === 'past_due' ? 'text-amber-600 bg-amber-50' :
                                                'text-red-600 bg-red-50'}`}>
                                                Sub: {tenant.billing_status}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ActionDropdown tenant={tenant} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-16 text-center">
                                    <p className="text-sm text-slate-400 italic">No tenants found matching your filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {tenants?.links && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Showing {tenants.from}–{tenants.to} of {tenants.total} tenants
                        </p>
                        <div className="flex gap-1">
                            {tenants.links.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${link.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-40'}`}
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

Index.layout = page => <PlatformLayout children={page} title="Tenants Management" />;
