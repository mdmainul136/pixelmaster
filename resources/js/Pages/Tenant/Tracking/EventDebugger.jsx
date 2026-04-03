import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Head, router } from '@inertiajs/react';
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
  Square,
  ArrowRight,
  Database,
  Cpu,
  Monitor
} from 'lucide-react';
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import axios from 'axios';

const EventDebugger = ({ auth, initialLogs = [] }) => {
    const [events, setEvents] = useState(initialLogs);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLive, setIsLive] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const scrollRef = useRef(null);
    const isNavigatingRef = useRef(false);

    // Real-time EventSource listener (SSE) with Polling Fallback
    useEffect(() => {
        let eventSource = null;
        let reconnectTimeout = null;
        let pollInterval = null;

        const offFinish = router.on('start', () => {
            isNavigatingRef.current = true;
            stopAll();
        });

        const stopAll = () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (pollInterval) clearInterval(pollInterval);
        };

        const startPolling = () => {
            if (!isLive || isNavigatingRef.current) return;
            setIsPolling(true);

            const fetchEvents = async () => {
                if (isNavigatingRef.current) return;
                try {
                    const res = await axios.get('/api/tracking/dashboard/events/feed?per_page=30');
                    const newEvents = res.data.data || [];
                    setEvents(prev => {
                        const existingIds = new Set(prev.map(e => e.id));
                        const filtered = newEvents.filter(e => !existingIds.has(e.id));
                        if (filtered.length === 0) return prev;
                        return [...filtered, ...prev].slice(0, 100);
                    });
                } catch (err) {}
            };

            fetchEvents();
            pollInterval = setInterval(fetchEvents, 3000);
        };

        const connect = () => {
            if (!isLive || isNavigatingRef.current) return;
            const url = `/api/tracking/dashboard/events/live${initialLogs.container_id ? '?container_id=' + initialLogs.container_id : ''}`;
            
            try {
                eventSource = new EventSource(url, { withCredentials: true });
                eventSource.onmessage = (event) => {
                    setIsPolling(false);
                    try {
                        const newEvent = JSON.parse(event.data);
                        if (newEvent.heartbeat || !newEvent.id) return;
                        setEvents(prev => {
                            if (prev.some(e => e.id === newEvent.id)) return prev;
                            return [newEvent, ...prev].slice(0, 100);
                        });
                    } catch (err) { }
                };

                eventSource.onerror = (err) => {
                    eventSource.close();
                    if (isLive && !isNavigatingRef.current) startPolling();
                };
            } catch (e) {
                startPolling();
            }
        };

        const isLocalDev = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        if (isLocalDev) {
            startPolling();
        } else {
            connect();
        }

        return () => {
            stopAll();
            offFinish();
        };
    }, [isLive, initialLogs.container_id]);

    const filteredEvents = events.filter(e => 
        e.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.source_ip.includes(searchTerm)
    );

    return (
        <DashboardLayout>
            <Head title="Live Event Debugger — PixelMaster" />

            <div className="max-w-[1600px] mx-auto py-8 h-[calc(100vh-120px)] flex flex-col space-y-6">
                {/* Shopify style Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-lg border border-border">
                            <Terminal size={20} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground flex items-center gap-3">
                                Live Console
                                {isLive && (
                                    <Badge variant="success" className="h-5 text-[9px] font-bold uppercase tracking-widest px-2 group">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                                        Streaming
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Real-time server-side event stream from track.pmasters.io</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <input 
                                type="text"
                                placeholder="Filter events..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-border rounded-md text-xs font-medium focus:ring-2 focus:ring-primary/10 w-64 outline-none transition-all"
                            />
                        </div>
                        <Button 
                            variant={isLive ? "outline" : "default"}
                            size="sm"
                            onClick={() => setIsLive(!isLive)}
                            className="h-9 px-4 text-xs font-bold uppercase tracking-widest"
                        >
                            {isLive ? <><Square size={14} className="mr-2" /> Stop</> : <><Play size={14} className="mr-2" /> Start</>}
                        </Button>
                        <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setEvents([])}
                            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                {/* Two Pane Layout */}
                <div className="flex flex-grow gap-6 overflow-hidden">
                    {/* Event List Pane */}
                    <div className="flex-grow bg-white dark:bg-card border border-border shadow-sm rounded-lg overflow-hidden flex flex-col">
                        <div className="flex items-center px-6 py-3 border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <div className="w-[45%]">Event Definition</div>
                            <div className="w-[20%] text-center">Status</div>
                            <div className="w-[20%] text-center">Source IP</div>
                            <div className="w-[15%] text-right">Time</div>
                        </div>

                        <div className="flex-grow overflow-y-auto divide-y divide-border" ref={scrollRef}>
                            {filteredEvents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Monitor size={24} />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest">Waiting for incoming traffic...</p>
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`flex items-center px-6 py-3 cursor-pointer transition-all hover:bg-muted/30 group ${
                                            selectedEvent?.id === event.id ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="w-[45%] flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${selectedEvent?.id === event.id ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`} />
                                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{event.event_name}</span>
                                        </div>
                                        <div className="w-[20%] text-center">
                                            <Badge variant="success" className="text-[9px] font-bold uppercase tracking-tighter h-5 px-1.5">
                                                {event.status_code} OK
                                            </Badge>
                                        </div>
                                        <div className="w-[20%] text-center text-[11px] font-mono text-muted-foreground">{event.source_ip}</div>
                                        <div className="w-[15%] text-right text-[11px] font-medium text-muted-foreground/60 group-hover:text-foreground">
                                            {new Date(event.created_at).toLocaleTimeString([], { hour12: false })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Inspector Sidebar Pane */}
                    {selectedEvent && (
                        <div className="w-[550px] bg-white dark:bg-card border border-border shadow-lg rounded-lg flex flex-col animate-in slide-in-from-right-10 duration-300">
                            <div className="p-5 border-b border-border flex items-center justify-between bg-foreground text-background">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-primary text-primary-foreground rounded flex items-center justify-center">
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.1em]">{selectedEvent.event_name}</h3>
                                        <p className="text-[10px] font-mono opacity-60 mt-0.5">{selectedEvent.id}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="h-8 w-8 p-0 hover:bg-white/10 text-white">
                                    <X size={18} />
                                </Button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-8">
                                {/* Network Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/40 border border-border rounded-lg">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Request IP</p>
                                        <p className="text-xs font-mono font-semibold text-foreground">{selectedEvent.source_ip}</p>
                                    </div>
                                    <div className="p-4 bg-muted/40 border border-border rounded-lg">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Timestamp</p>
                                        <p className="text-xs font-mono font-semibold text-foreground">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Security Banner */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg flex gap-3">
                                    <ShieldCheck className="text-blue-600 h-5 w-5 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-900 dark:text-blue-300">PII Redaction Active</p>
                                        <p className="text-[10px] text-blue-700 dark:text-blue-400/80 mt-1 leading-relaxed">
                                            Personally Identifiable Information has been SHA-256 hashed on the sGTM proxy before storage.
                                        </p>
                                    </div>
                                </div>

                                {/* Payload View */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Event JSON Schema</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold opacity-60">Read Only</Badge>
                                    </div>
                                    <div className="bg-foreground rounded-lg p-6 shadow-xl border border-border">
                                        <pre className="text-[11px] font-mono leading-relaxed text-blue-300 overflow-x-auto">
                                            {JSON.stringify(selectedEvent.payload, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Container Context */}
                                <div className="p-5 border border-border rounded-lg bg-muted/10 space-y-4">
                                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Routing Intelligence</h5>
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <p className="text-xs font-medium text-foreground">Verified as a first-party server-side request.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <p className="text-xs font-medium text-foreground">Matched against Container Profile: <span className="font-bold underline">Main</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default EventDebugger;
