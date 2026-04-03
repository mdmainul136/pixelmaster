import React from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, router } from '@inertiajs/react';

const StatusBadge = ({ active }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
        active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
        {active ? 'Active' : 'Testing'}
    </span>
);

export default function Index({ configs }) {
    const handleToggle = (id) => {
        if (confirm('Change sGTM active status?')) {
            router.post(route('platform.sgtm.toggle', id));
        }
    };

    const handleRotate = (id) => {
        if (confirm('CRITICAL: Rotate API Key? Existing tracking for this tenant will BREAK until they update their container settings.')) {
            router.post(route('platform.sgtm.rotate-key', id));
        }
    };

    const handleReprovision = (id, type) => {
        if (confirm(`Switch to Metabase ${type.toUpperCase()}? This will re-clone the dashboard template.`)) {
            axios.post(`/api/tracking/admin/containers/${id}/reprovision`, { type })
                .then(() => {
                    toast?.success(`Re-provisioning for ${type} queued`);
                    router.reload({ preserveScroll: true });
                })
                .catch(() => toast?.error('Failed to queue provisioning'));
        }
    };

    const handleCHSwitch = (id, type) => {
        if (confirm(`Switch this container to ClickHouse ${type.toUpperCase()}? Future events will be stored in the new instance.`)) {
            router.post(route('platform.sgtm.switch-clickhouse', id), { type }, {
                preserveScroll: true,
                onSuccess: () => toast?.success(`Switched to ${type}`)
            });
        }
    };

    return (
        <>
            <Head title="sGTM Global Oversight" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">sGTM Global Oversight</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Centralized management for all server-side GTM containers and API visibility.</p>
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-500">
                    Total Containers: <span className="text-slate-900">{configs.total}</span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 italic">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant / Owner</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Container ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Domain</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Engine</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Storage</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {configs.data.length > 0 ? configs.data.map(config => (
                            <tr key={config.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-xs font-black text-slate-900 leading-none">{config.tenant?.tenant_name}</div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-medium">{config.tenant?.admin_email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                                        {config.container_id}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">
                                        {config.custom_domain || '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 group">
                                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                                            {config.secret_key || '—'}
                                        </div>
                                        {config.secret_key && (
                                            <button onClick={() => navigator.clipboard.writeText(config.secret_key)} className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 font-bold uppercase transition-opacity">Copy</button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.metabase_type === 'cloud' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {config.metabase_type === 'cloud' ? 'Cloud' : 'Self-hosted'}
                                        </span>
                                        <button 
                                            onClick={() => handleReprovision(config.id, config.metabase_type === 'cloud' ? 'self_hosted' : 'cloud')}
                                            className="text-[9px] font-bold text-slate-400 hover:text-slate-900 border-b border-dotted border-slate-300"
                                        >
                                            Switch
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.clickhouse_type === 'cloud' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {config.clickhouse_type === 'cloud' ? 'Cloud' : 'Self-hosted'}
                                        </span>
                                        <button 
                                            onClick={() => handleCHSwitch(config.id, config.clickhouse_type === 'cloud' ? 'self_hosted' : 'cloud')}
                                            className="text-[9px] font-bold text-slate-400 hover:text-slate-900 border-b border-dotted border-slate-300"
                                        >
                                            Switch
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge active={config.is_active} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleToggle(config.id)}
                                            className="px-2.5 py-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            {config.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                        <button 
                                            onClick={() => handleRotate(config.id)}
                                            className="px-2.5 py-1.5 text-[10px] font-black text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Rotate Key
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic text-sm font-medium uppercase tracking-widest">
                                    No tenant sGTM configurations detected.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {configs.links && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Page {configs.current_page} of {configs.last_page}
                        </p>
                        <div className="flex gap-1">
                            {configs.links.map((link, i) => (
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

Index.layout = (page) => <PlatformLayout children={page} />;
