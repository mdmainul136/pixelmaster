import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { ArrowLeft, ShieldCheck, ShieldAlert, Loader2, RefreshCw, Key, Check, Copy } from "lucide-react";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
function TwoFactor({ twoFactorEnabled }) {
  const [setupData, setSetupData] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const route = window.route;
  const confirmForm = useForm({
    code: ""
  });
  const disableForm = useForm({});
  const startSetup = async () => {
    setIsEnabling(true);
    try {
      const { data } = await axios.post(route("tenant.profile.two-factor.enable"));
      setSetupData(data);
    } catch (error) {
      toast.error("Failed to initialize 2FA setup.");
    } finally {
      setIsEnabling(false);
    }
  };
  const submitConfirm = (e) => {
    e.preventDefault();
    confirmForm.post(route("tenant.profile.two-factor.confirm"), {
      preserveScroll: true,
      onSuccess: () => {
        setSetupData(null);
        confirmForm.reset();
        fetchRecoveryCodes();
      },
      onError: () => confirmForm.reset("code")
    });
  };
  const disable2FA = () => {
    disableForm.delete(route("tenant.profile.two-factor.disable"), {
      preserveScroll: true,
      onSuccess: () => {
        setRecoveryCodes([]);
        setSetupData(null);
      }
    });
  };
  const fetchRecoveryCodes = async () => {
    try {
      const { data } = await axios.get(route("tenant.profile.two-factor.recovery-codes"));
      setRecoveryCodes(data.recovery_codes || []);
    } catch (error) {
      toast.error("Failed to load recovery codes.");
    }
  };
  const regenerateRecoveryCodes = async () => {
    try {
      const { data } = await axios.post(route("tenant.profile.two-factor.recovery-codes"));
      setRecoveryCodes(data.recovery_codes || []);
      toast.success("Recovery codes regenerated successfully.");
    } catch (error) {
      toast.error("Failed to regenerate recovery codes.");
    }
  };
  const copyToClipboard = () => {
    const text = recoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Recovery codes copied to clipboard.");
    setTimeout(() => setIsCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Two-Factor Authentication" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("tenant.profile"),
          className: "rounded-lg p-2 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5 text-muted-foreground" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Two-Factor Authentication" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Add additional security to your account using two-factor authentication." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-6", children: [
      /* @__PURE__ */ jsx("section", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: `mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${twoFactorEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`, children: twoFactorEnabled ? /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-card-foreground", children: twoFactorEnabled ? "You have enabled two-factor authentication." : "You have not enabled two-factor authentication." }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl", children: "When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application." }),
          !twoFactorEnabled && !setupData && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(Button, { onClick: startSetup, disabled: isEnabling, children: [
            isEnabling && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Enable Two-Factor"
          ] }) }),
          twoFactorEnabled && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
            recoveryCodes.length === 0 ? /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: fetchRecoveryCodes, children: "Show Recovery Codes" }) : /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: regenerateRecoveryCodes, children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
              " Regenerate Recovery Codes"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: disable2FA, disabled: disableForm.processing, children: [
              disableForm.processing && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Disable 2FA"
            ] })
          ] })
        ] })
      ] }) }),
      !twoFactorEnabled && setupData && /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-card-foreground", children: "Finish enabling two-factor authentication." }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-2xl", children: "To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application or enter the setup key and provide the generated OTP code." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-8 items-start", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white p-4 rounded-lg shadow-sm border", children: /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: setupData.qr_code }, className: "w-48 h-48 sm:w-56 sm:h-56 [&>svg]:w-full [&>svg]:h-full" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full max-w-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1", children: "Setup Key" }),
              /* @__PURE__ */ jsx("code", { className: "px-3 py-1.5 bg-muted rounded-md text-sm font-mono text-foreground break-all inline-block", children: setupData.secret })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submitConfirm, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "code", children: "Confirmation Code" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "code",
                    type: "text",
                    inputMode: "numeric",
                    autoFocus: true,
                    autoComplete: "one-time-code",
                    className: "text-lg tracking-widest font-mono max-w-[200px]",
                    value: confirmForm.data.code,
                    onChange: (e) => confirmForm.setData("code", e.target.value),
                    placeholder: "XXXXXX",
                    maxLength: 6
                  }
                ),
                confirmForm.errors.code && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: confirmForm.errors.code })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: confirmForm.processing, children: [
                  confirmForm.processing && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Confirm setup"
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setSetupData(null), children: "Cancel" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      recoveryCodes.length > 0 && /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-sm bg-primary/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-card-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-5 w-5 text-primary" }),
            " Store these recovery codes securely."
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: copyToClipboard, className: "hidden sm:flex bg-background", children: [
            isCopied ? /* @__PURE__ */ jsx(Check, { className: "mr-2 h-4 w-4 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
            isCopied ? "Copied" : "Copy"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-muted-foreground max-w-2xl leading-relaxed", children: "These recovery codes can be used to access your account in the event you lose access to your device and cannot receive two-factor authentication codes. Keep them in a secure password manager." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg bg-background p-5 rounded-lg border font-mono text-sm tracking-wider", children: recoveryCodes.map((code, i) => /* @__PURE__ */ jsxs("div", { className: "text-foreground flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground opacity-50 text-xs w-4", children: [
            i + 1,
            "."
          ] }),
          code
        ] }, i)) }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "mt-4 sm:hidden w-full bg-background", onClick: copyToClipboard, children: [
          isCopied ? /* @__PURE__ */ jsx(Check, { className: "mr-2 h-4 w-4 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }),
          isCopied ? "Copied" : "Copy Codes"
        ] })
      ] })
    ] })
  ] });
}
export {
  TwoFactor as default
};
