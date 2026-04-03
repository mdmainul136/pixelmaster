import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { B as Button } from "./button-Dwr8R-lW.js";
import { I as Input } from "./input-CdwQDcVi.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Mail, Building2, Lock, Loader2, ArrowRight, Chrome } from "lucide-react";
import { c as cn } from "../ssr.js";
import { C as Card, a as CardContent } from "./card-ByYW05sv.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
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
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
function Onboarding({ google_login_enabled, facebook_login_enabled }) {
  const [isAgency, setIsAgency] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    adminEmail: "",
    password: "",
    // Added password field
    agency_name: "",
    server_location: "global",
    marketing_consent: false,
    terms_consent: false,
    is_agency: false
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(window.route("central.register.submit"), {
      onSuccess: () => window.location.href = window.route("verification.notice")
    });
  };
  const toggleAgency = (mode) => {
    setIsAgency(mode);
    setData("is_agency", mode);
  };
  const canProceed = data.adminEmail && data.password && data.terms_consent && (!isAgency || data.agency_name);
  if (isSuccess) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#F0FDFB] flex items-center justify-center p-6 font-sans", children: /* @__PURE__ */ jsxs(Card, { className: "max-w-md w-full border-none shadow-2xl rounded-[32px] p-10 text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Mail, { className: "h-10 w-10 text-emerald-600" }) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-slate-900 font-mono", children: "Check your email" }),
      /* @__PURE__ */ jsxs("p", { className: "text-slate-600 leading-relaxed font-sans mt-4", children: [
        "We've sent a verification link to ",
        /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-600", children: data.adminEmail }),
        ". Please click the link to verify your account and set your password."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "pt-6", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          className: "w-full rounded-xl py-6 border-slate-200 text-slate-500 font-bold",
          onClick: () => window.location.href = "/",
          children: "Back to home"
        }
      ) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(Head, { title: `${isAgency ? "Agency" : ""} Sign Up | PixelMaster` }),
    /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-emerald-400/20 blur-[120px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px]" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 text-center space-y-4 z-10", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-black text-slate-900 tracking-tight leading-none mb-4", children: isAgency ? "Agency Portal" : "Join PixelMaster" }),
      /* @__PURE__ */ jsxs("p", { className: "text-[15px] text-slate-500 font-medium", children: [
        "Already orchestrated? ",
        /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-primary font-black hover:underline underline-offset-4", children: "Sign in." }),
        !isAgency ? /* @__PURE__ */ jsxs("span", { className: "ml-2 border-l border-slate-200 pl-4 py-1 inline-block font-sans", children: [
          "Running an agency? ",
          /* @__PURE__ */ jsx("button", { onClick: () => toggleAgency(true), className: "text-emerald-600 underline font-bold hover:text-emerald-700 decoration-2", children: "Partner with us." })
        ] }) : /* @__PURE__ */ jsxs("span", { className: "ml-2 border-l border-slate-200 pl-4 py-1 inline-block font-sans", children: [
          "Regular user? ",
          /* @__PURE__ */ jsx("button", { onClick: () => toggleAgency(false), className: "text-emerald-600 underline font-bold hover:text-emerald-700 decoration-2", children: "Switch back." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-xl w-full z-10", children: [
      /* @__PURE__ */ jsx(Card, { className: "w-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white", children: /* @__PURE__ */ jsx(CardContent, { className: "p-10 lg:p-16 space-y-10", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          isAgency && /* @__PURE__ */ jsxs("div", { className: "space-y-2 animate-in fade-in slide-in-from-top-2 duration-300", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1", children: "Agency Brand Name" }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  placeholder: "e.g. PixelFlow Agency",
                  value: data.agency_name,
                  onChange: (e) => setData("agency_name", e.target.value),
                  className: "h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                }
              ),
              /* @__PURE__ */ jsx(Building2, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" }),
              errors.agency_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-2 font-medium", children: errors.agency_name })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1", children: "Administrative Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "email",
                  placeholder: "admin@yourdomain.com",
                  value: data.adminEmail,
                  onChange: (e) => setData("adminEmail", e.target.value),
                  className: "h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                }
              ),
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" }),
              errors.adminEmail && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-2 font-medium font-sans", children: errors.adminEmail })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1", children: "Security Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "password",
                  placeholder: "••••••••",
                  value: data.password,
                  onChange: (e) => setData("password", e.target.value),
                  className: "h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                }
              ),
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" }),
              errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-2 font-medium font-sans", children: errors.password })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-slate-500 text-[13px] px-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-sans", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "terms",
                checked: data.terms_consent,
                onCheckedChange: (checked) => setData("terms_consent", !!checked),
                className: "mt-1 border-slate-300 h-5 w-5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-none"
              }
            ),
            /* @__PURE__ */ jsxs("label", { htmlFor: "terms", className: "leading-5 cursor-pointer font-medium", children: [
              "I agree to the ",
              /* @__PURE__ */ jsx(Link, { href: window.route("central.terms"), className: "underline text-primary font-black hover:text-blue-700", children: "Terms of Service" }),
              " and ",
              /* @__PURE__ */ jsx(Link, { href: window.route("central.privacy"), className: "underline text-primary font-black hover:text-blue-700", children: "Privacy Policy" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "marketing",
                checked: data.marketing_consent,
                onCheckedChange: (checked) => setData("marketing_consent", !!checked),
                className: "mt-1 border-slate-300 h-5 w-5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-none"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "marketing", className: "leading-5 cursor-pointer font-medium", children: "Send me security alerts and marketing updates (Optional)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "submit",
              disabled: processing || !canProceed,
              className: "w-full h-16 bg-primary hover:bg-blue-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50",
              children: [
                processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }),
                "Initialize Platform"
              ]
            }
          ),
          google_login_enabled && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              type: "button",
              onClick: () => window.location.href = window.route("auth.google"),
              className: "w-full h-16 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-sm font-sans",
              children: [
                /* @__PURE__ */ jsx(Chrome, { className: "h-5 w-5" }),
                "Sign up with Google"
              ]
            }
          )
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("p", { className: "text-center mt-12 text-[11px] text-slate-400 font-medium uppercase tracking-widest italic", children: "Powering 5,000+ server-side tracking containers worldwide." })
    ] })
  ] });
}
export {
  Onboarding as default
};
