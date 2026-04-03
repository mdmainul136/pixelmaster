/**
 * Tenant Onboarding — sGTM Tracking Platform (PixelMaster-style)
 * Post-login 4-step wizard: Container → Domain → Embed Code → Complete
 *
 * API Endpoints Used:
 *   POST /api/tracking/containers              → Create container
 *   POST /api/tracking/containers/{id}/deploy  → Deploy sGTM stack
 *   GET  /api/tracking/containers/{id}/health  → Poll health
 *   POST /api/tracking/containers/{id}/setup-domain → Setup tracking domain
 *   GET  /api/tracking/snippet                 → Get embed code
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Badge } from "@Tenant/components/ui/badge";
import { Card, CardContent } from "@Tenant/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { 
  Building2, Globe, Shield, Zap, CheckCircle2, Copy, ExternalLink, 
  ArrowRight, ArrowLeft, Terminal, Loader2, Server, MapPin, 
  Cpu, Activity, Lock, Search, Code, Check, Info, Globe2,
  Rocket, AlertCircle, RefreshCw, ChevronDown, PartyPopper, CreditCard
} from "lucide-react";

/* ── Types ── */

type StepDef = { id: string; label: string; icon: React.ElementType };

const steps: StepDef[] = [
  { id: "deployment", label: "Deployment", icon: Server },
  { id: "finalize",   label: "Finalize",   icon: Zap },
];

/* ────────────────────────────────────────────────────── */
/*  Main Component                                       */
/* ────────────────────────────────────────────────────── */

export default function Onboarding() {
  const { auth, tenant } = usePage<any>().props;
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDir, setSlideDir] = useState<"forward" | "backward">("forward");
  const [isAnimating, setIsAnimating] = useState(false);

  /* Container state */
  const [containerName, setContainerName] = useState(tenant?.tenant_name + " — Primary" || "");
  const [gtmConfig, setGtmConfig] = useState("");
  const [serverLocation, setServerLocation] = useState(tenant?.country === "Ireland" ? "eu-west-1" : "global");
  const [deploymentType, setDeploymentType] = useState<"docker" | "kubernetes">("docker");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "running" | "success" | "error" | "deploying">("idle");

  const isPaidPlan = ["pro", "business", "enterprise"].includes((tenant?.plan || "").toLowerCase());
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");

  if (!tenant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
             <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
             <p className="text-sm text-muted-foreground">Initializing environment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ── Navigation ── */

  const animateStep = useCallback((next: number) => {
    setSlideDir(next > currentStep ? "forward" : "backward");
    setIsAnimating(true);
    setTimeout(() => { setCurrentStep(next); setIsAnimating(false); }, 150);
  }, [currentStep]);

  /* ── Step 1: Create & Deploy Container ── */

  const handleCreateContainer = async () => {
    if (!containerName) return;
    
    setIsDeploying(true);
    setDeployStatus("deploying");

    try {
      const response = await axios.post(`/api/tracking/containers`, {
        name: containerName,
        server_location: serverLocation,
        deployment_type: deploymentType,
        container_config: gtmConfig
      });

      if (response.data.success) {
        setDeployStatus("running");
        setIsDeploying(false);
        toast.success("Infrastructure provisioned successfully!");
        setTimeout(() => animateStep(1), 1000);
      }
    } catch (error) {
      setDeployStatus("error");
      setIsDeploying(false);
      toast.error("Failed to deploy container");
    }
  };

  /* ── Step 2: Handle Billing ── */

  const handlePayment = async () => {
    const toastId = toast.loading("Initiating secure checkout...");
    try {
      const { data } = await axios.post("/api/v1/billing/checkout", {
        plan_key: tenant.plan,
      });
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to start checkout session", { id: toastId });
    }
  };

  return (
    <DashboardLayout>
      <Head title="Setup Wizard — PixelMaster" />

      <div className="min-h-[calc(100vh-64px)] flex flex-col">
        {/* Step Indicator */}
        <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${
                        done ? "bg-emerald-500/15 text-emerald-500" :
                        active ? "bg-primary/15 text-primary shadow-sm shadow-primary/10" :
                        "bg-muted/60 text-muted-foreground"
                      }`}>
                        {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div className="hidden sm:block">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}>Step {i + 1}</p>
                        <p className={`text-sm font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                      </div>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px mx-6 ${done ? "bg-emerald-500/30" : "bg-border/60"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className={`w-full max-w-xl transition-all duration-300 ${
            isAnimating ? (slideDir === "forward" ? "opacity-0 -translate-x-6" : "opacity-0 translate-x-6") : "opacity-100 translate-x-0"
          }`}>

            {/* ═══ STEP 1: Deployment ═══ */}
            {steps[currentStep]?.id === "deployment" && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-foreground">Deploy Infrastructure</h1>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    We'll provision your isolated tagging server in the {serverLocation === 'global' ? 'USA' : 'Europe'} cluster.
                  </p>
                </div>

                <Card className="rounded-3xl border-border/60 shadow-xl shadow-primary/5 overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace Region</Label>
                        <div className="flex gap-2">
                          {["global", "eu-west-1"].map(loc => (
                            <button key={loc} onClick={() => setServerLocation(loc)}
                              className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                serverLocation === loc ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground"
                              }`}>
                              <Globe className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase">{loc === 'global' ? 'Global (US)' : 'Europe (IE)'}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provisioning Model</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setDeploymentType("docker")} 
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              deploymentType === "docker" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"
                            }`}>
                            <p className="text-sm font-bold">Isolated</p>
                            <p className="text-[9px] text-muted-foreground mt-1">Docker Standard</p>
                          </button>
                          <button onClick={() => setDeploymentType("kubernetes")} 
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              deploymentType === "kubernetes" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"
                            }`}>
                            <p className="text-sm font-bold">Elastic</p>
                            <p className="text-[9px] text-muted-foreground mt-1">High-Traffic K8s</p>
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCreateContainer} disabled={isDeploying || deployStatus === 'running'}
                      className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20">
                      {isDeploying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                      Start Deployment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ STEP 2: Finalize & Billing ═══ */}
            {steps[currentStep]?.id === "finalize" && (
              <div className="space-y-8 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                    {isPaidPlan ? <CreditCard className="h-10 w-10 text-primary" /> : <PartyPopper className="h-10 w-10 text-primary" />}
                  </div>
                  <h1 className="text-3xl font-black tracking-tight">
                    {isPaidPlan ? "Complete Your Subscription" : "You're All Set!"}
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {isPaidPlan 
                      ? "To activate your Pro/Business workspace, please add a payment method for metered billing."
                      : "Your free workspace is ready! You can now start tracking events."
                    }
                  </p>
                </div>

                <Card className="rounded-3xl border-border/60 border-t-4 border-t-primary overflow-hidden shadow-2xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-border/40">
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</p>
                        <p className="text-sm font-bold">PixelMaster {tenant?.plan} Subscription</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Billing</p>
                        <p className="text-sm font-bold">Metered/Monthly</p>
                      </div>
                    </div>

                    {isPaidPlan ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border/60 flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <p className="text-xs text-left text-muted-foreground">
                            Infrastructure is warm and ready. Linking a card will instantly activate your global tracking nodes.
                          </p>
                        </div>
                        <Button onClick={handlePayment} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20">
                          Add Card & Activate <ArrowRight className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => router.visit("/dashboard")} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20">
                        Go to Dashboard <ArrowRight className="h-5 w-5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <p className="text-[10px] text-muted-foreground px-10">
                  By clicking continue, you agree to PixelMaster's Terms of Service and Privacy Policy. 
                  Paid plans include $5.00/mo base + metered event usage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

