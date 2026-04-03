import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function EventsIndex({ logs, infra, yield: yieldData, filters }) {
    // Polling for live monitor
    useEffect(() => {
        const timer = setInterval(() => {
            router.reload({
                only: ['infra', 'logs'],
                preserveScroll: true,
                preserveState: true
            });
        }, 5000); // 5s pulse
        return () => clearInterval(timer);
    }, []);

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [activeTab, setActiveTab] = useState('monitor'); // monitor, yield, settings

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('platform.events'), { search, status }, { preserveState: true });
    };

    const handleRetry = () => {
        if (confirm('Are you sure you want to retry the last 100 failed events?')) {
            router.post(route('platform.events.retry'), {}, {
                onSuccess: () => alert('Batch retry triggered successfully.')
            });
        }
    };

    return (
        <>
            <Head title="Event & Tracking Infrastructure" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Event Pipeline Intelligence</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Global monitor for tracking throughput, queue latency, and infrastructure yield.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRetry}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6m12-4a9 9 0 0 1-15 6.7L3 16"/></svg>
                        Bulk Retry Failed
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['monitor', 'yield'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTab === 'monitor' ? (
                <>
                    {/* Real-time Health Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Throughput (EPS)</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-bold text-slate-900">{infra.stats.eps_60s}</span>
                                <span className="text-xs font-bold text-slate-400">evt/sec</span>
                            </div>
                            <div className="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[70%]" />
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Queue Depth (Pro)</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-bold text-indigo-600">{infra.queues.tracking_pro}</span>
                                <span className="text-xs font-bold text-slate-400">jobs</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">Avg. Latency: <span className="font-bold text-slate-600">{infra.stats.avg_latency_ms}ms</span></p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Queue Depth (Free)</h3>
                            <div className="flex items-baseline gap-2 text-slate-900">
                                <span className="text-3xl font-mono font-bold">{infra.queues.tracking_free}</span>
                                <span className="text-xs font-bold text-slate-400">jobs</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-amber-600 font-bold">Standard priority</p>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 italic">Failed (24h)</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-bold text-red-600">{infra.stats.failed_24h}</span>
                                <span className="text-xs font-bold text-red-400">errors</span>
                            </div>
                            <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-tight">Requires Attention</p>
                        </div>
                    </div>

                    {/* Event Explorer */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Event Explorer
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{logs.total} Total</span>
                            </h3>
                            <form onSubmit={handleFilter} className="flex items-center gap-2">
                                <select 
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none font-bold text-slate-600"
                                >
                                    <option value="all">All Status</option>
                                    <option value="processed">Processed</option>
                                    <option value="failed">Failed</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search Event/Tenant/Code..." 
                                        className="bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-900 font-medium w-64"
                                    />
                                    <svg className="absolute left-2.5 top-2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </div>
                                <button type="submit" className="hidden">Filter</button>
                            </form>
                        </div>
                        
                        <div className="flex-1 overflow-x-auto text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Name</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {logs.data.length > 0 ? logs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <td className="px-6 py-3">
                                                <span className="font-mono text-[10px] text-slate-400">#{log.id}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <Link href={route('platform.tenants.show', log.tenant_id)} className="text-slate-900 hover:text-indigo-600 hover:underline">
                                                    {log.tenant_id}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-slate-700 font-bold">{log.event_name}</span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                    log.status === 'processed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    log.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {log.status_code || log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 text-xs">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-slate-400 italic">No event logs found matching criteria.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/20">
                            <div className="text-xs text-slate-500 font-bold">Showing {logs.from || 0} to {logs.to || 0} of {logs.total} entries</div>
                            <div className="flex gap-1">
                                {logs.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            link.active ? 'bg-slate-900 text-white' : 
                                            link.url ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Profitability Engine</h3>
                                <p className="text-3xl font-bold mb-8">Yield Analysis (30d)</p>
                                
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Estimated MRR</p>
                                            <p className="text-4xl font-mono font-bold tabular-nums text-white">${yieldData.total_mrr.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/40 text-[10px] font-bold uppercase mb-1">AWS Pulse (Opex)</p>
                                            <p className="text-2xl font-mono font-bold text-green-400">-${yieldData.total_cost.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                                        <div>
                                            <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Global Gross Margin</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-5xl font-mono font-bold text-indigo-400">{yieldData.net_margin.toFixed(1)}%</p>
                                                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
                                            </div>
                                        </div>
                                        <div className="max-w-[150px] text-right">
                                            <p className="text-white/30 text-[10px] italic leading-tight">Optimized Pods: {yieldData.pro_pods} Dedicated + Global Shared Cluster.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[120px] -z-0"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-0"></div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Efficiency Benchmarking</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-600">Event Volume (Processed)</span>
                                        <span className="text-slate-900">{yieldData.monthly_events} / month</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[65%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-600">Unit Economics Efficiency</span>
                                        <span className="text-slate-900">${yieldData.efficiency} / 1M events</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[85%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Unit Economics Breakdown</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Global Shared Cluster', desc: 'AWS EKS Fargate - Spot Instances', cost: '$4.00' },
                                { label: 'Dedicated Pro Pods', desc: `${yieldData.pro_pods} Small Shared Pods @ $3.50`, cost: `$${(yieldData.pro_pods * 3.50).toFixed(2)}` },
                                { label: 'Egress & API Overhead', desc: 'Cloudfront + Internal Networking', cost: '$0.00' },
                                { label: 'Database & Redis', desc: 'Shared Multi-tenant Core', cost: '$0.00' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                        <p className="font-mono font-bold text-slate-600 group-hover:text-slate-900">{item.cost}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-lg font-bold">
                                <span className="text-slate-900">Total Monthly Opex</span>
                                <span className="text-indigo-600 font-mono">${yieldData.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

EventsIndex.layout = (page) => <PlatformLayout children={page} />;
