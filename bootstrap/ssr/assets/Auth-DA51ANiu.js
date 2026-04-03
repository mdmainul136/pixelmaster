import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { router, Link } from "@inertiajs/react";
import { u as useToast } from "../ssr.js";
import axios from "axios";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
const login = async (credentials) => {
  const res = await axios.post("/api/v1/auth/login", credentials);
  return res.data;
};
const setAuthCookie = (token) => {
  document.cookie = `token=${token}; path=/; max-age=86400`;
};
const Auth = ({ google_login_enabled, facebook_login_enabled }) => {
  const { toast } = useToast();
  const [isCentral, setIsCentral] = useState(false);
  const [storeInfo, setStoreInfo] = useState({ name: "PixelMaster", logo: null });
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    hostname.split(".");
    const isCentralDomain = hostname === "localhost" || hostname === "pixelmaster.com" || hostname === "www.pixelmaster.com";
    setIsCentral(isCentralDomain);
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (token) {
      setLoadingToken(false);
      setAuthCookie(token);
      toast({ title: "Session initialized", description: "Launching your dashboard..." });
      setTimeout(() => {
        router.visit("/dashboard");
      }, 500);
    } else {
      const tenantId = searchParams.get("tenant_id");
      if (tenantId) {
        localStorage.setItem("tenant_id", tenantId);
        setIsCentral(true);
      }
      setLoadingToken(false);
    }
  }, [router, toast]);
  const handleAuth = async (e) => {
    var _a;
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await login(credentials);
      if (res.success) {
        toast({ title: "Success", description: "Welcome back! Redirecting..." });
        if ((_a = res.data) == null ? void 0 : _a.token) {
          setAuthCookie(res.data.token);
        }
        setTimeout(() => router.visit("/dashboard"), 1e3);
      } else {
        if (res.requires_onboarding) {
          toast({ title: "Account Not Found", description: "Redirecting to registration..." });
          const centralUrl = window.location.hostname.endsWith(".localhost") ? `http://localhost:${window.location.port}/onboarding` : `https://pixelmaster.com/onboarding`;
          setTimeout(() => window.location.href = centralUrl, 1500);
          return;
        }
        toast({ variant: "destructive", title: "Authentication Failed", description: res.message || "Invalid credentials" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoggingIn(false);
    }
  };
  if (loadingToken) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#F8FAFC]", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 blur-[100px]" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[440px] z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-8 lg:p-12 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5", children: /* @__PURE__ */ jsx(Lock, { className: "h-7 w-7 text-primary" }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight text-slate-900", children: isCentral ? "PixelMaster" : storeInfo.name }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-[15px] font-medium leading-relaxed", children: isCentral ? "Admin Central Orchestration" : "Storefront Management Console" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleAuth, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1", children: "Email Address" }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: credentials.email,
                  onChange: (e) => setCredentials({ ...credentials, email: e.target.value }),
                  placeholder: "admin@example.com",
                  className: "w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-300",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] uppercase tracking-widest font-black text-slate-400", children: "Password" }),
              /* @__PURE__ */ jsx(Link, { href: "#", className: "text-[11px] font-bold text-primary hover:underline", children: "Forgot password?" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  value: credentials.password,
                  onChange: (e) => setCredentials({ ...credentials, password: e.target.value }),
                  placeholder: "••••••••",
                  className: "w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-300",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isLoggingIn,
              className: "w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4",
              children: isLoggingIn ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }),
                " Authenticating..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                "Sign In to Dashboard ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
              ] })
            }
          )
        ] }),
        (google_login_enabled || facebook_login_enabled) && /* @__PURE__ */ jsxs("div", { className: "space-y-5 pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-slate-100" }) }),
            /* @__PURE__ */ jsx("span", { className: "relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]", children: "Social Gateway" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: google_login_enabled && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => window.location.href = window.route("auth.google"),
              className: "flex items-center justify-center gap-3 w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-sm",
              children: [
                /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
                ] }),
                "Continue with Google"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-6 text-center space-y-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 font-medium", children: [
            "New to PixelMaster?",
            " ",
            /* @__PURE__ */ jsx("button", { onClick: () => router.visit("/onboarding"), className: "text-primary font-black hover:underline underline-offset-4", children: "Register Platform" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-6 border-t border-slate-50 flex justify-center", children: /* @__PURE__ */ jsxs(Link, { href: "/", className: "text-[11px] hover:text-primary transition-colors uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 rotate-180" }),
            " Back to Entrance"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center mt-8 text-[11px] text-slate-400 font-medium uppercase tracking-widest", children: "© 2026 PixelMaster • Security Verified 🛡️" })
    ] })
  ] });
};
export {
  Auth as default
};
