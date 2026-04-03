import React, { useState, useEffect, useRef } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';
import { 
  Activity, 
  Terminal, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Globe,
  Trash2,
  Play,
  Square
} from 'lucide-react';

const EventDebugger = ({ auth, initialLogs = [] }) => {
    const [events, setEvents] = useState(initialLogs);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLive, setIsLive] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const scrollRef = useRef(null);

    // Simulated WebSocket listener (Echo integration would go here)
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                const newEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    event_name: ['page_view', 'add_to_cart', 'purchase', 'view_item'][Math.floor(Math.random() * 4)],
                    source_ip: '192.168.1.' + Math.floor(Math.random() * 255),
                    status: 'processed',
                    status_code: 200,
                    created_at: new Date().toISOString(),
                    payload: {
                        event_id: 'eid_' + Math.random().toString(36).substr(2, 9),
                        client_id: 'cid_' + Math.random().toString(36).substr(2, 9),
                        user_data: {
                            email: 'sha256_hashed_email_value_here',
                            phone: 'sha256_hashed_phone_value_here',
                            external_id: 'sha256_hashed_id_here'
                        },
                        page_location: 'https://myshop.com/products/awesome-item',
                        currency: 'USD',
                        value: 29.99
                    }
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 100));
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isLive]);

    const filteredEvents = events.filter(e => 
        e.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.source_ip.includes(searchTerm)
    );

    return (
        <PlatformLayout>
            <Head title="Event Debugger Console — PixelMaster" />

            <div className="flex flex-col h-[calc(100vh-140px)]">
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-slate-900 p-2 rounded-xl shadow-lg text-white">
                                <Terminal size={18} />
                            </div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Real-time Event Debugger</h1>
                            {isLive && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100 animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-rose-600 rounded-full"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">Live Stream</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium ml-10">
                            Monitor incoming server-side tracking requests. <span className="text-rose-600 font-black decoration-rose-200 decoration-2 underline">PII is SHA-256 Hashed for Privacy.</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text"
                                placeholder="Filter by event or IP..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isLive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                        >
                            {isLive ? <><Square size={12} fill="currentColor" /> Stop Stream</> : <><Play size={12} fill="currentColor" /> Resume Stream</>}
                        </button>
                        <button 
                            onClick={() => setEvents([])}
                            className="p-2 bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-grow gap-6 min-h-0">
                    {/* Event List */}
                    <div className="flex-grow bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                        <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-5">Event Name</div>
                            <div className="col-span-3">Source IP</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Time</div>
                        </div>
                        <div className="flex-grow overflow-y-auto" ref={scrollRef}>
                            {filteredEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <Activity size={48} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">Waiting for incoming events...</p>
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`grid grid-cols-12 px-6 py-3 border-b border-slate-50 items-center cursor-pointer transition-all hover:bg-slate-50 ${
                                            selectedEvent?.id === event.id ? 'bg-indigo-50/50 border-indigo-100' : ''
                                        }`}
                                    >
                                        <div className="col-span-5 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                            <span className="text-[11px] font-bold text-slate-900">{event.event_name}</span>
                                        </div>
                                        <div className="col-span-3 text-[10px] font-mono text-slate-500">{event.source_ip}</div>
                                        <div className="col-span-2">
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                                {event.status_code} OK
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-right text-[10px] font-medium text-slate-400">
                                            {new Date(event.created_at).toLocaleTimeString([], { hour12: false })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Inspector Sidebar */}
                    <div className={`w-[450px] bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col transition-all overflow-hidden ${selectedEvent ? 'translate-x-0' : 'translate-x-full hidden'}`}>
                        {selectedEvent && (
                            <>
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                                            <Zap size={14} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest">{selectedEvent.event_name}</h3>
                                            <p className="text-[9px] font-medium text-slate-400 font-mono tracking-tighter">{selectedEvent.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source IP</h5>
                                            <p className="text-[11px] font-mono text-slate-900">{selectedEvent.source_ip}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</h5>
                                            <p className="text-[11px] font-mono text-slate-900">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Privacy Alert */}
                                    <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex gap-3">
                                        <ShieldCheck className="text-indigo-600 shrink-0" size={18} />
                                        <div>
                                            <h5 className="text-[10px] font-black text-indigo-900 uppercase">PII Guard Active</h5>
                                            <p className="text-[9px] text-indigo-700 font-medium leading-relaxed">Sensitive fields (Email, Phone) were SHA-256 hashed on the proxy server before being displayed here.</p>
                                        </div>
                                    </div>

                                    {/* Raw Payload Inspector */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Event JSON Payload</h4>
                                            <span className="text-[9px] font-bold text-slate-400 capitalize">Read-only Stream</span>
                                        </div>
                                        <pre className="p-6 bg-slate-900 text-indigo-300 rounded-[2rem] text-[10px] font-mono leading-relaxed overflow-x-auto border-4 border-slate-800 shadow-xl">
                                            {JSON.stringify(selectedEvent.payload, null, 2)}
                                        </pre>
                                    </div>

                                    {/* Action Suggestions */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Diagnostic Context</h4>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                            <Globe className="text-slate-400 mt-0.5" size={14} />
                                            <div>
                                                <h6 className="text-[10px] font-black text-slate-900 uppercase">Origin Validation</h6>
                                                <p className="text-[9px] text-slate-500 font-medium">Valid server-side request from sidecar node.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default EventDebugger;
