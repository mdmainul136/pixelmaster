import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { ShoppingBag, ExternalLink, RefreshCw, Zap, Code, ShieldCheck, Server, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
const StatusBadge = ({ success, label }) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${success ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`, children: [
  success ? /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }) : /* @__PURE__ */ jsx(XCircle, { size: 12 }),
  label
] });
const ShopifyIntegration = ({ shop, container }) => {
  var _a;
  const [status, setStatus] = useState(((_a = shop.settings) == null ? void 0 : _a.setup_status) || {});
  const [loading, setLoading] = useState(false);
  const runSetup = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/tracking/shopify/shops/${shop.id}/setup`);
      setStatus(res.data.data);
    } catch (error) {
      console.error("Setup failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Shopify Integration — ${shop.shop_name}` }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-[#96bf48] p-2.5 rounded-2xl shadow-lg shadow-emerald-100 text-white", children: /* @__PURE__ */ jsx(ShoppingBag, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Shopify Ecosystem Sync" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Connected to ",
          /* @__PURE__ */ jsx("span", { className: "text-slate-900 font-bold", children: shop.shop_domain }),
          " via OAuth 2.0."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: `https://${shop.shop_domain}/admin`,
            target: "_blank",
            className: "px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2",
            children: [
              "Store Admin ",
              /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: runSetup,
            disabled: loading,
            className: "px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50",
            children: [
              loading ? /* @__PURE__ */ jsx(RefreshCw, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsx(Zap, { size: 14 }),
              "Sync Integration"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-12", children: /* @__PURE__ */ jsx("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Code, { size: 40 }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-widest text-slate-400 mb-4", children: "Script Injection" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900 mb-2", children: "sGTM Master Loader" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium mb-6 leading-relaxed", children: "Injects the Google Tag Manager container dynamically through your first-party sGTM proxy." }),
          /* @__PURE__ */ jsx(StatusBadge, { success: status.script_tag, label: status.script_tag ? "Active" : "Pending" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Activity, { size: 40 }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-widest text-slate-400 mb-4", children: "Event Webhooks" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900 mb-2", children: "Back-office Signals" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium mb-6 leading-relaxed", children: "Registers webhooks for Orders, Refunds, and Checkouts to ensure 100% server-side accuracy." }),
          /* @__PURE__ */ jsx(StatusBadge, { success: status.webhooks, label: status.webhooks ? "Connected" : "Pending" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(ShieldCheck, { size: 40 }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xs font-black uppercase tracking-widest text-slate-400 mb-4", children: "Identity Sync" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900 mb-2", children: "Metafield Config" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium mb-6 leading-relaxed", children: "Pushes encryption keys and container configurations to Shopify metafields for Liquid-side resolution." }),
          /* @__PURE__ */ jsx(StatusBadge, { success: status.metafields, label: status.metafields ? "Pushed" : "Pending" })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-10", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400", children: /* @__PURE__ */ jsx(BarChart3, { size: 24 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-black tracking-tight", children: "Real vs Reported Revenue" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest", children: "Shopify Financial Reconciliation" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-10", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-black uppercase tracking-widest", children: "Shopify Total" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-black", children: "$12,450" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-black uppercase tracking-widest", children: "Platform Tracked" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-black", children: "$12,410" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-500 font-black uppercase tracking-widest", children: "Accuracy Gap" }),
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-emerald-400", children: "99.7%" }),
            /* @__PURE__ */ jsx("div", { className: "h-1 bg-white/10 rounded-full mt-2 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-emerald-400 w-[99.7%]" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Server, { size: 18, className: "text-indigo-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-300 uppercase", children: "Seamless sGTM Handshake Active" })
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "text-[10px] font-black text-white hover:text-indigo-400 transition-colors flex items-center gap-2 uppercase tracking-widest", children: [
            "Manage Webhooks ",
            /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-widest mb-6 block", children: "Theme App Extension" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-500 font-medium leading-relaxed mb-6", children: [
            "We've detected your theme supports ",
            /* @__PURE__ */ jsx("strong", { children: "App Blocks" }),
            ". Enabling the PixelMaster app block manually in your theme customizer provides the best performance and first-party cookie stability."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-slate-50 rounded-xl", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-amber-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-700", children: "App Block Not Detected" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "w-full mt-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-50 hover:bg-indigo-700 transition-all", children: "Open Theme Customizer" })
      ] }) })
    ] })
  ] });
};
export {
  ShopifyIntegration as default
};
