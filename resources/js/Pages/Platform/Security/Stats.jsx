import React from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';

export default function Stats({ recent_blocked, blocked_count_24h }) {
    return (
        <PlatformLayout>
            <Head title="Security Statistics" />

            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Security Statistics</h1>
                <p className="text-sm text-slate-500 mt-0.5">Real-time overview of blocked attempts and rate-limit violations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blocked (24h)</h3>
                    <p className="text-3xl font-bold text-red-600">{blocked_count_24h}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Recent Rate Limit Violations</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {recent_blocked.length > 0 ? recent_blocked.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-900">{item.ip}</td>
                                <td className="px-6 py-4 text-slate-600">{item.route || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(item.timestamp * 1000).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic">No recent violations detected.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </PlatformLayout>
    );
}
