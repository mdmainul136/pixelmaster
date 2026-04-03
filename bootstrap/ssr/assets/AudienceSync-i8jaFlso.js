import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { Head, router } from "@inertiajs/react";
import { Cloud, ShieldCheck, Zap, Target, RefreshCcw, Plus, Facebook, Globe, ArrowRight, AlertTriangle } from "lucide-react";
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
const AudienceSync = ({ sync_status = [], available_platforms = [], segments = [] }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(available_platforms[0]);
  const [selectedSegment, setSelectedSegment] = useState(segments[0]);
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data } = await axios.post(route("user.sgtm.audience-sync.trigger"), {
        segment: selectedSegment,
        platform: selectedPlatform
      });
      if (data.success) {
        toast.success(data.message);
        router.reload({ preserveScroll: true });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Audience sync failed. Please check API configuration.");
    } finally {
      setIsSyncing(false);
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Audience Sync — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white", children: /* @__PURE__ */ jsx(Cloud, { size: 20 }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Direct Audience Sync" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium ml-12", children: [
          "Push segments from CDP directly to ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-bold underline decoration-indigo-200 decoration-2", children: "Ad Platform Custom Audiences" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border border-indigo-100", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { size: 16 }),
        " Privacy-Safe Hashing Active"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-5", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm h-full", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Zap, { size: 18, fill: "currentColor", className: "text-amber-500" }),
          " New Sync Connection"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block", children: "1. Select Destination Platform" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: available_platforms.map((p) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedPlatform(p),
                className: `p-4 rounded-2xl border-2 text-left transition-all ${selectedPlatform === p ? "bg-indigo-50 border-indigo-500 text-indigo-900" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"}`,
                children: /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase tracking-tight", children: p })
              },
              p
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block", children: "2. Select Segment from CDP" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: selectedSegment,
                onChange: (e) => setSelectedSegment(e.target.value),
                className: "w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer",
                children: segments.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s }, s))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-900 rounded-[2rem] text-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 bg-white/10 rounded-xl", children: /* @__PURE__ */ jsx(Target, { size: 18, className: "text-indigo-400" }) }),
              /* @__PURE__ */ jsx("h4", { className: "text-[11px] font-black uppercase tracking-widest", children: "Expected Outcome" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 font-medium leading-relaxed", children: [
              "Pushing the ",
              /* @__PURE__ */ jsxs("span", { className: "text-white", children: [
                '"',
                selectedSegment,
                '"'
              ] }),
              " segment to ",
              /* @__PURE__ */ jsx("span", { className: "text-white", children: selectedPlatform }),
              " will update the corresponding Custom Audience via API. Identifiers are SHA-256 hashed locally before transmission."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleSync,
              disabled: isSyncing,
              className: "w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100",
              children: [
                isSyncing ? /* @__PURE__ */ jsx(RefreshCcw, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
                isSyncing ? "Synchronizing Intelligence..." : "Start Audience Push"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-7", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden h-full flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Activity, { size: 18, className: "text-slate-400" }),
            " Active Sync Status"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => router.reload({ preserveScroll: true }),
              className: "p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all",
              children: /* @__PURE__ */ jsx(RefreshCcw, { size: 16 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-10 divide-y divide-slate-50", children: sync_status.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "py-6 first:pt-0 last:pb-0 flex items-center justify-between group", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-all border border-slate-100", children: item.platform === "Facebook" ? /* @__PURE__ */ jsx(Facebook, { size: 24, className: "text-blue-600" }) : /* @__PURE__ */ jsx(Globe, { size: 24, className: "text-slate-400" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-tight", children: item.segment }),
                /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${item.status === "Synced" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`, children: item.status })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 font-medium", children: [
                "Mapped to ",
                item.platform,
                " Audience — ",
                item.count,
                " Identifiers"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-900 uppercase tracking-tighter mb-1", children: item.last_sync }),
            /* @__PURE__ */ jsxs("button", { className: "text-[9px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 ml-auto", children: [
              "Details ",
              /* @__PURE__ */ jsx(ArrowRight, { size: 12 })
            ] })
          ] })
        ] }, idx)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-auto p-10 bg-slate-50 border-t border-slate-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-50 rounded-xl text-amber-600", children: /* @__PURE__ */ jsx(AlertTriangle, { size: 18 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-slate-900 uppercase leading-none mb-1", children: "Sync Schedule Note" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] text-slate-500 font-medium leading-relaxed", children: "Automatic daily re-syncing is only available for **Pro & Enterprise** plans. Current manual syncing is active for the Starter plan." })
          ] })
        ] }) })
      ] }) })
    ] })
  ] });
};
export {
  AudienceSync as default
};
