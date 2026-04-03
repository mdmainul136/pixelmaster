import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default, { useState } from "react";
import { usePage, Head } from "@inertiajs/react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { Zap, Star, Crown, Building2, Infinity, ShieldCheck, Phone, CreditCard, Check, X, HelpCircle } from "lucide-react";
import { B as Button } from "./button-Dwr8R-lW.js";
import { toast } from "sonner";
import axios from "axios";
import "@tanstack/react-query";
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
    popular: false
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
    popular: true
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
    popular: false
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
    popular: false
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
    popular: false
  }
];
const FEATURE_MATRIX = [
  {
    category: "ðŸš€ Phase 1 â€” Core Features",
    features: [
      { name: "Custom Domain", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Custom Loader", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "PixelMaster Analytics", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Anonymizer", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "HTTP Header Config", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Global CDN", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "GEO Headers", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "User Agent Info", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "PixelMaster API", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "User ID", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Open Container Bot Index", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Click ID Restorer", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Service Account", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Event Logs", free: false, pro: true, biz: true, ent: true, custom: true, badge: "3 days", bizBadge: "10 days", entBadge: "50 days", customBadge: "Custom" },
      { name: "Cookie Keeper", free: false, pro: true, biz: true, ent: true, custom: true, badge: "Standard", bizBadge: "Custom" },
      { name: "Bot Detection", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "Ad Blocker Info", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "POAS Data Feed", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "PixelMaster Store", free: false, pro: true, biz: true, ent: true, custom: true }
    ]
  },
  {
    category: "âš¡ Phase 2 â€” Advanced Infrastructure",
    features: [
      { name: "Multi-zone Infrastructure", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Multi Domains", free: false, pro: false, biz: true, ent: true, custom: true, bizBadge: "Up to 20", entBadge: "Up to 50", customBadge: "Unlimited" },
      { name: "Real-time Monitoring", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "File Proxy", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "XML to JSON", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Block Request by IP", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Schedule Requests", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Request Delay", free: false, pro: false, biz: true, ent: true, custom: true },
      { name: "Custom Log Retention", free: false, pro: false, biz: false, ent: false, custom: true },
      { name: "Dedicated IP", free: false, pro: false, biz: false, ent: false, custom: true },
      { name: "Private Cluster", free: false, pro: false, biz: false, ent: false, custom: true }
    ]
  },
  {
    category: "ðŸ‘¥ Phase 3 â€” Account Management",
    features: [
      { name: "Transfer Ownership", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Consolidated Invoice", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Share Access", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Two-Factor Auth (2FA)", free: true, pro: true, biz: true, ent: true, custom: true },
      { name: "Google Sheets Sync", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "Single Sign-On (SSO)", free: false, pro: false, biz: false, ent: false, custom: true },
      { name: "Data Manager API", free: false, pro: true, biz: true, ent: true, custom: true }
    ]
  },
  {
    category: "ðŸ”Œ Phase 4 â€” Connections",
    features: [
      { name: "Google Ads Connection", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "Microsoft Ads Connection", free: false, pro: true, biz: true, ent: true, custom: true },
      { name: "Meta Custom Audiences", free: false, pro: true, biz: true, ent: true, custom: true }
    ]
  },
  {
    category: "ðŸ“Š Monthly Limits",
    features: [
      {
        name: "Events / Month",
        free: false,
        pro: false,
        biz: false,
        ent: false,
        custom: false,
        textFree: "10K",
        textPro: "500K",
        textBiz: "5M",
        textEnt: "50M",
        textCustom: "Unlimited"
      },
      {
        name: "Log Retention",
        free: false,
        pro: false,
        biz: false,
        ent: false,
        custom: false,
        textFree: "None",
        textPro: "3 days",
        textBiz: "10 days",
        textEnt: "50 days",
        textCustom: "Custom"
      },
      {
        name: "Max Domains",
        free: false,
        pro: false,
        biz: false,
        ent: false,
        custom: false,
        textFree: "1",
        textPro: "3",
        textBiz: "20",
        textEnt: "50",
        textCustom: "Unlimited"
      },
      {
        name: "Team Members",
        free: false,
        pro: false,
        biz: false,
        ent: false,
        custom: false,
        textFree: "1",
        textPro: "5",
        textBiz: "20",
        textEnt: "Unlimited",
        textCustom: "Unlimited"
      }
    ]
  }
];
const COL_COLORS = {
  free: "text-slate-400",
  pro: "text-primary",
  biz: "text-indigo-400",
  ent: "text-violet-400",
  custom: "text-amber-400"
};
const PricingPage = () => {
  const { plan: sharedPlan, auth } = usePage().props;
  const currentPlan = sharedPlan || (auth == null ? void 0 : auth.plan) || "free";
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const handleUpgrade = async (planKey) => {
    var _a, _b;
    if (planKey === currentPlan) return;
    if (planKey === "enterprise" || planKey === "custom") {
      window.open("mailto:support@pixelmaster.io?subject=Enterprise%20Inquiry", "_blank");
      return;
    }
    setLoadingPlan(planKey);
    const toastId = toast.loading(`Initiating checkout for ${planKey.toUpperCase()}...`);
    try {
      const { data } = await axios.post("/api/v1/subscriptions/checkout", {
        plan_key: planKey,
        gateway: "stripe",
        billing_cycle: billingCycle
      });
      if (data.success && data.checkout_url) {
        toast.success("Redirecting to secure payment...", { id: toastId });
        setTimeout(() => {
          window.location.href = data.checkout_url;
        }, 900);
      } else {
        toast.error(data.message || "Failed to initiate checkout", { id: toastId });
      }
    } catch (err) {
      toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Payment gateway error", { id: toastId });
    } finally {
      setLoadingPlan(null);
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing & Plans â€” PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto px-4 py-10 space-y-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "px-4 py-1 text-xs font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5", children: "Pricing & Plans" }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground", children: [
          "Choose Your ",
          /* @__PURE__ */ jsx("span", { className: "text-primary italic", children: "Tracking Power" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Scale from hobbyist to enterprise. All plans include server-side tagging, global CDN, and full anonymization." }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 bg-muted/30 border border-border rounded-2xl p-1.5 mt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setBillingCycle("monthly"),
              className: `px-5 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: "Monthly"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setBillingCycle("yearly"),
              className: `px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: [
                "Yearly ",
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full", children: "-17%" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5", children: PLANS.map((plan) => {
        const Icon = plan.icon;
        const isCurrent = plan.key === currentPlan;
        const isEnterprisePlus = plan.key === "enterprise" || plan.key === "custom";
        const isLoading = loadingPlan === plan.key;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative flex flex-col rounded-3xl border ${plan.borderColor} bg-card p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? "shadow-xl shadow-primary/10 ring-1 ring-primary/30" : "shadow-sm"} ${isCurrent ? "ring-2 ring-emerald-500/50" : ""}`,
            children: [
              plan.popular && /* @__PURE__ */ jsx("div", { className: "absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg", children: "Most Popular" }),
              isCurrent && /* @__PURE__ */ jsx("div", { className: "absolute -top-3.5 right-4 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md", children: "Current" }),
              /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
                /* @__PURE__ */ jsx("div", { className: `h-10 w-10 rounded-2xl ${plan.bgColor} ${plan.color} flex items-center justify-center mb-3`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
                /* @__PURE__ */ jsx("h3", { className: `text-xl font-bold mb-1 ${plan.color}`, children: plan.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: plan.description })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                  /* @__PURE__ */ jsx("span", { className: `text-3xl font-black ${isEnterprisePlus ? "text-muted-foreground text-xl" : "text-foreground"}`, children: billingCycle === "yearly" && plan.priceYearly ? plan.priceYearly : plan.price }),
                  !isEnterprisePlus && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-medium", children: "/mo" })
                ] }),
                plan.subText && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/70 mt-1", children: plan.subText })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => handleUpgrade(plan.key),
                  disabled: isCurrent || isLoading,
                  variant: plan.popular ? "default" : "outline",
                  className: `w-full rounded-xl font-bold text-sm py-5 mb-5 transition-all gap-2 ${isCurrent ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 cursor-default" : ""}`,
                  children: isCurrent ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
                    " Active Plan"
                  ] }) : isEnterprisePlus ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
                    " Contact Sales"
                  ] }) : isLoading ? "Processing..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
                    " ",
                    currentPlan === "free" ? "Upgrade" : "Switch to " + plan.name
                  ] })
                }
              ),
              /* @__PURE__ */ jsx("ul", { className: "space-y-2.5 mt-auto", children: plan.features.map((f, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-xs text-foreground/80", children: [
                /* @__PURE__ */ jsx("div", { className: `mt-0.5 h-3.5 w-3.5 rounded-full flex-shrink-0 flex items-center justify-center ${plan.bgColor} ${plan.color}`, children: /* @__PURE__ */ jsx(Check, { className: "h-2 w-2" }) }),
                /* @__PURE__ */ jsx("span", { className: "font-medium leading-tight", children: f })
              ] }, i)) })
            ]
          },
          plan.key
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold tracking-tight text-foreground", children: "Full Feature Comparison" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-2", children: "A complete breakdown of every feature across all 5 plan tiers." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-3xl border border-border bg-card/30 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse min-w-[800px]", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
            /* @__PURE__ */ jsx("th", { className: "p-5 text-sm font-black uppercase tracking-widest text-muted-foreground bg-muted/20 w-[30%]", children: "Feature" }),
            [
              { key: "free", label: "Free", color: "text-slate-400" },
              { key: "pro", label: "Pro", color: "text-primary" },
              { key: "biz", label: "Business", color: "text-indigo-400" },
              { key: "ent", label: "Enterprise", color: "text-violet-400" },
              { key: "custom", label: "Custom", color: "text-amber-400" }
            ].map((col) => /* @__PURE__ */ jsx("th", { className: `p-5 text-center text-sm font-bold ${col.color}`, children: col.label }, col.key))
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: FEATURE_MATRIX.map((section, sIdx) => /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
            /* @__PURE__ */ jsx("tr", { className: "bg-muted/10", children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-5 py-3 text-xs font-black uppercase tracking-widest text-primary/80", children: section.category }) }),
            section.features.map((f, fIdx) => {
              if (f.textFree) {
                return /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 hover:bg-muted/5 transition-colors", children: [
                  /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-sm font-medium text-foreground/80", children: f.name }),
                  [f.textFree, f.textPro, f.textBiz, f.textEnt, f.textCustom].map((txt, i) => /* @__PURE__ */ jsx("td", { className: `px-5 py-3.5 text-center text-xs font-bold ${Object.values(COL_COLORS)[i]}`, children: txt }, i))
                ] }, fIdx);
              }
              const vals = [
                { v: f.free, badge: f.badge || null },
                { v: f.pro, badge: f.badge || null },
                { v: f.biz, badge: f.bizBadge || null },
                { v: f.ent, badge: f.entBadge || f.bizBadge || null },
                { v: f.custom, badge: f.customBadge || f.entBadge || f.bizBadge || null }
              ];
              return /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 hover:bg-muted/5 transition-colors", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-sm font-medium text-foreground/80", children: f.name }),
                vals.map((cell, i) => /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5 text-center", children: cell.v ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Check, { className: `h-4 w-4 ${Object.values(COL_COLORS)[i]}` }),
                  cell.badge && /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide", children: cell.badge })
                ] }) : /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mx-auto text-muted-foreground/20" }) }, i))
              ] }, fIdx);
            })
          ] }, sIdx)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center pb-10 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl border border-border bg-muted/20 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(HelpCircle, { className: "h-5 w-5 text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsx("span", { children: "Need >50M events, a dedicated cluster, or white-label options?" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:support@pixelmaster.io?subject=Enterprise%20Inquiry",
            className: "text-primary font-bold hover:underline whitespace-nowrap",
            children: "Talk to our team â†’"
          }
        )
      ] }) })
    ] })
  ] });
};
export {
  PricingPage as default
};
