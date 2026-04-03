import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  User, 
  Map, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  ChevronRight, 
  ShieldCheck, 
  Globe, 
  Smartphone, 
  Monitor,
  Zap,
  ArrowUpRight,
  Fingerprint,
  Mail,
  Phone
} from 'lucide-react';

const SingleCustomerView = ({ container, identity, timeline }) => {
    const [activeTab, setActiveTab] = useState('timeline');

    const getSourceIcon = (source) => {
        if (source?.toLowerCase().includes('google')) return <Globe size={14} className="text-blue-500" />;
        if (source?.toLowerCase().includes('facebook') || source?.toLowerCase().includes('meta')) return <Zap size={14} className="text-indigo-500" />;
        return <ArrowUpRight size={14} className="text-slate-400" />;
    };

    return (
        <PlatformLayout>
            <Head title={`CDP: ${identity.email_hash ? 'Unified Profile' : 'Anonymous Journey'} — PixelMaster`} />

            <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        <User size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {identity.email_hash ? `Identity #${identity.id}` : 'Anonymous Prospect'}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${identity.segment_color}-50 text-${identity.segment_color}-600 border border-${identity.segment_color}-100 shadow-sm`}>
                                {identity.customer_segment}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                                <Fingerprint size={14} /> <span className="font-mono text-[10px]">{identity.primary_anonymous_id?.substr(0, 12)}...</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                                <Mail size={14} /> {identity.email_hash ? <span className="blur-[3px] hover:blur-0 transition-all">hashed_email_value</span> : 'Unidentified'}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl">
                                <Phone size={14} /> {identity.phone_hash ? <span className="blur-[3px] hover:blur-0 transition-all">hashed_phone_value</span> : 'Unidentified'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                        <span className="text-lg font-black text-emerald-600 tracking-tight">${identity.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                        <span className="text-lg font-black text-slate-900 tracking-tight">{identity.order_count}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* 1. Main Timeline View */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Clock size={18} className="text-slate-400" /> Unified Journey Timeline
                            </h3>
                            <div className="flex gap-2">
                                <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">All Events</button>
                                <button className="px-5 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">Purchases Only</button>
                            </div>
                        </div>

                        <div className="p-10 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[59px] top-10 bottom-10 w-0.5 bg-slate-100"></div>

                            <div className="space-y-12">
                                {timeline.map((event, idx) => (
                                    <div key={event.id} className="relative flex items-start gap-8 group">
                                        <div className="w-[44px] text-right flex flex-col pt-1">
                                            <span className="text-[10px] font-black text-slate-900 uppercase">{new Date(event.processed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(event.processed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        </div>

                                        <div className={`z-10 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 mt-0.5 ${
                                            event.event_name === 'purchase' ? 'bg-emerald-500' : 'bg-slate-200 group-hover:bg-indigo-500 transition-all'
                                        }`}></div>

                                        <div className={`flex-grow p-6 rounded-[2rem] border transition-all ${
                                            event.event_name === 'purchase' 
                                            ? 'bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-50/50' 
                                            : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-lg'
                                        }`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{event.event_name}</h4>
                                                    {event.identity_id && event.payload?._merged && (
                                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-tighter">Heuristic Merged</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400">{event.source_ip}</span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source</span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900">
                                                        {getSourceIcon(event.payload?.source)} {event.payload?.source || 'Direct'}
                                                    </div>
                                                </div>
                                                {event.event_name === 'purchase' && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Revenue</span>
                                                        <div className="text-[10px] font-black text-emerald-600">${event.payload?.value || 0}</div>
                                                    </div>
                                                )}
                                                <div className="col-span-2 flex flex-col gap-1 overflow-hidden">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Page Location</span>
                                                    <div className="text-[9px] font-mono text-slate-500 truncate">{event.page_url || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Identity Graph Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                <Map size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Identity Network</h3>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Heuristic Logic Alert */}
                            <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex gap-3">
                                <ShieldCheck className="text-indigo-600 shrink-0" size={18} />
                                <div>
                                    <h5 className="text-[10px] font-black text-indigo-900 uppercase leading-none mb-1">Smart Stitching Active</h5>
                                    <p className="text-[9px] text-indigo-700 font-medium leading-relaxed">Profiles are linked when **IP + Device** matched within 90 days of an identified session.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merged Fingerprints</h4>
                                {(identity.merged_anonymous_ids || []).map((id, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <Smartphone size={16} className="text-slate-400" />
                                        <span className="text-[10px] font-mono text-slate-900 truncate">{id}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Known Locations</h4>
                                {(identity.ip_addresses || []).slice(0, 3).map((ip, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Globe size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-semibold text-slate-700">{ip}</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Primary</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 transition-all duration-700 group-hover:scale-150"></div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Attribution History</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 italic text-[10px] font-black">1st</div>
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Discovery Source</p>
                                        <p className="text-[11px] font-bold text-white capitalize">{identity.first_touch_source} / {identity.first_touch_medium}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 italic text-[10px] font-black">Last</div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Closing Touch</p>
                                        <p className="text-[11px] font-bold text-white capitalize">{identity.last_touch_source || 'Direct'} / {identity.last_touch_medium || 'None'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default SingleCustomerView;
