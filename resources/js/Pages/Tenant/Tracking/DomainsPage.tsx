/**
 * DomainsPage — 3-Case Tracking Domain Setup
 * Design: dashboard-builder-main pattern
 * API: POST /api/tracking/containers/{id}/setup-domain, GET /api/tracking/suggest-domain
 */
import { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  Globe, CheckCircle2, Clock, XCircle, Copy, ExternalLink,
  Shield, Zap, ArrowRight, AlertTriangle, Server, RefreshCcw, Info, Lock
} from "lucide-react";
import { toast } from "sonner";

const fetchContainers = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/containers");
    return data.containers ?? [];
  } catch { return []; }
};

type DomainCase = "saas" | "custom" | "existing";

const caseConfig = {
  saas: {
    title: "SaaS Auto Domain",
    desc: "Instant setup — track.{tenant}.yoursaas.com",
    icon: Zap,
    badge: "Instant",
    badgeClass: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]",
    recommended: false,
  },
  custom: {
    title: "Custom Domain",
    desc: "First-party cookies — track.yourdomain.com",
    icon: Shield,
    badge: "Recommended",
    badgeClass: "bg-primary/10 text-primary",
    recommended: true,
  },
  existing: {
    title: "Existing Subdomain",
    desc: "Use your existing subdomain path /track",
    icon: Globe,
    badge: "Not Recommended",
    badgeClass: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]",
    recommended: false,
  },
};

const DomainsPage = () => {
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState<DomainCase | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<number | null>(null);
  const [customDomain, setCustomDomain] = useState("");

  const { data: containers = [] } = useQuery({
    queryKey: ["tracking-containers"],
    queryFn: fetchContainers,
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { case: selectedCase };
      if (selectedCase === "custom") payload.domain = customDomain;
      const { data } = await axios.post(`/api/tracking/containers/${selectedContainer}/setup-domain`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      toast.success("Domain configured successfully!");
      if (data?.dns_instructions) {
        toast.info("Add the DNS records shown below to complete setup");
      }
    },
    onError: () => toast.error("Domain setup failed"),
  });

  const verifyMutation = useMutation({
    mutationFn: async (domain: string) => {
      const { data } = await axios.post(`/api/v1/domains/${domain}/verify`);
      return data;
    },
    onSuccess: (data: any) => {
      if (data.success) toast.success(data.message || "Verification passed!");
      else toast.warning(data.message || "DNS verification is still pending.");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("DNS verification check failed."),
  });

  const oneClickMutation = useMutation({
    mutationFn: async (domain: string) => {
      const { data } = await axios.post(`/api/v1/domains/${domain}/one-click-setup`);
      return data;
    },
    onSuccess: (data: any) => {
      if (data.success) toast.success("One-Click setup complete!");
      else toast.error("One-Click setup failed.");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("Failed to connect to Domain Provider."),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tracking Domains</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure first-party tracking domains for your containers
          </p>
        </div>

        {/* Domain Case Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(caseConfig) as [DomainCase, typeof caseConfig.saas][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedCase === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCase(key)}
                className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card hover:border-border"
                }`}
              >
                {cfg.recommended && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                    Recommended
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                    isSelected
                      ? "bg-primary/15 text-primary"
                      : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-card-foreground">{cfg.title}</h3>
                      <Badge className={`text-[9px] ${cfg.badgeClass}`}>{cfg.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Setup Form */}
        {selectedCase && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in">
            <h3 className="text-base font-semibold text-card-foreground mb-4">
              Configure {caseConfig[selectedCase].title}
            </h3>

            {/* Container Selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Container</label>
              <select
                value={selectedContainer ?? ""}
                onChange={(e) => setSelectedContainer(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Choose a container...</option>
                {containers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Custom Domain Input */}
            {selectedCase === "custom" && (
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Custom Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="track.yourdomain.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" /> You'll need to add a CNAME record pointing to our tracking server
                </p>
              </div>
            )}

            {/* DNS Instructions Preview */}
            {selectedCase === "custom" && customDomain && (
              <div className="mb-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <h4 className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> DNS Records Required
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 rounded-lg bg-background p-3">
                    <Badge variant="outline" className="text-[10px] font-mono w-16 justify-center">CNAME</Badge>
                    <div className="flex-1 text-xs font-mono text-muted-foreground">
                      <span className="text-card-foreground">{customDomain}</span>
                      <span className="mx-2">→</span>
                      <span>tracking.yoursaas.com</span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText("tracking.yoursaas.com"); toast.success("Copied!"); }} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedCase(null)} className="rounded-xl">Cancel</Button>
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={!selectedContainer || setupMutation.isPending || (selectedCase === "custom" && !customDomain)}
                className="rounded-xl gap-2"
              >
                {setupMutation.isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                Setup Domain
              </Button>
            </div>
          </div>
        )}

        {/* Domain Management Lists */}
        <div className="grid grid-cols-1 gap-6">
          {/* 1. Pending Verification Section */}
          {containers.filter((c: any) => c.domain && !c.is_verified).length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-sm animate-fade-in mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Pending Verification
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Action required: Update your DNS records to activate these domains.</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 text-[10px] uppercase font-black tracking-widest animate-pulse">
                  Verifying DNS Propagation
                </Badge>
              </div>
              
              <div className="space-y-6">
                {containers.filter((c: any) => c.domain && !c.is_verified).map((c: any) => (
                  <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-900 leading-none">{c.domain}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">{c.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 bg-white rounded-xl shadow-sm border-slate-200" onClick={() => oneClickMutation.mutate(c.domain)} disabled={oneClickMutation.isPending}>
                          {oneClickMutation.isPending ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 text-amber-500" />} One-Click Setup
                        </Button>
                        <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl shadow-sm" onClick={() => verifyMutation.mutate(c.domain)} disabled={verifyMutation.isPending}>
                          {verifyMutation.isPending ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />} Verify DNS
                        </Button>
                      </div>
                    </div>

                    {/* Step-by-Step Verification UI */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Step 1: DNS */}
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 1: DNS</span>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 animate-pulse">
                             <RefreshCcw className="h-3 w-3" />
                          </div>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mb-1">CNAME Connectivity</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Checking if {c.domain} points to sGTM server.</p>
                      </div>

                      {/* Step 2: SSL */}
                      <div className={`p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden opacity-60 bg-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 2: Security</span>
                          <Lock className="h-4 w-4 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mb-1">SSL Certificate</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Automatic issuance after DNS verification.</p>
                      </div>

                      {/* Step 3: Active */}
                      <div className="p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden opacity-60 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 3: Online</span>
                          <Zap className="h-4 w-4 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mb-1">Global Delivery</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Live traffic routing through Edge nodes.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CNAME Instruction */}
                      <div className="rounded-lg bg-background p-3 border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CNAME Record</span>
                          <Badge variant="outline" className="text-[9px] h-4">Required</Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-[11px] text-primary truncate">{c.cname_target}</code>
                          <button onClick={() => { navigator.clipboard.writeText(c.cname_target); toast.success("CNAME copied!"); }} className="p-1 hover:bg-accent rounded">
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>

                      {/* TXT Instruction (Verification Token) */}
                      {c.verification_token && (
                        <div className="rounded-lg bg-background p-3 border border-border/40">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TXT Verification</span>
                            <Badge variant="outline" className="text-[9px] h-4">Owner Check</Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-[11px] text-primary truncate">_verify.{c.domain}</code>
                            <button onClick={() => { navigator.clipboard.writeText(c.verification_token); toast.success("Token copied!"); }} className="p-1 hover:bg-accent rounded">
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Active Domains Section */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in">
            <h3 className="text-base font-semibold text-card-foreground mb-4">Active Tracking Domains</h3>
            {containers.filter((c: any) => c.is_verified).length > 0 ? (
              <div className="space-y-3">
                {containers.filter((c: any) => c.is_verified).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/40 p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] shadow-sm">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{c.domain || c.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                           <Server className="h-3 w-3" /> {c.deployment_type === 'shared' ? 'Shared Infra' : 'Dedicated'} • {c.deploy_status || 'Active'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Today's Traffic</span>
                        <span className="text-xs font-bold text-card-foreground">{c.events_today?.toLocaleString()} events</span>
                      </div>
                      <Badge className="bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[10px] px-2.5">Live</Badge>
                      <button onClick={() => { navigator.clipboard.writeText("https://" + (c.domain || c.transport_url)); toast.success("URL copied!"); }} className="rounded-lg p-2 hover:bg-accent transition-colors border border-border/40 bg-background shadow-xs">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                   <Globe className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground max-w-[240px]">
                  No active domains found. Setup a domain above to begin tracking.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DomainsPage;
