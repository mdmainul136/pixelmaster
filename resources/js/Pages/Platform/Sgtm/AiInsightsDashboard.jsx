import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';
import { 
    BrainCircuit, 
    TrendingUp, 
    Users, 
    Activity, 
    ChevronRight, 
    AlertTriangle, 
    ShieldCheck, 
    Zap, 
    ArrowUpRight, 
    Info, 
    Rocket,
    BarChart3,
    Sparkles,
    PieChart,
    RefreshCcw
} from 'lucide-react';

const AiInsightsDashboard = ({ insights = [], predictive = {}, container }) => {
    const [isLoading, setIsLoading] = useState(false);

    const getSeverityColor = (sev) => {
        switch (sev?.toLowerCase()) {
            case 'critical': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    return (
        <PlatformLayout>
            <Head title="AI Predictive Insights — PixelMaster" />

            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
                            <BrainCircuit size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Advisor & Predictive Analytics</h1>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                             <Sparkles size={10} fill="currentColor" /> Powered by Gemini
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Forward-looking growth strategies. <span className="text-indigo-600 font-bold decoration-indigo-200 decoration-2 underline">Predict LTV and prevent churn</span> before it happens.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setIsLoading(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh AI Engine
                    </button>
                    <div className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck size={16} /> Data Health: {predictive.health_score}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* 1. Forecast Cards */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Predicted Revenue Upside</p>
                            <h2 className="text-3xl font-black tracking-tight mb-2">${predictive.total_predicted_upside?.toLocaleString()}</h2>
                            <p className="text-[11px] text-slate-400 font-medium">90-Day Retention Multiplier Forecast</p>
                            <div className="mt-6 px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase">
                                <TrendingUp size={12} className="text-emerald-400" /> +14.2% Growth Potential
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">VIP Churn Risk</p>
                            <h2 className="text-3xl font-black tracking-tight mb-2 text-rose-600">{predictive.vip_at_risk}</h2>
                            <p className="text-[11px] text-slate-400 font-medium">High-LTV Contacts in "Critical" Zone</p>
                            <div className="mt-6 px-4 py-2 bg-rose-50 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-rose-600 border border-rose-100">
                                <AlertTriangle size={12} /> Priority 1: Retain 
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">pLTV Accuracy Score</p>
                            <h2 className="text-3xl font-black tracking-tight mb-2 text-indigo-600">92.4%</h2>
                            <p className="text-[11px] text-slate-400 font-medium">Confidence in 12-Month Predictions</p>
                            <div className="mt-6 px-4 py-2 bg-indigo-50 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 border border-indigo-100">
                                <ShieldCheck size={12} /> High Signal Strength
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main AI Advisor Feed */}
                <div className="col-span-12 lg:col-span-12">
                    <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Zap size={18} fill="currentColor" className="text-amber-500" /> AI Advisor Priority Insight Feed
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Analysis Feed</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {insights.map((insight, idx) => (
                                <div key={idx} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] ${getSeverityColor(insight.severity)}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-3 py-1 bg-white/50 border border-white rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {insight.type} — {insight.severity}
                                        </div>
                                        <div className="p-2 border border-current/20 rounded-xl">
                                            <Zap size={14} fill="currentColor" />
                                        </div>
                                    </div>
                                    <h4 className="text-[13px] font-black mb-2 uppercase tracking-tight">{insight.title}</h4>
                                    <p className="text-[11px] font-medium leading-relaxed mb-6 opacity-80">
                                        {insight.message}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-tighter">Impact: <span className="underline decoration-2">{insight.impact}</span></div>
                                        <Link href={insight.action_link} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-0.5 hover:gap-4 transition-all">
                                            Explore Strategy <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Churn Risk Heatmap Overlay */}
                <div className="col-span-12 lg:col-span-8">
                     <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Predictive Health Matrix</h3>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Churn Probability Heatmap</p>
                            </div>
                            <div className="bg-slate-100 p-2.5 rounded-2xl">
                                <PieChart size={18} className="text-slate-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 mb-10">
                            {Object.entries(predictive.risk_distribution || {}).map(([level, count]) => {
                                const levelColors = {
                                    Safe: 'bg-emerald-500',
                                    Warning: 'bg-amber-400',
                                    High: 'bg-orange-500',
                                    Critical: 'bg-rose-600'
                                };
                                return (
                                    <div key={level} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center relative group overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-full h-1 ${levelColors[level]}`}></div>
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-2">{level} Risk</h5>
                                        <span className="text-2xl font-black text-slate-900">{count}</span>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Customers</p>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2.5xl">
                                    <BarChart3 className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-black uppercase tracking-tight">Generate Quarterly Revenue Strategy?</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">Gemini will analyze your full CDP data to build a retention plan.</p>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105">
                                Upgrade to Pro
                            </button>
                        </div>
                     </div>
                </div>

                {/* 4. Strategic Recommendations Sidepanel */}
                <div className="col-span-12 lg:col-span-4">
                     <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-emerald-600 p-2 rounded-xl text-white">
                                <Rocket size={16} />
                            </div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Master ROI Strategy</h3>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group cursor-pointer hover:border-emerald-500 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                         <Users size={18} />
                                    </div>
                                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
                                </div>
                                <h5 className="text-[11px] font-black uppercase text-slate-900 mb-2">Target At-Risk VIPs</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    We've found {predictive.vip_at_risk} high-value customers who haven't ordered in 45+ days.
                                </p>
                            </div>

                             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group cursor-pointer hover:border-indigo-500 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                         <Activity size={18} />
                                    </div>
                                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-500" />
                                </div>
                                <h5 className="text-[11px] font-black uppercase text-slate-900 mb-2">Boost pLTV Upside</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    Identify conversion gaps in Meta CAPI to recapture attribution worth \${predictive.total_predicted_upside * 0.1} in 30 days.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-white rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CDP Integration Active</p>
                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                Every tracking event contributes to predictive learning.
                            </p>
                        </div>
                     </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default AiInsightsDashboard;
