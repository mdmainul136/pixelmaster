import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import { useFeature } from "@/lib/useFeature";
import {
  Zap, Shield, Bug, MousePointer, Fingerprint, Globe, Eye,
  Code, RefreshCcw, Lock, CheckCircle2, Sparkles, Cpu, Layers,
  Phone, Clock, Activity, BarChart3, Star, Table, Target, Users, Cloud,
  ShieldOff, Calendar, ShoppingCart, ShoppingBag, LayoutGrid, X, List, Database,
  ArrowRight, Settings2, Sparkle, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { usePage, Head } from "@inertiajs/react";

const iconComponentMap: Record<string, any> = {
  globe: Globe, zap: Zap, "bar-chart-3": BarChart3, fingerprint: Fingerprint,
  "file-text": Activity, shield: Shield, "brain-circuit": Sparkles, layers: Layers,
  activity: Activity, table: Table, code: Code, target: Target, users: Users,
  cloud: Cloud, "shield-off": ShieldOff, calendar: Calendar, clock: Clock,
  "shopping-cart": ShoppingCart, "shopping-bag": ShoppingBag,
  "mouse-pointer": MousePointer, bug: Bug, list: List, database: Database
};

const categoryMap: Record<string, string> = {
  all: "All Apps",
  tracking: "Core Tracking",
  connectivity: "Connectivity",
  infrastructure: "Advanced Infrastructure",
  integration: "External Integrations"
};

const PowerUpsPage = () => {
  const { auth } = usePage<any>().props;
  const { hasFeature, plan, requiredPlanLabel } = useFeature();
  const queryClient = useQueryClient();
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
  const [enabledPowerUps, setEnabledPowerUps] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("all");

  const { data: containers = [] } = useQuery({ 
      queryKey: ["tracking-containers"], 
      queryFn: async () => {
          const { data } = await axios.get("/api/tracking/dashboard/containers");
          return data.containers ?? [];
      } 
  });

  const { data: registry = [] } = useQuery({ 
      queryKey: ["power-up-registry"], 
      queryFn: async () => {
          const { data } = await axios.get("/api/tracking/power-ups");
          return data.data ?? [];
      }
  });

  // Auto-select first container if none selected
  useEffect(() => {
    if (containers.length > 0 && selectedContainer === null) {
        setSelectedContainer(containers[0].id);
    }
  }, [containers]);

  useEffect(() => {
    if (selectedContainer) {
        const container = containers.find((c: any) => c.id === selectedContainer);
        if (container && container.power_ups) {
            const enabled: Record<string, boolean> = {};
            container.power_ups.forEach((key: string) => enabled[key] = true);
            setEnabledPowerUps(enabled);
        } else {
            setEnabledPowerUps({});
        }
    }
  }, [selectedContainer, containers]);

  const filteredPowerUps = useMemo(() => {
      if (activeTab === "all") return registry;
      return registry.filter((pu: any) => pu.category === activeTab);
  }, [registry, activeTab]);

  const togglePowerUp = (id: string) => {
    setEnabledPowerUps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const power_ups = Object.keys(enabledPowerUps).filter(key => enabledPowerUps[key]);
      await axios.put(`/api/tracking/containers/${selectedContainer}/power-ups`, { power_ups });
    },
    onSuccess: () => {
      toast.success("Extension settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("Failed to save store settings"),
  });

  return (
    <DashboardLayout>
      <Head title="App Store — PixelMaster" />

      <div className="max-w-7xl mx-auto py-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">PixelMaster Extensions</h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                    Enhance your server-side tracking with powerful add-ons and integrations.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Selected Container</label>
                    <div className="relative group">
                        <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <select
                            value={selectedContainer ?? ""}
                            onChange={(e) => setSelectedContainer(Number(e.target.value) || null)}
                            className="w-full bg-white dark:bg-card border border-border rounded-md pl-10 pr-10 py-2.5 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all cursor-pointer appearance-none shadow-sm"
                        >
                            <option value="">Select a container...</option>
                            {containers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none rotate-90" />
                    </div>
                </div>
                
                <div className="pt-5 md:pt-4">
                    <Button 
                        onClick={() => saveMutation.mutate()} 
                        disabled={saveMutation.isPending || !selectedContainer} 
                        className="bg-primary text-primary-foreground font-bold text-xs h-11 px-8 uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {saveMutation.isPending ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <Settings2 className="h-4 w-4 mr-2" />}
                        Apply Changes
                    </Button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Nav Sidebar */}
            <div className="md:col-span-1 space-y-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-4">Categories</p>
                    <div className="flex flex-col space-y-0.5">
                        {Object.entries(categoryMap).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === key 
                                    ? "bg-primary/5 text-primary" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Sparkle size={16} fill="currentColor" />
                        <span className="text-xs font-bold uppercase tracking-widest">Free Plan</span>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                        Standard server-side events are included. Advanced AI and Attribution require a Pro plan.
                    </p>
                    <button className="text-[10px] font-black text-blue-900 border-b border-blue-900 mt-4 uppercase tracking-widest">
                        View Upgrade Options
                    </button>
                </div>
            </div>

            {/* Apps Grid */}
            <div className="md:col-span-3">
                {!selectedContainer ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 border border-dashed border-border rounded-lg">
                        <Database className="h-10 w-10 text-muted-foreground/30 mb-4" />
                        <h3 className="text-sm font-semibold text-foreground">Select a Tracking Container</h3>
                        <p className="text-xs text-muted-foreground mt-1">Please choose a container from the top to manage its extensions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredPowerUps.length > 0 ? filteredPowerUps.map((pu: any) => {
                            const Icon = iconComponentMap[pu.icon] || Sparkles;
                            const isEnabled = enabledPowerUps[pu.id] ?? false;

                            return (
                                <div
                                    key={pu.id}
                                    className={`group bg-white dark:bg-card border rounded-lg transition-all duration-200 ${
                                        isEnabled ? "border-primary shadow-sm shadow-primary/5" : "border-border shadow-sm hover:border-border-hover/80"
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center shadow-md ${
                                                isEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                <Icon size={24} />
                                            </div>
                                            
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isEnabled} 
                                                    onChange={() => togglePowerUp(pu.id)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[15px] font-semibold text-foreground">{pu.name}</h4>
                                                {isEnabled && (
                                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                                                {pu.description || "Extend your sGTM capabilities with this server-side module."}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="px-6 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {isEnabled ? 'Status: Active' : 'Status: Off'}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary">
                                            Setup <ArrowRight size={12} className="ml-1.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        }) : (
                             <div className="col-span-full py-20 text-center text-muted-foreground">
                                <p className="text-sm">No extensions found in this category.</p>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PowerUpsPage;

