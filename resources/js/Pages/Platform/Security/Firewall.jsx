import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Firewall({ rules, filters }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        ip_address: '',
        type: 'block',
        reason: '',
        expires_at: '',
    });

    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('platform.security.firewall'), { search }, { preserveState: true });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('platform.security.firewall.store'), {
            onSuccess: () => reset(),
        });
    };

    const toggleRule = (id) => {
        router.post(route('platform.security.firewall.toggle', id));
    };

    const deleteRule = (id) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            router.delete(route('platform.security.firewall.delete', id));
        }
    };

    return (
        <>
            <Head title="Firewall Management" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Firewall Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Control access to the platform by blocking or allowing specific IP addresses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold text-slate-800 mb-4">Add Firewall Rule</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">IP Address</label>
                                <input 
                                    type="text" 
                                    value={data.ip_address}
                                    onChange={e => setData('ip_address', e.target.value)}
                                    placeholder="e.g. 192.168.1.1" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                                />
                                {errors.ip_address && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.ip_address}</div>}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Rule Type</label>
                                <select 
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none font-medium"
                                >
                                    <option value="block">Block Access</option>
                                    <option value="allow">Whitelist (Allow)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Reason / Note</label>
                                <input 
                                    type="text" 
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    placeholder="e.g. Malicious script patterns" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Expiration (Optional)</label>
                                <input 
                                    type="date" 
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Add Rule'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h3 className="font-bold text-slate-800">Active Firewall Rules</h3>
                            <form onSubmit={handleSearch} className="relative">
                                <input 
                                    type="text" 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search IP or Reason..." 
                                    className="bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                                />
                                <svg className="absolute left-2.5 top-2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </form>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {rules.data.length > 0 ? rules.data.map(rule => (
                                    <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">{rule.ip_address}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                                rule.type === 'block' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                                {rule.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 truncate max-w-[200px]">{rule.reason || 'No reason provided'}</div>
                                            {rule.expires_at && <div className="text-[10px] text-slate-400 mt-1">Expires: {new Date(rule.expires_at).toLocaleDateString()}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleRule(rule.id)} className={`w-8 h-4 rounded-full relative transition-colors ${rule.is_active ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${rule.is_active ? 'left-4.5' : 'left-0.5'}`}></div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No firewall rules defined.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Firewall.layout = (page) => <PlatformLayout children={page} />;
