import React, { useState } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Head, router, Link } from '@inertiajs/react';
import { 
  Cloud, 
  Users, 
  RefreshCcw, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Target,
  Facebook,
  Globe,
  Plus,
  Rocket,
  BrainCircuit,
  Activity
} from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";

const AudienceSync = ({ sync_status = [], available_platforms = [], segments = [] }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(available_platforms[0]);
    const [selectedSegment, setSelectedSegment] = useState(segments[0]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { data } = await axios.post(route('user.sgtm.audience-sync.trigger'), {
                segment: selectedSegment,
                platform: selectedPlatform
            });
            
            if (data.success) {
                toast.success(data.message);
                router.reload({ preserveScroll: true });
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Audience sync failed. Please check API configuration.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Audience Sync — PixelMaster" />

            <div className="max-w-6xl mx-auto py-10 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Audience Synchronization</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Push segments from CDP directly to Ad Platform Custom Audiences.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-9 px-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold flex items-center gap-2">
                             <ShieldCheck size={14} className="animate-pulse" /> Privacy-Safe Hashing Active
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Interactive Selection Side */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-6">
                            <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                <Rocket size={16} className="text-primary" /> Sync Engine
                            </h3>
                            
                            <div className="space-y-8">
                                {/* Platform Tabs */}
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Select Destination</label>
                                    <div className="flex p-1 bg-muted rounded-lg w-full">
                                        {available_platforms.map(p => (
                                            <button 
                                                key={p}
                                                onClick={() => setSelectedPlatform(p)}
                                                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                                                    selectedPlatform === p 
                                                    ? 'bg-white text-primary shadow-sm' 
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Segment Selection */}
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Source Segment</label>
                                    <div className="space-y-2">
                                        {segments.map(s => (
                                            <div 
                                                key={s} 
                                                onClick={() => setSelectedSegment(s)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between group ${
                                                    selectedSegment === s 
                                                    ? 'border-primary bg-primary/5' 
                                                    : 'border-border hover:border-border-hover bg-card'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${selectedSegment === s ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                                    <span className={`text-xs font-bold ${selectedSegment === s ? 'text-primary' : 'text-foreground'}`}>{s}</span>
                                                </div>
                                                <Users size={14} className={selectedSegment === s ? 'text-primary' : 'text-muted-foreground opacity-30'} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <Button 
                                        onClick={handleSync}
                                        disabled={isSyncing}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isSyncing ? (
                                            <div className="flex items-center gap-3">
                                                <RefreshCcw size={16} className="animate-spin" />
                                                Synchronizing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Zap size={16} fill="currentColor" />
                                                Push to {selectedPlatform}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-5">
                            <div className="flex items-start gap-3 text-amber-800">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <p className="text-[10px] font-medium leading-relaxed">
                                    <span className="font-bold">Manual Sync Mode:</span> Real-time automated sync is locked for your current plan. <Link href="/settings/plans" className="underline font-bold">Upgrade now</Link>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Active Status & History */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg overflow-hidden">
                            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-semibold text-foreground">Sync Health & History</h3>
                                    <Badge variant="outline" className="text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50">API Connected</Badge>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.reload({ preserveScroll: true })}
                                    className="h-8 text-muted-foreground flex items-center gap-2 px-3 hover:bg-muted"
                                >
                                    <RefreshCcw size={12} className={isSyncing ? 'animate-spin' : ''} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Refresh Feed</span>
                                </Button>
                            </div>

                            <div className="divide-y divide-border">
                                {sync_status.length > 0 ? sync_status.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-muted/5 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors">
                                                {item.platform === 'Facebook' ? <Facebook size={22} className="text-blue-600" /> : <Globe size={22} className="text-muted-foreground/60" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-bold text-foreground">{item.segment}</h4>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'Synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                                                    <Badge variant={item.status === 'Synced' ? 'success' : 'warning'} className="text-[9px] py-0 h-5 px-2 font-bold uppercase tracking-wider">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1.5">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Users size={12} /> {item.count} Identifiers
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 border-l border-border pl-4">
                                                        <Activity size={12} /> Priority High
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">{item.last_sync}</p>
                                            <Button variant="link" className="text-[11px] font-bold p-0 h-auto mt-1 text-primary">
                                                Audience Report <ChevronRight size={12} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-16 text-center">
                                        <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-border">
                                            <Cloud size={28} className="text-muted-foreground/30" />
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground">No Sync Pipelines Found</h4>
                                        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                                            Connect your CDP segments to ad platforms to start building high-ROAS lookalike audiences.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pro Features Callout */}
                        <div className="mt-8 bg-blue-900 rounded-lg p-6 text-white relative overflow-hidden group shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-24 bg-blue-400/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                                        <BrainCircuit size={24} className="text-blue-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-tight">Activate AI Predictive Sync</p>
                                        <p className="text-xs text-blue-200 mt-1 opacity-80 leading-relaxed max-w-md">
                                            Automatically trigger syncs when user's LTV or churn risk category changes based on Gemini analysis.
                                        </p>
                                    </div>
                                </div>
                                <Button className="bg-white hover:bg-blue-50 text-blue-900 font-bold h-10 px-6 text-[10px] uppercase tracking-[0.1em] shadow-lg">
                                    Unlock Pro
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AudienceSync;
