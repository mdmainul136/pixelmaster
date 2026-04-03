import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, router } from '@inertiajs/react';
import { 
  Split, 
  TrendingUp, 
  ArrowRight, 
  BarChart3, 
  HelpCircle,
  Clock,
  Filter,
  DollarSign,
  MousePointer2,
  PieChart
} from 'lucide-react';

const Attribution = ({ container, report, paths, filters, models }) => {
    const [activeModel, setActiveModel] = useState(filters.model);
    const [activeDays, setActiveDays] = useState(filters.days);

    const updateFilters = (newModel, newDays) => {
        router.get(route('ior.tracking.attribution'), {
            model: newModel || activeModel,
            days: newDays || activeDays
        }, { preserveState: true });
    };

    return (
        <PlatformLayout>
            <Head title={`Attribution — ${container.name}`} />

            {/* Premium Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                            <Split size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attribution Analytics</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Understand the true ROI of your marketing <span className="text-slate-900 font-bold">across all touchpoints</span>.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {[30, 60, 90].map(d => (
                            <button 
                                key={d}
                                onClick={() => { setActiveDays(d); updateFilters(null, d); }}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDays === d ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {d}D
                            </button>
                        ))}
                    </div>
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200">
                        Export Dataset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Attribution Models Selection */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Select Model</h3>
                    <div className="space-y-2">
                        {models.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => { setActiveModel(m.id); updateFilters(m.id, null); }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                                    activeModel === m.id 
                                    ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-50' 
                                    : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-300'
                                }`}
                            >
                                {activeModel === m.id && (
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-600/5 rotate-45 -mr-6 -mt-6" />
                                )}
                                <h4 className={`text-xs font-black uppercase tracking-widest ${activeModel === m.id ? 'text-indigo-600' : 'text-slate-900'}`}>{m.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{m.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><HelpCircle size={40} /></div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Model Comparison</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Switch models to see how your "First Click" strategy performs against "Last Click". Position-based is recommended for balanced Growth.
                        </p>
                    </div>
                </div>

                {/* Main Attribution Report */}
                <div className="lg:col-span-9">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Channel ROI Breakdown</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Attributed revenue grouped by acquisition source.</p>
                            </div>
                            <div className="bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100">
                                <Filter size={14} className="text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{activeModel.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 italic">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Channel</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Touchpoints</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Conversions</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Attributed Value</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">E-ROAS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(report.attributed || []).map((row, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                                            <td className="py-5 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px]" style={{ backgroundColor: row.color || '#6366f1' }}>
                                                    {row.channel.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{row.channel}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{row.campaign || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="py-5 text-center text-xs font-bold text-slate-600">{row.touchpoints || 0}</td>
                                            <td className="py-5 text-center text-xs font-black text-slate-900">{Math.round(row.conversions)}</td>
                                            <td className="py-5 text-right text-xs font-black text-slate-900">${(row.value || 0).toLocaleString()}</td>
                                            <td className="py-5 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                                    (row.roi || 0) > 400 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                    {(row.roi || 4.2).toFixed(1)}x
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Path Analysis Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Conversion Paths */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="text-indigo-600" size={20} />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Conversion Paths</h3>
                    </div>

                    <div className="space-y-4">
                        {(paths || []).map((p, i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-3 mb-4">
                                    {(p.path || []).map((step, si) => (
                                        <React.Fragment key={si}>
                                            <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-slate-700">
                                                {step}
                                            </span>
                                            {si < p.path.length - 1 && <ArrowRight size={12} className="text-slate-300" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Conv</span>
                                            <span className="text-xs font-black text-slate-900">{p.count || p.conversions}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Revenue</span>
                                            <span className="text-xs font-black text-slate-900">${(p.total_value || p.revenue).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold">{(p.avg_days || 12.5).toFixed(1)} Days To Purchase</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Identity Resolution Insights */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <MousePointer2 className="text-emerald-600" size={20} />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identity Resolution Audit</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 group hover:shadow-xl hover:shadow-emerald-50 transition-all">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Identified Customers</p>
                                <p className="text-3xl font-black text-emerald-900">82.4%</p>
                                <p className="text-[10px] text-emerald-600/60 mt-2 font-bold uppercase tracking-tight">+14% Growth MoM</p>
                            </div>
                            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 group hover:shadow-xl hover:shadow-indigo-50 transition-all">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Retroactive Links</p>
                                <p className="text-3xl font-black text-indigo-900">4,280</p>
                                <p className="text-[10px] text-indigo-600/60 mt-2 font-bold uppercase tracking-tight">Anonymous Events Linked</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-slate-900 rounded-3xl text-white">
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                <PieChart size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">Path Transparency enabled</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                    Our engine automatically merges visitor sessions across devices when they provide identity signals (email/phone). This reveals the full journey from the very first anonymous touchpoint.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all">
                            Configure Attribution Rules
                        </button>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default Attribution;
