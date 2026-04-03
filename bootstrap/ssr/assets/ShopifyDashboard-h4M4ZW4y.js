import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, CheckCircle2, Database, ExternalLink, RefreshCcw, Package, Clock, Activity, Webhook, Layers, ShieldCheck, Zap, ChevronRight, Tag, CircleDot } from "lucide-react";
import "@tanstack/react-query";
import "axios";
import "class-variance-authority";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "sonner";
import "@radix-ui/react-tooltip";
const Badge = ({ children, variant = "success" }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-[0.5px] ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100"
  };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${styles[variant]}`, children: [
    /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-current opacity-70" }),
    children
  ] });
};
const StatCard = ({ label, value, icon: Icon, accent = "indigo", delay = 0 }) => /* @__PURE__ */ jsxs(
  motion.div,
  {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
    className: "bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-200 hover:shadow-md transition-all duration-300 group",
    children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: label }),
        /* @__PURE__ */ jsx("div", { className: `w-8 h-8 rounded-xl flex items-center justify-center bg-${accent}-50 text-${accent}-500 group-hover:scale-110 transition-transform`, children: /* @__PURE__ */ jsx(Icon, { size: 15 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-slate-900 tracking-tight", children: value })
    ]
  }
);
const CheckRow = ({ label, status = "ok" }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx(CircleDot, { size: 13, className: "text-slate-300" }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-widest", children: label })
  ] }),
  status === "ok" ? /* @__PURE__ */ jsx(CheckCircle2, { size: 16, className: "text-emerald-500" }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-amber-500 uppercase", children: "Pending" })
] });
const ShopifyDashboard = ({ shop }) => {
  const { post, processing } = useForm();
  const [syncStatus, setSyncStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const handleSync = () => {
    post(route("api.tracking.shopify.sync-products", { id: shop == null ? void 0 : shop.id }), {
      onSuccess: () => {
        setSyncStatus({ type: "success", message: "All products synced successfully" });
        setTimeout(() => setSyncStatus(null), 6e3);
      },
      onError: () => setSyncStatus({ type: "error", message: "Sync failed — check connection" })
    });
  };
  const tabs = ["overview", "data nodes", "settings"];
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Shopify — PixelMaster Tracking" }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
        className: "flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-[#111827] rounded-2xl flex items-center justify-center text-white shadow-xl", children: /* @__PURE__ */ jsx(ShoppingBag, { size: 26, strokeWidth: 1.8 }) }),
              /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center", children: /* @__PURE__ */ jsx(CheckCircle2, { size: 11, className: "text-white", strokeWidth: 3 }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1.5", children: [
                /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-slate-900 tracking-tight", children: "Shopify Integration" }),
                /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Connected" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400 font-medium flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Database, { size: 13, className: "text-slate-300" }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[12px]", children: (shop == null ? void 0 : shop.domain) ?? "shop.myshopify.com" }),
                /* @__PURE__ */ jsx("span", { className: "text-slate-200", children: "·" }),
                /* @__PURE__ */ jsxs("span", { className: "text-indigo-500 font-bold text-[11px]", children: [
                  "sGTM #",
                  (shop == null ? void 0 : shop.container_id) ?? "—"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: `https://${(shop == null ? void 0 : shop.domain) ?? "#"}/admin`,
                target: "_blank",
                className: "px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2",
                children: [
                  "Shopify Admin ",
                  /* @__PURE__ */ jsx(ExternalLink, { size: 13 })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleSync,
                disabled: processing,
                className: "px-5 py-2.5 rounded-xl text-[11px] font-bold bg-[#111827] text-white hover:bg-indigo-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-slate-900/10",
                children: [
                  /* @__PURE__ */ jsx(RefreshCcw, { size: 13, className: processing ? "animate-spin" : "" }),
                  processing ? "Syncing..." : "Sync Catalogue"
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: syncStatus && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -8, height: 0 },
        animate: { opacity: 1, y: 0, height: "auto" },
        exit: { opacity: 0, height: 0 },
        className: `mb-6 px-5 py-4 rounded-2xl text-[11px] font-semibold flex items-center gap-3 border ${syncStatus.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`,
        children: [
          /* @__PURE__ */ jsx(CheckCircle2, { size: 16 }),
          syncStatus.message
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Products Synced", value: (shop == null ? void 0 : shop.product_count) ?? "—", icon: Package, accent: "indigo", delay: 0.05 }),
      /* @__PURE__ */ jsx(StatCard, { label: "Last Sync", value: (shop == null ? void 0 : shop.last_sync) ?? "Never", icon: Clock, accent: "violet", delay: 0.1 }),
      /* @__PURE__ */ jsx(StatCard, { label: "Events Today", value: (shop == null ? void 0 : shop.events_today) ?? "—", icon: Activity, accent: "emerald", delay: 0.15 }),
      /* @__PURE__ */ jsx(StatCard, { label: "Active Webhooks", value: "3", icon: Webhook, accent: "blue", delay: 0.2 })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-8 p-1 bg-slate-100 rounded-xl w-fit", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: `px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
        children: tab
      },
      tab
    )) }),
    /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
      activeTab === "overview" && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.25 },
          className: "grid grid-cols-12 gap-6",
          children: [
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.05 },
                className: "col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-3xl overflow-hidden",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-8 py-5 border-b border-slate-50", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsx(Layers, { size: 17, className: "text-indigo-500" }),
                      /* @__PURE__ */ jsx("h2", { className: "text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]", children: "Catalogue Sync" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxs("span", { className: "relative flex h-2 w-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }),
                        /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })
                      ] }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-400 uppercase tracking-widest", children: "Webhook Active" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 leading-relaxed mb-8 max-w-lg", children: "Products, variants, pricing, and inventory are synchronized in real-time via webhooks. Use the manual trigger for initial setup or post-migration corrections only." }),
                    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [
                      { label: "products/create", status: "registered" },
                      { label: "products/update", status: "registered" },
                      { label: "products/delete", status: "registered" }
                    ].map(({ label, status }) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 rounded-2xl p-4 border border-slate-100", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-emerald-600 uppercase mb-2", children: status }),
                      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] text-slate-700 font-semibold", children: label })
                    ] }, label)) }),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: handleSync,
                        disabled: processing,
                        className: "w-full py-4 bg-[#111827] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] hover:bg-indigo-600 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2.5 group shadow-lg shadow-slate-900/10",
                        children: [
                          /* @__PURE__ */ jsx(RefreshCcw, { size: 14, className: processing ? "animate-spin" : "group-hover:rotate-[360deg] transition-transform duration-700" }),
                          processing ? "Running Full Catalogue Sync..." : "Trigger Full Catalogue Sync"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "px-8 py-4 bg-slate-50/60 border-t border-slate-50 flex items-center gap-6 flex-wrap", children: [
                    ["Webhook API", "2024-01"],
                    ["Read Scope", "Granted"],
                    ["Write Scope", "Granted"]
                  ].map(([k, v]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-medium uppercase tracking-widest", children: k }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-700 font-black uppercase", children: v })
                  ] }, k)) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-4 space-y-5", children: [
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1 },
                  className: "bg-white border border-slate-100 rounded-3xl p-6",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-5", children: [
                      /* @__PURE__ */ jsx(ShieldCheck, { size: 16, className: "text-slate-400" }),
                      /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black text-slate-700 uppercase tracking-[0.18em]", children: "System Checks" })
                    ] }),
                    /* @__PURE__ */ jsx(CheckRow, { label: "OAuth Token", status: "ok" }),
                    /* @__PURE__ */ jsx(CheckRow, { label: "HMAC Verification", status: "ok" }),
                    /* @__PURE__ */ jsx(CheckRow, { label: "Consent Mode V2", status: "ok" }),
                    /* @__PURE__ */ jsx(CheckRow, { label: "sGTM Container", status: (shop == null ? void 0 : shop.container_id) ? "ok" : "pending" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.18 },
                  className: "bg-[#111827] rounded-3xl p-6 text-white",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-6", children: [
                      /* @__PURE__ */ jsx(Zap, { size: 15, className: "text-indigo-400" }),
                      /* @__PURE__ */ jsx("h3", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300", children: "Tracked Events" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [
                      ["page_view", "view_item", "add_to_cart"],
                      ["begin_checkout", "purchase", "refund"]
                    ].flat().map((event) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2 border-b border-white/5 last:border-0", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-slate-300", children: event }),
                      /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" })
                    ] }, event)) }),
                    /* @__PURE__ */ jsxs(
                      Link,
                      {
                        href: "#",
                        className: "mt-5 flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors",
                        children: [
                          "View All Events ",
                          /* @__PURE__ */ jsx(ChevronRight, { size: 13 })
                        ]
                      }
                    )
                  ]
                }
              )
            ] })
          ]
        },
        "overview"
      ),
      activeTab === "data nodes" && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "bg-white border border-slate-100 rounded-3xl p-8",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
              /* @__PURE__ */ jsx(Database, { size: 17, className: "text-indigo-500" }),
              /* @__PURE__ */ jsx("h2", { className: "text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]", children: "Connected Data Nodes" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              { label: "GA4 Measurement Protocol", status: "active", tag: "G-XXXXXXXXXX" },
              { label: "Facebook CAPI", status: "active", tag: "Meta Pixel" },
              { label: "TikTok Events API", status: "pending", tag: "Not configured" },
              { label: "Snapchat CAPI", status: "pending", tag: "Not configured" }
            ].map(({ label, status, tag }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 hover:bg-indigo-50/30 transition-all", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] font-bold text-slate-700 mb-1", children: label }),
                /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] text-slate-400", children: tag })
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: status === "active" ? "success" : "warning", children: status })
            ] }, label)) })
          ]
        },
        "data-nodes"
      ),
      activeTab === "settings" && /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "bg-white border border-slate-100 rounded-3xl p-8",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
              /* @__PURE__ */ jsx(Tag, { size: 17, className: "text-slate-400" }),
              /* @__PURE__ */ jsx("h2", { className: "text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]", children: "Integration Settings" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-6 max-w-lg", children: [
              { label: "Shop Domain", value: (shop == null ? void 0 : shop.domain) ?? "Not set" },
              { label: "Access Token", value: "••••••••••••••••••••" },
              { label: "Webhook Secret", value: "••••••••••••••" },
              { label: "API Version", value: "2024-01" }
            ].map(({ label, value }) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-4 border-b border-slate-50", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-widest", children: label }),
              /* @__PURE__ */ jsx("span", { className: "text-[12px] font-mono font-semibold text-slate-800", children: value })
            ] }, label)) })
          ]
        },
        "settings"
      )
    ] })
  ] });
};
export {
  ShopifyDashboard as default
};
