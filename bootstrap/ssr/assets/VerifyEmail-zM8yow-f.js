import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Mail, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
function VerifyEmail({ status }) {
  const { post, processing } = useForm({});
  const submit = (e) => {
    e.preventDefault();
    post(route("verification.send"), {
      onSuccess: () => toast.success("Verification link sent!")
    });
  };
  const verificationLinkSent = status === "verification-link-sent";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-700", children: [
    /* @__PURE__ */ jsx(Head, { title: "Verify Email - Platform Hub" }),
    /* @__PURE__ */ jsx(Toaster, { position: "top-right" }),
    /* @__PURE__ */ jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100 rotate-3", children: /* @__PURE__ */ jsx(Mail, { className: "w-8 h-8 text-white" }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-black text-slate-900 tracking-tight", children: "Check your inbox" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-slate-500 font-medium max-w-xs mx-auto", children: "We've sent a verification link to your email. Please click it to activate your account." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white py-10 px-6 shadow-2xl shadow-slate-100 sm:rounded-3xl border border-slate-100 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          verificationLinkSent && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-emerald-900", children: "Link Sent!" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-700 font-medium mt-0.5", children: "A new verification link has been sent to your email address." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                disabled: processing,
                className: "w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50",
                children: processing ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }) : "Resend Verification Email"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center pt-2", children: /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("central.logout"),
                method: "post",
                as: "button",
                className: "text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3 transition-transform group-hover:-translate-x-1" }),
                  "Sign out and try another email"
                ]
              }
            ) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-widest", children: "Need help? Contact support@yourplatform.com" }) })
    ] })
  ] });
}
export {
  VerifyEmail as default
};
