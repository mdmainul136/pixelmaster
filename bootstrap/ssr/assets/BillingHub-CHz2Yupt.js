import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import { CreditCard, Clock, History, Shield, Globe, Zap, Info, TrendingUp, Check } from "lucide-react";
const PlanCard = ({ plan, currentPlan, currency, onSelect }) => {
  const isCurrent = (currentPlan == null ? void 0 : currentPlan.plan_key) === plan.plan_key;
  const price = plan.prices_ppp[currency] || plan.price_monthly;
  return /* @__PURE__ */ jsxs("div", { className: `p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden flex flex-col h-full ${isCurrent ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"}`, children: [
    isCurrent && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl", children: "Current Plan" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-900 tracking-tight", children: plan.name }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 font-medium mt-1 leading-relaxed", children: plan.description })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-3xl font-black text-slate-900 tracking-tighter", children: [
          currency === "BDT" ? "৳" : currency === "SAR" ? "SR" : currency === "AED" ? "DH" : "$",
          price
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400 capitalize", children: "/mo" })
      ] }),
      currency !== "USD" && /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full w-fit", children: [
        /* @__PURE__ */ jsx(TrendingUp, { size: 10 }),
        /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase tracking-widest", children: "PPP Applied" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3 mb-8 flex-grow", children: plan.features.map((feature, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[11px] font-medium text-slate-600", children: [
      /* @__PURE__ */ jsx("div", { className: `shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isCurrent ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`, children: /* @__PURE__ */ jsx(Check, { size: 10, strokeWidth: 4 }) }),
      feature
    ] }, i)) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onSelect(plan),
        disabled: isCurrent,
        className: `w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCurrent ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl shadow-slate-200"}`,
        children: isCurrent ? "Current Plan" : plan.price_monthly === 0 ? "Downgrade to Free" : "Choose Plan"
      }
    )
  ] });
};
const BillingHub = ({ auth }) => {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const currencies = [
    { code: "USD", label: "US Dollar", flag: "🇺🇸" },
    { code: "SAR", label: "Saudi Riyal", flag: "🇸🇦" },
    { code: "AED", label: "UAE Dirham", flag: "🇦🇪" },
    { code: "BDT", label: "Bangladeshi Taka", flag: "🇧🇩" }
  ];
  useEffect(() => {
    fetchBillingData();
  }, []);
  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const mockPlans = [
        { id: 1, name: "Free", plan_key: "free", price_monthly: 0, description: "Basic tracking for small stores.", features: ["10k Events/mo", "Basic AI", "Email Support"], prices_ppp: { USD: 0, SAR: 0, AED: 0, BDT: 0 } },
        { id: 2, name: "Basic", plan_key: "basic", price_monthly: 10, description: "Perfect for established small businesses.", features: ["100k Events/mo", "Full AI Advisor", "Client Dashboard"], prices_ppp: { USD: 10, SAR: 30, AED: 30, BDT: 250 } },
        { id: 3, name: "Pro", plan_key: "pro", price_monthly: 20, description: "The choice for high-performance pros.", features: ["500k Events/mo", "MTA Attribution", "Priority Support", "Custom Domains"], prices_ppp: { USD: 20, SAR: 60, AED: 60, BDT: 500 } },
        { id: 4, name: "Business", plan_key: "business", price_monthly: 50, description: "Scale with dedicated infrastructure.", features: ["2.5M Events/mo", "Dedicated Cache", "Success Manager"], prices_ppp: { USD: 50, SAR: 150, AED: 150, BDT: 1200 } },
        { id: 5, name: "Enterprise", plan_key: "enterprise", price_monthly: 100, description: "Maximum power for global leaders.", features: ["10M Events/mo", "K8s Auto-scaling", "White-label Reports"], prices_ppp: { USD: 100, SAR: 300, AED: 300, BDT: 2500 } }
      ];
      setPlans(mockPlans);
      setCurrentSub({
        plan_key: "pro",
        status: "trialing",
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
        events_used: 4250,
        events_limit: 5e5
      });
    } catch (error) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };
  const handleSelectPlan = (plan) => {
    alert(`Initializing checkout for ${plan.name} at ${currency} ${plan.prices_ppp[currency]}...`);
  };
  const usagePercent = currentSub ? currentSub.events_used / currentSub.events_limit * 100 : 0;
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Billing & Subscriptions — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(CreditCard, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Billing & Monetization" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Globally accessible via ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold underline decoration-indigo-300 decoration-2", children: "Purchasing Power Parity (PPP)" }),
          " pricing."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200", children: currencies.map((c) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setCurrency(c.code),
          className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === c.code ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`,
          children: [
            c.flag,
            " ",
            c.code
          ]
        },
        c.code
      )) })
    ] }),
    (currentSub == null ? void 0 : currentSub.status) === "trialing" && /* @__PURE__ */ jsxs("div", { className: "mb-10 p-6 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] flex items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-amber-400 p-3 rounded-2xl text-white", children: /* @__PURE__ */ jsx(Clock, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-amber-900 uppercase tracking-widest", children: "Active Pro Trial" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-amber-700 font-medium", children: [
            "Your free trial ends on ",
            /* @__PURE__ */ jsx("span", { className: "font-bold underline", children: new Date(currentSub.trial_ends_at).toLocaleDateString() }),
            ". If no plan is selected, you'll be moved to the Free Tier."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "px-5 py-2.5 bg-amber-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20", children: "Secure Pro Plan" })
    ] }),
    currentSub && /* @__PURE__ */ jsxs("div", { className: "mb-10 p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "shrink-0 relative", children: [
        /* @__PURE__ */ jsxs("svg", { className: "w-24 h-24 transform -rotate-90", children: [
          /* @__PURE__ */ jsx("circle", { cx: "48", cy: "48", r: "40", stroke: "currentColor", strokeWidth: "8", fill: "transparent", className: "text-slate-100" }),
          /* @__PURE__ */ jsx("circle", { cx: "48", cy: "48", r: "40", stroke: "currentColor", strokeWidth: "8", fill: "transparent", strokeDasharray: 251.2, strokeDashoffset: 251.2 - 251.2 * usagePercent / 100, className: "text-indigo-600 transition-all duration-1000" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-900", children: [
          Math.round(usagePercent),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-grow", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-widest", children: "Monthly Event Quota" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 capitalize", children: "Real-time Data Stream" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-black text-slate-900 tracking-tighter", children: currentSub.events_used.toLocaleString() }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-slate-400", children: [
            "/ ",
            currentSub.events_limit.toLocaleString(),
            " events used"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium mt-2 max-w-lg leading-relaxed uppercase tracking-tighter", children: "Once your quota hits 100%, data ingestion will temporarily pause on the server proxy until the next billing cycle." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6", children: plans.map((plan) => /* @__PURE__ */ jsx(
      PlanCard,
      {
        plan,
        currentPlan: currentSub,
        currency,
        onSelect: handleSelectPlan
      },
      plan.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-16 grid grid-cols-1 md:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-tight mb-6", children: [
          /* @__PURE__ */ jsx(History, { size: 16, className: "text-indigo-600" }),
          " Payment & History"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-70", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mb-4", children: /* @__PURE__ */ jsx(CreditCard, { size: 24 }) }),
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-widest mb-1", children: "No past invoices" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-medium", children: "Your historical billing data will appear here once you make your first payment." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-tight mb-6", children: [
          /* @__PURE__ */ jsx(Shield, { size: 16, className: "text-indigo-600" }),
          " Secure Billing"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: [
          { title: "Encrypted Payments", icon: Lock, text: "All transaction data is encrypted via 256-bit SSL directly with Stripe." },
          { title: "Global Currency Support", icon: Globe, text: "Pay in USD, SAR, AED, or BDT via local payment methods." },
          { title: "Flexible Cancellations", icon: Zap, text: "Cancel anytime. Your Pro features stay active until the period ends." }
        ].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 h-fit", children: /* @__PURE__ */ jsx(Info, { size: 14 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest", children: item.title }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium leading-relaxed mt-1", children: item.text })
          ] })
        ] }, i)) })
      ] })
    ] })
  ] });
};
export {
  BillingHub as default
};
