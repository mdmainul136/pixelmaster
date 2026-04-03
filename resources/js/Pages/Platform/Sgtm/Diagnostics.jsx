import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Fingerprint,
  Info
} from 'lucide-react';

const ProgressBar = ({ label, percentage, color = 'indigo' }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>{label}</span>
            <span>{Math.round(percentage * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
                className={`h-full bg-${color}-500 shadow-lg shadow-${color}-100 transition-all duration-1000`} 
                style={{ width: `${percentage * 100}%` }} 
            />
        </div>
    </div>
);

const Diagnostics = ({ container }) => {
    const [quality, setQuality] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, tRes] = await Promise.all([
                axios.get(`/api/tracking/diagnostics/${container.id}/quality`),
                axios.get(`/api/tracking/diagnostics/${container.id}/trends`)
            ]);
            setQuality(qRes.data.data);
            setTrends(tRes.data.data);
        } catch (error) {
            console.error('Failed to fetch diagnostics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <PlatformLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Running Diagnostic Engine...</p>
                </div>
            </div>
        </PlatformLayout>
    );

    return (
        <PlatformLayout>
            <Head title={`Diagnostics — ${container.name}`} />

            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-rose-500 p-2.5 rounded-2xl shadow-lg shadow-rose-100 text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">CAPI Diagnostics & Quality</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Deep-dive analysis of <span className="text-slate-900 font-bold">Event Match Quality (EMQ)</span> and parameter coverage.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Refresh Audit
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200">
                        Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Health Score Gauge */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                        
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 block">Global Signal Quality</h3>
                        
                        <div className="flex justify-center relative scale-110">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* SVG Gauge Simulation */}
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    <circle 
                                        cx="96" cy="96" r="88" fill="none" stroke="#4f46e5" strokeWidth="12" 
                                        strokeDasharray="552.92" 
                                        strokeDashoffset={552.92 - (552.92 * (quality.score / 10))}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter">{quality.score}</span>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Score / 10</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                quality.rating === 'Great' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                quality.rating === 'Good' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                                {quality.rating} Quality
                            </span>
                            <p className="text-[11px] text-slate-400 mt-4 font-medium leading-relaxed">
                                Your signal match quality is <span className="text-slate-900 font-bold">{quality.rating.toLowerCase()}</span>. 
                                High scores directly reduce ad acquisition costs.
                            </p>
                        </div>
                    </div>

                    {/* Deduplication Status */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap size={18} className="text-amber-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Deduplication Matching</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Matched Events</p>
                                    <p className="text-xl font-black">{Math.round(quality.stats.deduplication.matched * 100)}%</p>
                                </div>
                                <CheckCircle2 className="text-emerald-400 pb-1" size={20} />
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Server Only (Gap)</p>
                                    <p className="text-xl font-black">{Math.round(quality.stats.deduplication.unmatched_server * 100)}%</p>
                                </div>
                                <AlertCircle className="text-amber-400 pb-1" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Breakdown */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Parameter Coverage */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Parameter Coverage Audit</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Tracking percentage of individual user identifiers.</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100">
                                <Database size={14} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase">30D Dataset</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <ProgressBar label="Email Hash (sha256)" percentage={quality.stats.coverage.em} color="indigo" />
                            <ProgressBar label="FBP (Browser ID)" percentage={quality.stats.coverage.fbp} color="emerald" />
                            <ProgressBar label="FBC (Click ID)" percentage={quality.stats.coverage.fbc} color="blue" />
                            <ProgressBar label="Phone Hash" percentage={quality.stats.coverage.ph} color="rose" />
                            <ProgressBar label="First/Last Name" percentage={quality.stats.coverage.fn} color="amber" />
                            <ProgressBar label="User Agent / IP" percentage={quality.stats.coverage.ua} color="slate" />
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">
                                <CheckCircle2 size={14} /> Optimization Advisor
                            </h4>
                            <div className="space-y-4">
                                {quality.recommendations.map((rec, i) => (
                                    <div key={i} className="group p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                rec.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                                            }`}>
                                                {rec.priority} PRIO
                                            </span>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-900">{rec.title}</h5>
                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{rec.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
                            <div>
                                <Fingerprint size={32} className="mb-4 text-indigo-200/50" />
                                <h4 className="text-lg font-black tracking-tight leading-tight mb-2">Secure Identity Resolution</h4>
                                <p className="text-xs text-indigo-100/80 leading-relaxed font-medium">
                                    All parameters are hashed on the fly before being transmitted to third-party endpoints. Your tracking remains GDPR/CCPA compliant while maximizing match quality.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-indigo-400/30 flex items-center gap-2">
                                <Info size={14} className="text-indigo-200" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Automatic Hashing Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Architecture Explainer */}
            <div className="mt-12 p-8 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                <div className="relative w-32 h-32 shrink-0">
                    <div className="absolute inset-0 bg-slate-100 rounded-3xl rotate-6" />
                    <div className="absolute inset-0 bg-indigo-500 rounded-3xl -rotate-3 flex items-center justify-center text-white shadow-2xl">
                        <TrendingUp size={40} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Understanding EMQ Scores</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed font-medium">
                        Event Match Quality (EMQ) measures how well Facebook can link server-side events back to a specific person. 
                        A score of <span className="text-slate-900 font-bold">10.0</span> means perfect identification, resulting in higher attribution precision and up to 30% lower CPA for your marketing campaigns.
                    </p>
                    <div className="flex gap-8 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">First-Party Signals</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Cryptographic Anonymization</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Dataset Health Alerts</span>
                        </div>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default Diagnostics;
