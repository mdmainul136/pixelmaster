/**
 * ContainersPage — sGTM Container Management
 * Design: dashboard-builder-main pattern (rounded-2xl cards, MetricCard style)
 * API: GET /api/tracking/containers, POST /api/tracking/containers
 */
import { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  Server, Plus, Activity, Shield, MoreHorizontal, Play, Square,
  Globe, CheckCircle2, XCircle, Clock, AlertTriangle, Trash2,
  Rocket, Settings, ExternalLink, Copy, RefreshCcw, Zap, BarChart3
} from "lucide-react";
import { toast } from "sonner";

const fetchContainers = async (tenantId?: string) => {
  const url = `/api/tracking/dashboard/containers${tenantId ? `?tenant_id=${tenantId}` : ""}`;
  const { data } = await axios.get(url);
  return data.containers ?? [];
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  running:   { icon: CheckCircle2, color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Running" },
  deployed:  { icon: CheckCircle2, color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Deployed" },
  stopped:   { icon: Square,       color: "text-muted-foreground",    bg: "bg-muted/30",              label: "Stopped" },
  pending:   { icon: Clock,        color: "text-[hsl(38,92%,50%)]",  bg: "bg-[hsl(38,92%,50%)]/10",  label: "Pending" },
  error:     { icon: XCircle,      color: "text-destructive",         bg: "bg-destructive/10",         label: "Error" },
  provisioned: { icon: CheckCircle2, color: "text-primary",           bg: "bg-primary/10",             label: "Provisioned" },
};

const ContainersPage = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newConfig, setNewConfig] = useState("");
  const [serverLocation, setServerLocation] = useState("global");
  const [deploymentType, setDeploymentType] = useState("docker");
  const [selectedPlan, setSelectedPlan] = useState<string>("starter");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Snippet Modal State
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [activeSnippetContainer, setActiveSnippetContainer] = useState<any>(null);
  const [snippetData, setSnippetData] = useState<any>(null);
  const [snippetLoading, setSnippetLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const openSnippetModal = async (container: any) => {
    setActiveSnippetContainer(container);
    setSnippetModalOpen(true);
    setSnippetLoading(true);
    try {
      const { data } = await axios.get(`/api/tracking/snippet`);
      setSnippetData(data);
    } catch {
      toast.error("Failed to fetch container snippet configuration");
    } finally {
      setSnippetLoading(false);
    }
  };

  const { props } = usePage();
  const pageProps = props as any;
  const activeTenantId = pageProps.active_container_id;

  const { data: containers = [], isLoading, error } = useQuery({
    queryKey: ["tracking-containers", activeTenantId],
    queryFn: () => fetchContainers(activeTenantId),
    retry: false,
  });

  const isLocked = (error as any)?.response?.status === 402;

  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/subscriptions/plans");
      return data.data;
    },
  });

  const handleCreateOrPay = async () => {
    if (selectedPlan !== 'starter' || isLocked) {
      setPaymentLoading(true);
      try {
        const { data } = await axios.post("/api/v1/payment/checkout", {
          plan_slug: selectedPlan,
          subscription_type: 'monthly',
          token_tenant_id: activeTenantId
        });
        if (data.success && data.data.url) {
          window.location.href = data.data.url;
          return;
        }
      } catch (err) {
        toast.error("Failed to initiate payment. Please try again.");
      } finally {
        setPaymentLoading(false);
      }
      return;
    }
    createMutation.mutate();
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/tracking/containers", {
        name: newName,
        container_config: newConfig,
        server_location: serverLocation,
        deployment_type: deploymentType,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      setShowCreate(false);
      setNewName("");
      setNewConfig("");
      setServerLocation("global");
      toast.success("Container created successfully!");
    },
    onError: () => toast.error("Failed to create container"),
  });

  const deployMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/api/tracking/containers/${id}/deploy`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      toast.success("Deployment triggered");
    },
    onError: () => toast.error("Deployment failed"),
  });

  const provisionAnalyticsMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post(`/api/tracking/containers/${id}/provision-analytics`);
    },
    onSuccess: () => toast.success("Analytics provisioning started!"),
    onError: () => toast.error("Analytics provisioning failed"),
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/tracking/dashboard/health/sync");
    },
    onSuccess: () => toast.success("Infrastructure mappings synchronized successfully!"),
    onError: () => toast.error("Infrastructure sync failed"),
  });

  if (isLocked) {
    return (
      <DashboardLayout>
        <div className="shopify-card p-12 text-center bg-slate-50 border-destructive/20 shadow-none mt-8">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Account Suspended</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-sm leading-relaxed">
            Your tracking infrastructure is currently inactive. Please select a plan to restore your global server nodes and event processing.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plansData?.map((plan: any) => (
              <div 
                key={plan.id}
                className={`shopify-card p-8 transition-all cursor-pointer flex flex-col relative ${
                  selectedPlan === plan.plan_key 
                    ? "border-accent ring-1 ring-accent bg-accent/5 shadow-sm" 
                    : "bg-white hover:border-slate-400"
                }`}
                onClick={() => setSelectedPlan(plan.plan_key)}
              >
                <h4 className="text-lg font-bold mb-1 uppercase tracking-tight flex items-center justify-between">
                  {plan.name}
                  {selectedPlan === plan.plan_key && <CheckCircle2 className="h-4 w-4 text-accent" />}
                </h4>
                <div className="text-3xl font-black mb-6">
                  ${parseFloat(plan.price_monthly).toFixed(0)}
                  <span className="text-xs font-bold text-muted-foreground ml-1.5 uppercase">/ mo</span>
                </div>
                <div className="flex-1 space-y-3 mb-8 text-left border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                    <Server className="h-4 w-4 text-accent" />
                    {plan.quotas?.containers === -1 ? "Unlimited" : plan.quotas?.containers} Containers
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                    <Activity className="h-4 w-4 text-accent" />
                    {plan.quotas?.events?.toLocaleString()} Events / mo
                  </div>
                </div>
                <Button 
                  className={`w-full rounded-lg font-bold ${selectedPlan === plan.plan_key ? 'bg-accent hover:bg-accent/90' : ''}`}
                  variant={selectedPlan === plan.plan_key ? "default" : "outline"}
                  onClick={() => handleCreateOrPay()}
                  disabled={paymentLoading && selectedPlan === plan.plan_key}
                >
                  {paymentLoading && selectedPlan === plan.plan_key ? "Processing..." : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Active Containers</h2>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => syncMutation.mutate()} 
                className="text-[11px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1.5"
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                Refresh Infrastructure
              </button>
            </div>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} className="rounded-lg font-bold px-6 shadow-sm">
            {showCreate ? "Cancel" : "Add Container"}
          </Button>
        </div>

        {showCreate && (
          <div className="shopify-card p-8 bg-slate-50/50 shadow-none border-dashed animate-in slide-in-from-top-4 duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Container Identity</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Master GTM (Production)"
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">GTM Configuration (ID)</label>
                  <input
                    type="text"
                    value={newConfig}
                    onChange={(e) => setNewConfig(e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Edge Server Region</label>
                  <select
                    value={serverLocation}
                    onChange={(e) => setServerLocation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="global">Auto (Nearest Node)</option>
                    <option value="us">United States (Standard)</option>
                    <option value="eu">Europe (GDPR Optimized)</option>
                    <option value="asia">Asia (Singapore)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Infrastructure Capacity</label>
                  <select
                    value={deploymentType}
                    onChange={(e) => setDeploymentType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="docker">Single VPS (Standard)</option>
                    <option value="kubernetes">Auto-scaling Cluster (High Traffic)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <label className="text-[11px] font-black uppercase tracking-widest text-primary mb-4 block">Select Network Plan</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plansData?.map((plan: any) => (
                    <div 
                      key={plan.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedPlan === plan.plan_key 
                          ? "border-accent bg-accent/5 ring-1 ring-accent" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedPlan(plan.plan_key)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{plan.name}</span>
                        {selectedPlan === plan.plan_key && <CheckCircle2 className="h-3 w-3 text-accent" />}
                      </div>
                      <div className="text-lg font-black">${parseFloat(plan.price_monthly).toFixed(0)}</div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{plan.quotas?.events?.toLocaleString()} Monthly Events</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-8">
                <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-xs font-bold uppercase tracking-widest">Discard</Button>
                <Button 
                  onClick={() => handleCreateOrPay()} 
                  disabled={!newName || createMutation.isPending || paymentLoading} 
                  className="rounded-lg px-8 font-bold shadow-md h-11"
                >
                  {createMutation.isPending || paymentLoading ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {selectedPlan === 'starter' ? "Create Container" : "Authorize & Provision"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Container Grid */}
        {containers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {containers.map((container: any) => {
              const status = statusConfig[container.deploy_status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div
                  key={container.id}
                  className="shopify-card group hover:border-slate-400 transition-all duration-200 flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary border border-border">
                          <Server className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{container.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{container.container_id || "Provisioned"}</span>
                        </div>
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${status.bg} ${status.color} border border-current opacity-80`}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-100">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Today's Traffic</div>
                        <div className="text-lg font-black tabular-nums">{container.events_today?.toLocaleString() ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Connections</div>
                        <div className="text-lg font-black tabular-nums">{container.destinations ?? 0}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2 truncate">
                      <Globe className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate">{container.transport_url || "Configuring subdomain..."}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 border-t border-border flex items-center gap-2 rounded-b-xl">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-md text-[11px] font-bold uppercase border-slate-300 hover:bg-white shadow-none"
                      onClick={() => openSnippetModal(container)}
                    >
                      Installation
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-md text-[11px] font-bold uppercase border-slate-300 hover:bg-white shadow-none"
                      onClick={() => provisionAnalyticsMutation.mutate(container.id)}
                      disabled={provisionAnalyticsMutation.isPending}
                    >
                      {provisionAnalyticsMutation.isPending ? <RefreshCcw className="h-3 w-3 animate-spin" /> : "Sync"}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-md px-3 bg-primary"
                      asChild
                    >
                      <a href={`/containers/${container.id}/settings`}>
                        <Settings className="h-3.5 w-3.5 text-white" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="shopify-card p-20 text-center border-dashed border-2 bg-slate-50/50 shadow-none">
            <Server className="mx-auto h-12 w-12 text-slate-300 mb-6" />
            <h3 className="text-xl font-bold text-foreground">Build your tracking engine</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Deploy your first sGTM server-side container to start collecting 1st-party data globally.
            </p>
            <Button onClick={() => setShowCreate(true)} className="mt-8 px-10 font-bold shadow-md rounded-lg">
              Start Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Installation Snippet Modal — Clean White Style */}
      {snippetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-primary shadow-sm">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Container Installation</h3>
                  <p className="text-xs font-medium text-muted-foreground">Standard 1st-party telemetry snippet.</p>
                </div>
              </div>
              <button 
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors" 
                onClick={() => setSnippetModalOpen(false)}
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              {snippetLoading ? (
                <div className="flex py-12 items-center justify-center flex-col gap-4">
                  <RefreshCcw className="h-10 w-10 animate-spin text-accent" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Provisioning secure snippet...</p>
                </div>
              ) : snippetData ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                        Phase 1: Header Deployment
                      </p>
                      <button 
                        className="text-xs font-black text-accent hover:underline flex items-center gap-1.5"
                        onClick={() => copyToClipboard(snippetData.gtm_snippet, 'gtm')}
                      >
                         {copiedScript === 'gtm' ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                         {copiedScript === 'gtm' ? 'Success' : 'Copy'}
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="rounded-lg border border-slate-200 bg-slate-800 p-5 overflow-x-auto shadow-inner text-[11px] leading-relaxed text-emerald-400 font-mono">
                        {snippetData.gtm_snippet}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                        Phase 2: Body Fallback
                      </p>
                      <button 
                        className="text-xs font-black text-accent hover:underline flex items-center gap-1.5"
                        onClick={() => copyToClipboard(snippetData.gtm_noscript, 'noscript')}
                      >
                         {copiedScript === 'noscript' ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                         {copiedScript === 'noscript' ? 'Success' : 'Copy'}
                      </button>
                    </div>
                    <pre className="rounded-lg border border-slate-200 bg-slate-800 p-5 overflow-x-auto shadow-inner text-[11px] leading-relaxed text-amber-300 font-mono">
                      {snippetData.gtm_noscript}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <h5 className="text-[11px] font-black uppercase text-accent mb-1 tracking-widest">Enhanced Privacy</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">Encrypted 1st-party cookie resolution active for this container path.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <h5 className="text-[11px] font-black uppercase text-foreground mb-1 tracking-widest">Browser Optimized</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">Compressed JS delivery for 95+ Pagespeed performance.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Configuration Mismatch</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 px-8 py-5 flex justify-end border-t border-slate-200">
              <Button onClick={() => setSnippetModalOpen(false)} className="rounded-lg px-8 font-bold">Complete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ContainersPage;
