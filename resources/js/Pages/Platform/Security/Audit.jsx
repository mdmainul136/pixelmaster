import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';

const ActionBadge = ({ action }) => {
    const isError = action.toLowerCase().includes('fail') || action.toLowerCase().includes('unauthorized');
    const isDelete = action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove');
    const isAuth = action.toLowerCase().includes('login') || action.toLowerCase().includes('logout');

    let style = 'bg-slate-50 text-slate-500 border-slate-200';
    if (isError) style = 'bg-red-50 text-red-700 border-red-200';
    if (isDelete) style = 'bg-amber-50 text-amber-700 border-amber-200';
    if (isAuth) style = 'bg-blue-50 text-blue-700 border-blue-200';

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${style}`}>
            {action.split(' ')[0]}
        </span>
    );
};

export default function Audit({ logs, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [type, setType] = useState(filters?.event_type ?? 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('platform.security.audit'), { search, event_type: type !== 'all' ? type : '' }, { preserveState: true });
    };

    return (
        <>
            <Head title="Security Audit Log" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Security Audit Log</h1>
                <p className="text-sm text-slate-500 mt-0.5">Immutable trail of all super-admin actions and system-level configuration changes.</p>
            </div>

            {/* Filter Bar */}
            <form onSubmit={handleSearch} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex gap-4 items-end">
                <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Search Action / IP / ID</label>
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by keyword..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium"
                    />
                </div>
                <div className="w-48">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Event Type</label>
                    <select 
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-medium"
                    >
                        <option value="all">All Events</option>
                        <option value="tenant_management">Tenant Management</option>
                        <option value="subscription">Subscription</option>
                        <option value="security">Security</option>
                        <option value="configuration">Configuration</option>
                    </select>
                </div>
                <button type="submit" className="bg-slate-900 text-white font-bold h-10 px-6 rounded-xl hover:bg-black transition-colors shadow-lg">
                    Filter
                </button>
            </form>

            {/* Audit Feed */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor / Context</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.data.length > 0 ? logs.data.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-slate-900">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {log.tenant ? (
                                        <div className="flex flex-col">
                                            <Link href={route('platform.tenants.show', log.tenant_id)} className="text-xs font-black text-indigo-600 hover:underline">{log.tenant.tenant_name}</Link>
                                            <span className="text-[10px] text-slate-400 font-mono uppercase">{log.tenant_id}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">GLOBAL SYSTEM</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 max-w-[400px]">
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{log.action}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <ActionBadge action={log.event_type} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{log.ip_address}</span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No audit entries matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {logs.links && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {logs.total} total logs recorded
                        </p>
                        <div className="flex gap-1.5">
                            {logs.links.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, { preserveState: true })}
                                    className={`px-3 py-1.5 text-[10px] rounded-lg border font-black transition-all ${link.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-30'}`}
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

Audit.layout = (page) => <PlatformLayout children={page} />;
