/**
 * BillingSettingsPage
 * Route: /settings/plans (web.php)
 *
 * Shows:
 *  - Current plan + status
 *  - Monthly event usage meter (live from API)
 *  - Quick plan comparison + upgrade CTAs
 *  - Billing history stub
 */
import React, { useState } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  CreditCard, Zap, Star, Crown, Building2, ArrowRight, CheckCircle2,
  RefreshCcw, TrendingUp, AlertTriangle, ShieldCheck, Infinity,
  BarChart3, Calendar, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// ─── Plan meta ───────────────────────────────────────────────────────────────
const PLAN_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: any; limit: string }> = {
  free:       { label: "Free",       color: "text-slate-400", bg: "bg-slate-500/10",  border: "border-slate-300/30", Icon: Zap,       limit: "10K" },
  pro:        { label: "Pro",        color: "text-primary",   bg: "bg-primary/10",    border: "border-primary/30",   Icon: Star,      limit: "500K" },
  business:   { label: "Business",   color: "text-indigo-400",bg: "bg-indigo-500/10", border: "border-indigo-400/30",Icon: Crown,     limit: "5M" },
  enterprise: { label: "Enterprise", color: "text-violet-400",bg: "bg-violet-500/10", border: "border-violet-400/30",Icon: Building2, limit: "50M" },
  custom:     { label: "Custom",     color: "text-amber-400", bg: "bg-amber-500/10",  border: "border-amber-400/30", Icon: Infinity,  limit: "∞" },
};

// ─── Upgrade suggestions per plan ───────────────────────────────────────────
const UPGRADE_NUDGE: Record<string, { to: string; reason: string } | null> = {
  free:     { to: "Pro",      reason: "Unlock Event Logs, Cookie Keeper & Bot Detection" },
  pro:      { to: "Business", reason: "Add Multi-zone Infra, File Proxy & IP Blocking" },
  business: { to: "Enterprise", reason: "Get 50-day logs, 50 domains & a dedicated account manager" },
  enterprise: null,
  custom:     null,
};

// ─── Component ───────────────────────────────────────────────────────────────
const BillingSettingsPage: React.FC = () => {
  const { plan: sharedPlan, auth } = usePage<any>().props;
  const currentPlanKey = sharedPlan || auth?.plan || "free";
  const meta = PLAN_META[currentPlanKey] ?? PLAN_META.free;
  const { Icon } = meta;
  const nudge = UPGRADE_NUDGE[currentPlanKey];
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Live usage from API
  const { data: usage, isLoading: usageLoading, refetch } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/subscriptions/usage");
      return data.data;
    },
    refetchInterval: 60_000,
  });

  // Billing history from API
  const { data: history = [] } = useQuery({
    queryKey: ["billing-history"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/v1/subscriptions/invoices");
        return data.data ?? [];
      } catch { return []; }
    },
  });

  const handleUpgrade = async (planKey: string) => {
    setLoadingPlan(planKey);
    const toastId = toast.loading(`Initiating checkout for ${planKey.toUpperCase()}...`);
    try {
      // Use the new StripeBillingController route
      const { data } = await axios.post("/api/v1/billing/checkout", {
        plan_key: planKey,
      });
      if (data.success && data.url) {
        toast.success("Redirecting to secure payment...", { id: toastId });
        setTimeout(() => { window.location.href = data.url; }, 800);
      } else {
        toast.error(data.message || "Checkout failed.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment error", { id: toastId });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    const toastId = toast.loading("Opening billing portal...");
    try {
      const { data } = await axios.post("/api/v1/billing/portal");
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error("Failed to open billing portal");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const pct = usage ? Math.min(100, Math.round((usage.usage / usage.limit) * 100)) : 0;
  const isCritical = pct >= 90;
  const isWarning  = pct >= 75;

  const fmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

  return (
    <DashboardLayout>
      <Head title="Billing & Plan — PixelMaster" />
      <div className="max-w-4xl mx-auto space-y-8 pb-20">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your subscription, usage, and invoices.</p>
        </div>

        {/* ── Current Plan Card ── */}
        <div className={`rounded-3xl border ${meta.border} ${meta.bg} p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[120px] opacity-10 bg-current" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 rounded-2xl ${meta.bg} ${meta.color} flex items-center justify-center border ${meta.border}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Plan</p>
                <h2 className={`text-3xl font-black ${meta.color}`}>{meta.label}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-none text-[10px] font-bold">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                  <span className="text-xs text-muted-foreground">Up to {meta.limit} events/month</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {currentPlanKey !== 'free' && (
                <Button onClick={handlePortal} variant="outline" className="gap-2 rounded-2xl font-bold px-6 bg-white/50">
                  <CreditCard className="h-4 w-4" /> Manage Billing
                </Button>
              )}
              {nudge && (
                <Button
                  onClick={() => handleUpgrade(nudge.to.toLowerCase())}
                  disabled={!!loadingPlan}
                  className="gap-2 rounded-2xl font-bold px-6"
                >
                  {loadingPlan === nudge.to.toLowerCase() ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  Upgrade to {nudge.to}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Upgrade Nudge Banner ── */}
        {nudge && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">{nudge.reason}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to {nudge.to} to unlock these features.</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleUpgrade(nudge.to.toLowerCase())}
              className="rounded-xl font-bold flex-shrink-0 gap-2"
            >
              Upgrade <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* ── Usage Meter ── */}
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Monthly Event Usage</h3>
            </div>
            <button onClick={() => refetch()} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {usageLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded-full" />
            </div>
          ) : usage ? (
            <>
              {/* Numbers */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-foreground">{fmt.format(usage.usage)}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {fmt.format(usage.limit)} events this month</p>
                </div>
                <span className={`text-2xl font-black ${isCritical ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"}`}>
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Contextual warnings */}
              {isCritical && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-rose-600">
                    You are at {pct}% of your monthly limit. Events may be dropped if you exceed 100%.{" "}
                    {nudge && (
                      <button onClick={() => handleUpgrade(nudge.to.toLowerCase())} className="underline font-bold">
                        Upgrade to {nudge.to}
                      </button>
                    )}
                  </p>
                </div>
              )}
              {isWarning && !isCritical && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-amber-600">
                    Approaching your monthly limit. {nudge && `Consider upgrading to ${nudge.to}.`}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Usage data unavailable.</p>
          )}
        </div>

        {/* ── Billing History ── */}
        <div className="rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Billing History</h3>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CreditCard className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {history.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-8 py-4 hover:bg-muted/5 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-foreground">{inv.description ?? `Plan: ${inv.plan}`}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-foreground">${inv.amount}</span>
                    <Badge className={`text-[9px] font-bold border-none ${
                      inv.status === "paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {inv.status}
                    </Badge>
                    {inv.pdf_url && (
                      <a href={inv.pdf_url} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                        PDF <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Plan comparison shortcut ── */}
        <div className="rounded-2xl border border-border/40 bg-muted/10 px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-bold text-foreground">Compare all 5 plan tiers</p>
              <p className="text-xs text-muted-foreground">See the full feature matrix → Free, Pro, Business, Enterprise, Custom</p>
            </div>
          </div>
          <Link href="/settings/plans">
            <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2">
              View Plans <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default BillingSettingsPage;
