import React, { useState } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Head, Link, router } from '@inertiajs/react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Fingerprint,
  Mail,
  MoreVertical,
  ShieldCheck
} from 'lucide-react';

const CdpList = ({ container, identities }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const getSegmentStyles = (segment) => {
        switch (segment?.toLowerCase()) {
            case 'vip': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'at risk': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <DashboardLayout>
            <Head title="Customer Data Platform — PixelMaster" />

            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
                            <Fingerprint size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Unified Customer Intelligence</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Cross-device identity resolution for <span className="text-indigo-600 font-bold underline decoration-indigo-200 decoration-2">High-Fidelity tracking</span>.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by ID or Hash..." 
                            className="bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <Users size={18} className="text-slate-400" />
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Identified Profiles ({identities.total})</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <ShieldCheck size={10} /> Identity Graph Active
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="px-10 py-6 text-left font-black">Customer / Identity</th>
                                <th className="px-8 py-6 text-center font-black">Segment</th>
                                <th className="px-8 py-6 text-center font-black">Orders</th>
                                <th className="px-8 py-6 text-center font-black">Value (LTV)</th>
                                <th className="px-10 py-6 text-right font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {identities.data.map((identity) => (
                                <tr key={identity.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => router.get(route('user.sgtm.cdp.show', [container.container_id, identity.id]))}>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[12px] font-black text-slate-900">Identity #{identity.id}</span>
                                                    {identity.email_hash && <Mail size={12} className="text-indigo-400" />}
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 truncate w-32">{identity.primary_anonymous_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getSegmentStyles(identity.customer_segment)}`}>
                                            {identity.customer_segment || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-xs font-black text-slate-900">{identity.order_count || 0}</span>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap">Total Transactions</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-xs font-black text-emerald-600">${identity.total_spent?.toLocaleString() || '0.00'}</span>
                                        <div className="flex items-center justify-center gap-1 mt-0.5">
                                            <DollarSign size={8} className="text-emerald-400" />
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Predicted Upside</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <Link 
                                            href={route('user.sgtm.cdp.show', [container.container_id, identity.id])}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm group-hover:shadow-lg"
                                        >
                                            View Journey <ChevronRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing <span className="text-slate-900">{identities.from}-{identities.to}</span> of {identities.total} Profiles
                    </p>
                    <div className="flex gap-2">
                         {identities.links.map((link, i) => (
                            <button 
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${
                                    link.active 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                                } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CdpList;
