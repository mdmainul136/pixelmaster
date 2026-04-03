import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import {
  Check, Zap, Star, ShieldCheck, Crown, ArrowRight, CreditCard,
  HelpCircle, X, Building2, Infinity, Lock, Phone
} from "lucide-react";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

// â”€â”€â”€ Plan definitions (mirrors config/plans.php) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceYearly: "$0",
    subText: "No credit card required",
    description: "Get started with core sGTM tracking for free.",
    icon: Zap,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-200/30",
    badgeColor: "bg-slate-500/20 text-slate-400",
    features: ["Up to 10K events/mo", "Custom Domain", "Global CDN", "Anonymizer", "GEO Headers", "User ID", "Click ID Restorer", "HTTP Header Config"],
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$17",
    priceYearly: "$200/yr",
    subText: "Billed $200 yearly (save 2 months)",
    description: "Professional tracking for growing businesses.",
    icon: Star,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    badgeColor: "bg-primary/20 text-primary",
    features: ["Up to 500K events/mo", "Everything in Free", "Event Logs (3 days)", "Cookie Keeper", "Bot Detection", "Ad Blocker Info", "POAS Data Feed", "PixelMaster Store", "Google Sheets", "Connections (GA, Meta, Bing)"],
    popular: true,
  },
  {
    key: "business",
    name: "Business",
    price: "$83",
    priceYearly: "$1,000/yr",
    subText: "Billed $1,000 yearly (save 2 months)",
    description: "Elite infrastructure for high-scale tracking.",
    icon: Crown,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    badgeColor: "bg-indigo-500/20 text-indigo-400",
    features: ["Up to 5M events/mo", "Everything in Pro", "10-day Log Retention", "Multi-zone Infrastructure", "Real-time Monitoring", "File Proxy", "IP Blocking", "Request Scheduler", "Request Delay", "Multi Domains (up to 20)"],
    popular: false,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceYearly: "Custom",
    subText: "Annual billing only",
    description: "Unlimited scale with SLA guarantees.",
    icon: Building2,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    badgeColor: "bg-violet-500/20 text-violet-400",
    features: ["Up to 50M events/mo", "Everything in Business", "50-day Log Retention", "Multi Domains (up to 50)", "Priority Support & SLA", "Custom Integrations", "Dedicated Account Manager"],
    popular: false,
  },
  {
    key: "custom",
    name: "Custom",
    price: "Contact Us",
    priceYearly: "",
    subText: "Fully negotiated contract",
    description: "Private cluster, dedicated IP, unlimited scale.",
    icon: Infinity,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-400",
    features: ["Unlimited events", "Everything in Enterprise", "Dedicated IP", "Private Cluster", "Custom Log Retention", "Single Sign-On (SSO)", "Unlimited Domains", "White-label options"],
    popular: false,
  },
];

// â”€â”€â”€ Full Feature Comparison Matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FEATURE_MATRIX = [
  {
    category: "ðŸš€ Phase 1 â€” Core Features",
    features: [
      { name: "Custom Domain",           free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Custom Loader",           free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "PixelMaster Analytics",         free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Anonymizer",             free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "HTTP Header Config",      free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Global CDN",             free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "GEO Headers",            free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "User Agent Info",        free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "PixelMaster API",              free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "User ID",                free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Open Container Bot Index", free: true, pro: true, biz: true,  ent: true,  custom: true  },
      { name: "Click ID Restorer",      free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Service Account",        free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Event Logs",             free: false, pro: true,  biz: true,  ent: true,  custom: true,  badge: "3 days", bizBadge: "10 days", entBadge: "50 days", customBadge: "Custom" },
      { name: "Cookie Keeper",          free: false, pro: true,  biz: true,  ent: true,  custom: true,  badge: "Standard", bizBadge: "Custom" },
      { name: "Bot Detection",          free: false, pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Ad Blocker Info",        free: false, pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "POAS Data Feed",         free: false, pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "PixelMaster Store",      free: false, pro: true,  biz: true,  ent: true,  custom: true  },
    ],
  },
  {
    category: "âš¡ Phase 2 â€” Advanced Infrastructure",
    features: [
      { name: "Multi-zone Infrastructure", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Multi Domains",           free: false, pro: false, biz: true,  ent: true,  custom: true, bizBadge: "Up to 20", entBadge: "Up to 50", customBadge: "Unlimited" },
      { name: "Real-time Monitoring",    free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "File Proxy",              free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "XML to JSON",             free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "Block Request by IP",     free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "Schedule Requests",       free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "Request Delay",           free: false, pro: false, biz: true,  ent: true,  custom: true  },
      { name: "Custom Log Retention",    free: false, pro: false, biz: false, ent: false, custom: true  },
      { name: "Dedicated IP",            free: false, pro: false, biz: false, ent: false, custom: true  },
      { name: "Private Cluster",         free: false, pro: false, biz: false, ent: false, custom: true  },
    ],
  },
  {
    category: "ðŸ‘¥ Phase 3 â€” Account Management",
    features: [
      { name: "Transfer Ownership",     free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Consolidated Invoice",   free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Share Access",           free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Two-Factor Auth (2FA)",  free: true,  pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Google Sheets Sync",     free: false, pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Single Sign-On (SSO)",   free: false, pro: false, biz: false, ent: false, custom: true  },
      { name: "Data Manager API",       free: false, pro: true,  biz: true,  ent: true,  custom: true  },
    ],
  },
  {
    category: "ðŸ”Œ Phase 4 â€” Connections",
    features: [
      { name: "Google Ads Connection",  free: false, pro: true,  biz: true,  ent: true,  custom: true  },
      { name: "Microsoft Ads Connection", free: false, pro: true, biz: true, ent: true,  custom: true  },
      { name: "Meta Custom Audiences",  free: false, pro: true,  biz: true,  ent: true,  custom: true  },
    ],
  },
  {
    category: "ðŸ“Š Monthly Limits",
    features: [
      { name: "Events / Month",     free: false, pro: false, biz: false, ent: false, custom: false,
        textFree: "10K", textPro: "500K", textBiz: "5M", textEnt: "50M", textCustom: "Unlimited" },
      { name: "Log Retention",      free: false, pro: false, biz: false, ent: false, custom: false,
        textFree: "None", textPro: "3 days", textBiz: "10 days", textEnt: "50 days", textCustom: "Custom" },
      { name: "Max Domains",        free: false, pro: false, biz: false, ent: false, custom: false,
        textFree: "1", textPro: "3", textBiz: "20", textEnt: "50", textCustom: "Unlimited" },
      { name: "Team Members",       free: false, pro: false, biz: false, ent: false, custom: false,
        textFree: "1", textPro: "5", textBiz: "20", textEnt: "Unlimited", textCustom: "Unlimited" },
    ],
  },
];

const PLAN_COLS = ["free", "pro", "biz", "ent", "custom"] as const;
const COL_COLORS: Record<string, string> = {
  free: "text-slate-400", pro: "text-primary", biz: "text-indigo-400",
  ent: "text-violet-400", custom: "text-amber-400",
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PricingPage = () => {
  const { plan: sharedPlan, auth } = usePage<any>().props;
  const currentPlan = sharedPlan || auth?.plan || "free";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planKey: string) => {
    if (planKey === currentPlan) return;
    if (planKey === "enterprise" || planKey === "custom") {
      window.open("mailto:support@pixelmaster.io?subject=Enterprise%20Inquiry", "_blank");
      return;
    }

    setLoadingPlan(planKey);
    const toastId = toast.loading(`Initiating checkout for ${planKey.toUpperCase()}...`);

    try {
      const { data } = await axios.post("/api/v1/subscriptions/checkout", {
        plan: planKey,
        plan_key: planKey,
        gateway: "stripe",
        billing_cycle: billingCycle,
      });

      if (data.success && data.checkout_url) {
        toast.success("Redirecting to secure payment...", { id: toastId });
        setTimeout(() => { window.location.href = data.checkout_url; }, 900);
      } else {
        toast.error(data.message || "Failed to initiate checkout", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment gateway error", { id: toastId });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Billing & Plans â€” PixelMaster" />

      <div className="max-w-[1400px] mx-auto px-4 py-10 space-y-20">

        {/* â”€â”€ Header â”€â”€ */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1 text-xs font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
            Pricing & Plans
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Choose Your <span className="text-primary italic">Tracking Power</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Scale from hobbyist to enterprise. All plans include server-side tagging, global CDN, and full anonymization.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-muted/30 border border-border rounded-2xl p-1.5 mt-2">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-17%</span>
            </button>
          </div>
        </div>

        {/* â”€â”€ Plan Cards Grid â”€â”€ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.key === currentPlan;
            const isEnterprisePlus = plan.key === "enterprise" || plan.key === "custom";
            const isLoading = loadingPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-3xl border ${plan.borderColor} bg-card p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular ? "shadow-xl shadow-primary/10 ring-1 ring-primary/30" : "shadow-sm"
                } ${isCurrent ? "ring-2 ring-emerald-500/50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3.5 right-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                    Current
                  </div>
                )}

                <div className="mb-5">
                  <div className={`h-10 w-10 rounded-2xl ${plan.bgColor} ${plan.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${plan.color}`}>{plan.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${isEnterprisePlus ? "text-muted-foreground text-xl" : "text-foreground"}`}>
                      {billingCycle === "yearly" && plan.priceYearly ? plan.priceYearly : plan.price}
                    </span>
                    {!isEnterprisePlus && <span className="text-muted-foreground text-xs font-medium">/mo</span>}
                  </div>
                  {plan.subText && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{plan.subText}</p>
                  )}
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={isCurrent || isLoading}
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full rounded-xl font-bold text-sm py-5 mb-5 transition-all gap-2 ${
                    isCurrent ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 cursor-default" : ""
                  }`}
                >
                  {isCurrent ? <><ShieldCheck className="h-4 w-4" /> Active Plan</> :
                   isEnterprisePlus ? <><Phone className="h-4 w-4" /> Contact Sales</> :
                   isLoading ? "Processing..." :
                   <><CreditCard className="h-4 w-4" /> {currentPlan === "free" ? "Upgrade" : "Switch to " + plan.name}</>}
                </Button>

                <ul className="space-y-2.5 mt-auto">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <div className={`mt-0.5 h-3.5 w-3.5 rounded-full flex-shrink-0 flex items-center justify-center ${plan.bgColor} ${plan.color}`}>
                        <Check className="h-2 w-2" />
                      </div>
                      <span className="font-medium leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* â”€â”€ Full Feature Comparison Table â”€â”€ */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Full Feature Comparison</h2>
            <p className="text-muted-foreground mt-2">A complete breakdown of every feature across all 5 plan tiers.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border bg-card/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-5 text-sm font-black uppercase tracking-widest text-muted-foreground bg-muted/20 w-[30%]">Feature</th>
                  {[
                    { key: "free", label: "Free",       color: "text-slate-400" },
                    { key: "pro",  label: "Pro",        color: "text-primary" },
                    { key: "biz",  label: "Business",   color: "text-indigo-400" },
                    { key: "ent",  label: "Enterprise", color: "text-violet-400" },
                    { key: "custom", label: "Custom",   color: "text-amber-400" },
                  ].map(col => (
                    <th key={col.key} className={`p-5 text-center text-sm font-bold ${col.color}`}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    {/* Section header */}
                    <tr className="bg-muted/10">
                      <td colSpan={6} className="px-5 py-3 text-xs font-black uppercase tracking-widest text-primary/80">
                        {section.category}
                      </td>
                    </tr>

                    {section.features.map((f: any, fIdx: number) => {
                      // Text-based rows (quotas)
                      if (f.textFree) {
                        return (
                          <tr key={fIdx} className="border-b border-border/40 hover:bg-muted/5 transition-colors">
                            <td className="px-5 py-3.5 text-sm font-medium text-foreground/80">{f.name}</td>
                            {[f.textFree, f.textPro, f.textBiz, f.textEnt, f.textCustom].map((txt: string, i: number) => (
                              <td key={i} className={`px-5 py-3.5 text-center text-xs font-bold ${Object.values(COL_COLORS)[i]}`}>
                                {txt}
                              </td>
                            ))}
                          </tr>
                        );
                      }

                      // Bool rows â€” check or X, with optional badge
                      const vals = [
                        { v: f.free,   badge: f.badge || null },
                        { v: f.pro,    badge: f.badge || null },
                        { v: f.biz,    badge: f.bizBadge || null },
                        { v: f.ent,    badge: f.entBadge || f.bizBadge || null },
                        { v: f.custom, badge: f.customBadge || f.entBadge || f.bizBadge || null },
                      ];

                      return (
                        <tr key={fIdx} className="border-b border-border/40 hover:bg-muted/5 transition-colors">
                          <td className="px-5 py-3.5 text-sm font-medium text-foreground/80">{f.name}</td>
                          {vals.map((cell, i) => (
                            <td key={i} className="px-5 py-3.5 text-center">
                              {cell.v ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Check className={`h-4 w-4 ${Object.values(COL_COLORS)[i]}`} />
                                  {cell.badge && (
                                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">
                                      {cell.badge}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <X className="h-4 w-4 mx-auto text-muted-foreground/20" />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* â”€â”€ FAQ / Enterprise CTA â”€â”€ */}
        <div className="text-center pb-10 space-y-4">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl border border-border bg-muted/20 text-sm text-muted-foreground">
            <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <span>Need &gt;50M events, a dedicated cluster, or white-label options?</span>
            <a
              href="mailto:support@pixelmaster.io?subject=Enterprise%20Inquiry"
              className="text-primary font-bold hover:underline whitespace-nowrap"
            >
              Talk to our team â†’
            </a>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PricingPage;

