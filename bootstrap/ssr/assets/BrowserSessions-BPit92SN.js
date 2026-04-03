import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { useState, useRef } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { X, ArrowLeft, Monitor, Smartphone, Globe, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { c as cn } from "../ssr.js";
import "@tanstack/react-query";
import "axios";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tooltip";
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-5 rounded-2xl border border-border/60 bg-card p-7 shadow-[var(--shadow-dialog)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-lg p-1.5 opacity-60 ring-offset-background transition-all hover:bg-muted hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2", className), ...props });
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-xl font-bold leading-none tracking-tight text-foreground", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
function BrowserSessions({ sessions }) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const passwordInput = useRef(null);
  const route = window.route;
  const form = useForm({
    password: ""
  });
  const confirmLogout = () => {
    setConfirmingLogout(true);
    setTimeout(() => {
      var _a;
      return (_a = passwordInput.current) == null ? void 0 : _a.focus();
    }, 250);
  };
  const logoutOtherBrowserSessions = (e) => {
    e.preventDefault();
    form.delete(route("tenant.profile.browser-sessions.destroy"), {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
        toast.success("Logged out of other browser sessions successfully.");
      },
      onError: () => {
        var _a;
        return (_a = passwordInput.current) == null ? void 0 : _a.focus();
      },
      onFinish: () => form.reset()
    });
  };
  const closeModal = () => {
    setConfirmingLogout(false);
    form.reset();
    form.clearErrors();
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Browser Sessions" }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("tenant.profile"),
          className: "rounded-lg p-2 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5 text-muted-foreground" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Browser Sessions" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage and log out your active sessions on other browsers and devices." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-3xl", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "max-w-xl text-sm text-muted-foreground leading-relaxed", children: "If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password." }),
      sessions.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-6 divide-y divide-border border rounded-lg overflow-hidden", children: sessions.map((session, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center p-4 bg-card hover:bg-muted/30 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground", children: session.agent.is_desktop ? /* @__PURE__ */ jsx(Monitor, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Smartphone, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium text-foreground", children: [
            session.agent.platform ? session.agent.platform : "Unknown",
            " -",
            " ",
            session.agent.browser ? session.agent.browser : "Unknown"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Globe, { className: "h-3 w-3" }),
              " ",
              session.ip_address
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-border px-1.5", children: "•" }),
            session.is_current_device ? /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 rounded-full py-0.5", children: "This device" }) : /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Last active ",
              session.last_active
            ] })
          ] })
        ] })
      ] }, i)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex items-center", children: /* @__PURE__ */ jsxs(Button, { onClick: confirmLogout, variant: "default", className: "gap-2", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
        " Log Out Other Browser Sessions"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: confirmingLogout, onOpenChange: setConfirmingLogout, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Log Out Other Browser Sessions" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Please enter your password to confirm you would like to log out of your other browser sessions across all of your devices." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: logoutOtherBrowserSessions, children: [
        /* @__PURE__ */ jsxs("div", { className: "py-4 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              ref: passwordInput,
              value: form.data.password,
              onChange: (e) => form.setData("password", e.target.value),
              placeholder: "Enter your password",
              autoComplete: "current-password"
            }
          ),
          form.errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive mt-1", children: form.errors.password })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0 mt-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: closeModal, children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: form.processing, variant: "destructive", children: [
            form.processing && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Log Out Other Sessions"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  BrowserSessions as default
};
