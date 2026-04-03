import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Zap, Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import { usePage, router } from "@inertiajs/react";
const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { errors, tenant, settings } = usePage().props;
  const tenantName = (tenant == null ? void 0 : tenant.tenant_name) || (tenant == null ? void 0 : tenant.id) || "Dashboard";
  const appName = (settings == null ? void 0 : settings.app_name) || "Platform OS";
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    router.post("/auth/login", { email, password }, {
      onFinish: () => setIsLoading(false)
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-[400px] space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-2", children: /* @__PURE__ */ jsx(Zap, { className: "h-7 w-7 text-primary-foreground fill-primary-foreground" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: tenantName }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sign in to continue to your dashboard" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl shadow-black/5 p-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-foreground", children: "Email" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/60" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "you@company.com",
                autoComplete: "email",
                autoFocus: true,
                className: "w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                required: true
              }
            )
          ] }),
          (errors == null ? void 0 : errors.email) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-destructive flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block w-1 h-1 rounded-full bg-destructive" }),
            errors.email
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-sm font-medium text-foreground", children: "Password" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "text-xs text-primary/80 hover:text-primary transition-colors",
                tabIndex: -1,
                children: "Forgot password?"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/60" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "password",
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "Enter your password",
                autoComplete: "current-password",
                className: "w-full rounded-xl border border-border bg-background pl-11 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors",
                tabIndex: -1,
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ jsx(Eye, { className: "h-[18px] w-[18px]" })
              }
            )
          ] }),
          (errors == null ? void 0 : errors.password) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-destructive flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block w-1 h-1 rounded-full bg-destructive" }),
            errors.password
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "remember",
              name: "remember",
              className: "h-4 w-4 rounded border-border accent-primary cursor-pointer"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "remember", className: "text-sm text-muted-foreground cursor-pointer select-none", children: "Keep me signed in" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isLoading || !email || !password,
            className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20",
            children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
              /* @__PURE__ */ jsx("span", { children: "Signing in..." })
            ] }) : "Sign In"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-muted-foreground/60", children: [
        "Powered by ",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-muted-foreground", children: appName })
      ] })
    ] })
  ] });
};
export {
  Auth as default
};
