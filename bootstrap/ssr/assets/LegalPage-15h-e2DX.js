import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ScrollText, ShieldCheck } from "lucide-react";
import { B as Button } from "./button-Dwr8R-lW.js";
import "@radix-ui/react-slot";
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
import "@tanstack/react-query";
function LegalPage({ title, content }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8FAFC] py-12 px-6 lg:py-24 font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: `${title} | PixelMaster` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-12", children: /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          className: "text-slate-500 hover:text-emerald-600 transition-colors p-0 flex items-center gap-2 group",
          onClick: () => window.history.back(),
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 group-hover:-translate-x-1 transition-transform" }),
            "Back"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 lg:p-16 mb-8 overflow-hidden relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-8 opacity-[0.03]", children: title.includes("Terms") ? /* @__PURE__ */ jsx(ScrollText, { className: "h-64 w-64 text-slate-900" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "h-64 w-64 text-slate-900" }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-6", children: "Legal Documents" }),
          /* @__PURE__ */ jsx("h1", { className: "text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4", children: title }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate-500 text-lg leading-relaxed max-w-2xl", children: [
            "Please read these ",
            title.toLowerCase(),
            " carefully before using PixelMaster platforms and services."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 lg:p-16", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "prose prose-slate max-w-none \n              prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight\n              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg\n              prose-li:text-slate-600 prose-li:text-lg\n              prose-strong:text-slate-900 prose-strong:font-bold\n              prose-a:text-emerald-600 prose-a:underline hover:prose-a:text-emerald-700\n            ",
            dangerouslySetInnerHTML: { __html: content }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-16 pt-12 border-t border-slate-100 text-center", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-slate-400 text-sm italic mb-8", children: [
            "Last updated: ",
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
            /* @__PURE__ */ jsx(Link, { href: "/onboarding", children: /* @__PURE__ */ jsx(Button, { className: "bg-[#10B981] hover:bg-[#059669] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200", children: "Get Started Now" }) }),
            /* @__PURE__ */ jsx(Link, { href: "/", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "text-slate-500 font-bold h-12 px-8 rounded-xl", children: "Back to Home" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-slate-400 text-[13px] font-medium", children: [
        "Questions about our documents? ",
        /* @__PURE__ */ jsx("a", { href: "mailto:support@pixelmaster.com", className: "text-slate-600 underline", children: "Contact our legal team." })
      ] }) })
    ] })
  ] });
}
export {
  LegalPage as default
};
