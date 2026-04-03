import React, { useState, useEffect } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import FeatureGate from "@/Components/FeatureGate";
import { Head, router } from '@inertiajs/react';
import { 
  BarChart3, 
  Layers, 
  GitMerge, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Target, 
  ChevronDown, 
  TrendingUp, 
  DollarSign,
  Info,
  Calendar,
  Filter,
  ChevronRight
} from 'lucide-react';

const AttributionModeler = ({ container, matrix, paths, filters }) => {
    const [selectedModel, setSelectedModel] = useState('position_based');
    const [comparisonModel, setComparisonModel] = useState('last_touch');
    const [days, setDays] = useState(filters.days || 30);

    const models = [
        { id: 'first_touch', name: 'First Click', desc: 'Gives 100% credit to the very first touchpoint.' },
        { id: 'last_touch', name: 'Last Click', desc: 'Gives 100% credit to the final touchpoint before conversion.' },
        { id: 'linear', name: 'Linear', desc: 'Distributes credit equally across all touchpoints.' },
        { id: 'position_based', name: 'Position Based', desc: '40% to first, 40% to last, 20% to the middle.' },
        { id: 'time_decay', name: 'Time Decay', desc: 'Touches closer to conversion get more credit.' },
    ];

    const getModelLabel = (id) => models.find(m => m.id === id)?.name || id;

    const handleDaysChange = (newDays) => {
        setDays(newDays);
        router.get(window.location.pathname, { days: newDays }, { preserveState: true });
    };

    return (
        <DashboardLayout>
            <Head title="Attribution Modeler — PixelMaster" />
            <FeatureGate feature="monitoring" requiredPlan="Business">

            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
                            <Target size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Attribution Modeler</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Compare Multi-Touch models and identify <span className="text-indigo-600 font-bold underline decoration-indigo-200 decoration-2">Incremental Growth</span> across channels.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={14} /> Lookback Window
                    </div>
                    {[7, 30, 90].map(d => (
                        <button 
                            key={d}
                            onClick={() => handleDaysChange(d)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                                days === d ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* 1. Model Selector & Comparison Matrix */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Channel Comparison Matrix</h3>
                                <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Performance by Attribution Strategy</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Model</label>
                                    <select 
                                        value={selectedModel}
                                        onChange={e => setSelectedModel(e.target.value)}
                                        className="w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center justify-center p-3 mt-4 text-slate-300">
                                    <ArrowRight size={18} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bench Model</label>
                                    <select 
                                        value={comparisonModel}
                                        onChange={e => setComparisonModel(e.target.value)}
                                        className="w-48 px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        <th className="pb-4 text-left">Channel Group</th>
                                        <th className="pb-4 text-center">{getModelLabel(selectedModel)}</th>
                                        <th className="pb-4 text-center">{getModelLabel(comparisonModel)}</th>
                                        <th className="pb-4 text-right">Delta / Lift</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {matrix.map((row, idx) => {
                                        const primaryVal = row.models[selectedModel]?.conversions || 0;
                                        const benchVal = row.models[comparisonModel]?.conversions || 0;
                                        const delta = benchVal === 0 ? 0 : ((primaryVal - benchVal) / benchVal) * 100;

                                        return (
                                            <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
                                                        <span className="text-[12px] font-black text-slate-900">{row.group}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className="text-xs font-black text-slate-900">{primaryVal.toFixed(2)}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Conversions</p>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className="text-xs font-bold text-slate-500">{benchVal.toFixed(2)}</span>
                                                    <p className="text-[9px] font-medium text-slate-300 uppercase tracking-tighter mt-0.5">Bench Score</p>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${
                                                        delta > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                        {delta > 0 ? <TrendingUp size={12} /> : <ChevronDown size={12} />}
                                                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}% Lift
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. Conversion Journey Paths */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Top Conversion Journeys</h3>
                                <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">Most common multi-touch paths to purchase</p>
                            </div>
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <GitMerge size={20} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {paths.map((p, idx) => (
                                <div key={idx} className="group p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border-l-4 border-l-indigo-500">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        {p.path.map((step, sIdx) => (
                                            <React.Fragment key={sIdx}>
                                                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 transition-all group-hover:scale-105">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${sIdx === 0 ? 'bg-emerald-500' : sIdx === p.path.length - 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{step}</span>
                                                </div>
                                                {sIdx < p.path.length - 1 && <ArrowRight size={14} className="text-slate-300" />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-6">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Occurrences: <span className="text-slate-900">{p.count}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Total ROI Value: <span className="text-emerald-600">${p.total_value.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                                            Audit Journey <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Models Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-indigo-400" /> Attribution Intelligence
                            </h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10">
                                Switching models changes how ROI is calculated. PixelMaster uses first-party cookies to track journeys for up to 90 days.
                            </p>

                            <div className="space-y-6">
                                {models.map(m => (
                                    <div 
                                        key={m.id}
                                        onClick={() => setSelectedModel(m.id)}
                                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                                            selectedModel === m.id 
                                            ? 'bg-white/10 border-indigo-500 shadow-xl' 
                                            : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest">{m.name}</h4>
                                            {m.id === 'position_based' && (
                                                <span className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black uppercase rounded-lg">Recommended</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium leading-normal">{m.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                <Zap size={16} fill="currentColor" />
                            </div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Incrementality Score</h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6">
                            Determines the "True Value" of a channel. High lift in Position-Based vs Last-Click indicates a strong "Assist" channel.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black uppercase text-slate-400">Meta Assist</span>
                                <span className="text-xs font-black text-emerald-600">+22% Lift</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-black uppercase text-slate-400">Google Reach</span>
                                <span className="text-xs font-black text-indigo-600">+14% Lift</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </FeatureGate>
        </DashboardLayout>
    );
};

export default AttributionModeler;
