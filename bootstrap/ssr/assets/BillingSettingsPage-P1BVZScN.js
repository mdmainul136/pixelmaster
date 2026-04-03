import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Infinity, Building2, Crown, Star, Zap, CheckCircle2, RefreshCcw, TrendingUp, CreditCard, ArrowRight, BarChart3, AlertTriangle, Calendar, ChevronRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import "class-variance-authority";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
const PLAN_META = {
  free: { label: "Free", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-300/30", Icon: Zap, limit: "10K" },
  pro: { label: "Pro", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", Icon: Star, limit: "500K" },
  business: { label: "Business", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-400/30", Icon: Crown, limit: "5M" },
  enterprise: { label: "Enterprise", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-400/30", Icon: Building2, limit: "50M" },
  custom: { label: "Custom", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30", Icon: Infinity, limit: "∞" }
};
const UPGRADE_NUDGE = {
  free: { to: "Pro", reason: "Unlock Event Logs, Cookie Keeper & Bot Detection" },
  pro: { to: "Business", reason: "Add Multi-zone Infra, File Proxy & IP Blocking" },
  business: { to: "Enterprise", reason: "Get 50-day logs, 50 domains & a dedicated account manager" },
  enterprise: null,
  custom: null
};
const BillingSettingsPage = () => {
  const { plan: sharedPlan, auth } = usePage().props;
  const currentPlanKey = sharedPlan || (auth == null ? void 0 : auth.plan) || "free";
  const meta = PLAN_META[currentPlanKey] ?? PLAN_META.free;
  const { Icon } = meta;
  const nudge = UPGRADE_NUDGE[currentPlanKey];
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { data: usage, isLoading: usageLoading, refetch } = useQuery({
    queryKey: ["billing-usage"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/subscriptions/usage");
      return data.data;
    },
    refetchInterval: 6e4
  });
  const { data: history = [] } = useQuery({
    queryKey: ["billing-history"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/v1/subscriptions/invoices");
        return data.data ?? [];
      } catch {
        return [];
      }
    }
  });
  const handleUpgrade = async (planKey) => {
    var _a, _b;
    setLoadingPlan(planKey);
    const toastId = toast.loading(`Initiating checkout for ${planKey.toUpperCase()}...`);
    try {
      const { data } = await axios.post("/api/v1/subscriptions/checkout", {
        plan_key: planKey,
        gateway: "stripe",
        billing_cycle: "monthly"
      });
      if (data.success && data.checkout_url) {
        toast.success("Redirecting to secure payment...", { id: toastId });
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 800);
      } else {
        toast.error(data.message || "Checkout failed.", { id: toastId });
      }
    } catch (err) {
      toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Payment error", { id: toastId });
    } finally {
      setLoadingPlan(null);
    }
  };
  const pct = usage ? Math.min(100, Math.round(usage.usage / usage.limit * 100)) : 0;
  const isCritical = pct >= 90;
  const isWarning = pct >= 75;
  const fmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing & Plan — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8 pb-20", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Billing & Plan" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your subscription, usage, and invoices." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `rounded-3xl border ${meta.border} ${meta.bg} p-8 relative overflow-hidden`, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 rounded-full blur-[120px] opacity-10 bg-current" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
            /* @__PURE__ */ jsx("div", { className: `h-14 w-14 rounded-2xl ${meta.bg} ${meta.color} flex items-center justify-center border ${meta.border}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: "Current Plan" }),
              /* @__PURE__ */ jsx("h2", { className: `text-3xl font-black ${meta.color}`, children: meta.label }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsxs(Badge, { className: "bg-emerald-500/15 text-emerald-500 border-none text-[10px] font-bold", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
                  " Active"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "Up to ",
                  meta.limit,
                  " events/month"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            nudge && /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleUpgrade(nudge.to.toLowerCase()),
                disabled: !!loadingPlan,
                className: "gap-2 rounded-2xl font-bold px-6",
                children: [
                  loadingPlan === nudge.to.toLowerCase() ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
                  "Upgrade to ",
                  nudge.to
                ]
              }
            ),
            /* @__PURE__ */ jsx(Link, { href: "/settings/plans", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2 rounded-2xl font-bold px-6", children: [
              /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
              " See All Plans"
            ] }) })
          ] })
        ] })
      ] }),
      nudge && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: nudge.reason }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Upgrade to ",
              nudge.to,
              " to unlock these features."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            onClick: () => handleUpgrade(nudge.to.toLowerCase()),
            className: "rounded-xl font-bold flex-shrink-0 gap-2",
            children: [
              "Upgrade ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-8 shadow-sm space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground", children: "Monthly Event Usage" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => refetch(), className: "p-2 rounded-lg hover:bg-muted transition-colors", children: /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4 text-muted-foreground" }) })
        ] }),
        usageLoading ? /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-3 w-1/3 bg-muted rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-muted rounded-full" })
        ] }) : usage ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-foreground", children: fmt.format(usage.usage) }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "of ",
                fmt.format(usage.limit),
                " events this month"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: `text-2xl font-black ${isCritical ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"}`, children: [
              pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-full bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all duration-700 ease-out ${isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"}`,
              style: { width: `${pct}%` }
            }
          ) }),
          isCritical && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-rose-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-rose-600", children: [
              "You are at ",
              pct,
              "% of your monthly limit. Events may be dropped if you exceed 100%.",
              " ",
              nudge && /* @__PURE__ */ jsxs("button", { onClick: () => handleUpgrade(nudge.to.toLowerCase()), className: "underline font-bold", children: [
                "Upgrade to ",
                nudge.to
              ] })
            ] })
          ] }),
          isWarning && !isCritical && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-amber-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-amber-600", children: [
              "Approaching your monthly limit. ",
              nudge && `Consider upgrading to ${nudge.to}.`
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Usage data unavailable." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-border/60 bg-card shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "px-8 py-5 border-b border-border/40 flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground", children: "Billing History" })
        ] }) }),
        history.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [
          /* @__PURE__ */ jsx(CreditCard, { className: "h-10 w-10 text-muted-foreground/20 mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No invoices yet." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Your payment history will appear here." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/40", children: history.map((inv, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-8 py-4 hover:bg-muted/5 transition-colors", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: inv.description ?? `Plan: ${inv.plan}` }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: inv.date })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-foreground", children: [
              "$",
              inv.amount
            ] }),
            /* @__PURE__ */ jsx(Badge, { className: `text-[9px] font-bold border-none ${inv.status === "paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`, children: inv.status }),
            inv.pdf_url && /* @__PURE__ */ jsxs("a", { href: inv.pdf_url, target: "_blank", className: "text-xs text-primary hover:underline flex items-center gap-1", children: [
              "PDF ",
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" })
            ] })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/40 bg-muted/10 px-6 py-5 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: "Compare all 5 plan tiers" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "See the full feature matrix → Free, Pro, Business, Enterprise, Custom" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/settings/plans", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "rounded-xl font-bold gap-2", children: [
          "View Plans ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3" })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  BillingSettingsPage as default
};
