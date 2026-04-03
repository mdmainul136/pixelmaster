import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head } from "@inertiajs/react";
import { DollarSign, ShieldCheck, Lock, Save } from "lucide-react";
const BillingSettingsPage = ({ settings }) => {
  const { data, setData, post, processing, errors } = useForm({
    stripe_key: settings.stripe_key || "",
    stripe_secret: settings.stripe_secret || "",
    stripe_webhook_secret: settings.stripe_webhook_secret || "",
    sslcommerz_store_id: settings.sslcommerz_store_id || "",
    sslcommerz_store_password: settings.sslcommerz_store_password || "",
    default_trial_days: settings.default_trial_days || 7,
    quota_alert_percent: settings.quota_alert_percent || 80,
    is_stripe_enabled: settings.is_stripe_enabled,
    is_sslcommerz_enabled: settings.is_sslcommerz_enabled
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("platform.settings.billing.update"));
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Global Billing Settings — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(DollarSign, { size: 20 }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Global Billing & Gateway Settings" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
        "Centralized configuration for ",
        /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold underline decoration-indigo-300 decoration-2", children: "Monetization & Quota Enforcement" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#635BFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100", children: /* @__PURE__ */ jsx("span", { className: "font-black italic text-xl", children: "S" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Stripe Gateway (Global)" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5", children: "Primary Multi-Currency Processor" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "sr-only peer",
                checked: data.is_stripe_enabled,
                onChange: (e) => setData("is_stripe_enabled", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635BFF]" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-8 grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1", children: "Publishable Key" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.stripe_key,
                onChange: (e) => setData("stripe_key", e.target.value),
                className: "w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all",
                placeholder: "pk_test_..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1", children: "Secret Key" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: data.stripe_secret,
                onChange: (e) => setData("stripe_secret", e.target.value),
                className: "w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all font-mono",
                placeholder: "sk_test_..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1", children: "Webhook Secret" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: data.stripe_webhook_secret,
                onChange: (e) => setData("stripe_webhook_secret", e.target.value),
                className: "w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all font-mono",
                placeholder: "whsec_..."
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#FF1F5B] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100", children: /* @__PURE__ */ jsx("span", { className: "font-black italic text-xl", children: "S" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "SSLCommerz (Bangladesh)" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5", children: "Regional PPP Processor (BDT)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "sr-only peer",
                checked: data.is_sslcommerz_enabled,
                onChange: (e) => setData("is_sslcommerz_enabled", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF1F5B]" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-8 grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1", children: "Store ID" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: data.sslcommerz_store_id,
                onChange: (e) => setData("sslcommerz_store_id", e.target.value),
                className: "w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all font-mono",
                placeholder: "..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1", children: "Store Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                value: data.sslcommerz_store_password,
                onChange: (e) => setData("sslcommerz_store_password", e.target.value),
                className: "w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all font-mono",
                placeholder: "..."
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm p-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-2 rounded-xl text-white", children: /* @__PURE__ */ jsx(ShieldCheck, { size: 18 }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight", children: "Quota & Trial Strategy" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-12", children: [
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest", children: "Default Trial Duration" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium mb-3", children: "Days of Pro Tier access given to new containers." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  min: "0",
                  max: "30",
                  className: "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600",
                  value: data.default_trial_days,
                  onChange: (e) => setData("default_trial_days", e.target.value)
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-indigo-600 w-12 text-center", children: [
                data.default_trial_days,
                "d"
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-900 uppercase tracking-widest", children: "Quota Alert Threshold" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium mb-3", children: "Trigger AI Advisor notification when usage exceeds % limit." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "range",
                  min: "50",
                  max: "100",
                  className: "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600",
                  value: data.quota_alert_percent,
                  onChange: (e) => setData("quota_alert_percent", e.target.value)
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-indigo-600 w-12 text-center", children: [
                data.quota_alert_percent,
                "%"
              ] })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-tight", children: [
          /* @__PURE__ */ jsx(Lock, { size: 12 }),
          " Encrypted at rest in GlobalSettings"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "px-8 py-3.5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl shadow-indigo-100 transition-all flex items-center gap-2",
            children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { size: 16 }),
              " Save Configurations"
            ] })
          }
        )
      ] })
    ] })
  ] });
};
export {
  BillingSettingsPage as default
};
