import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { User, ShieldCheck, Monitor, Pencil, Mail, Phone, Key, EyeOff, Eye, Copy, Zap } from "lucide-react";
import { toast } from "sonner";
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
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
const Profile = () => {
  var _a, _b, _c, _d, _e;
  const { auth, tenant } = usePage().props;
  const user = auth == null ? void 0 : auth.user;
  const route = window.route;
  const [showSecret, setShowSecret] = useState(false);
  const nameParts = ((user == null ? void 0 : user.name) ?? "").split(" ");
  const firstName = nameParts[0] ?? "—";
  const lastName = nameParts.slice(1).join(" ") || "—";
  const joinedDate = (user == null ? void 0 : user.created_at) ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—";
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "User Profile" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "View your personal account and tracking credentials." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "h-32 bg-gradient-to-r from-primary/80 to-primary/20" }),
      /* @__PURE__ */ jsx("div", { className: "relative px-6 pb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center sm:flex-row sm:items-end sm:gap-5", children: [
        /* @__PURE__ */ jsx("div", { className: "-mt-12 overflow-hidden flex-shrink-0 flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-primary/10 shadow-lg", children: (user == null ? void 0 : user.profile_photo_url) ? /* @__PURE__ */ jsx("img", { src: user.profile_photo_url, alt: user.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx(User, { className: "h-12 w-12 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex-1 text-center sm:mt-0 sm:text-left", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-card-foreground", children: (user == null ? void 0 : user.name) ?? "Unknown User" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-wrap justify-center sm:justify-start items-center gap-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "capitalize font-medium text-primary", children: (user == null ? void 0 : user.role) ?? "user" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 sm:mt-0 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("tenant.profile.browser-sessions"), children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5 border-primary/10 hover:bg-primary/5", children: [
            /* @__PURE__ */ jsx(Monitor, { className: "h-3.5 w-3.5" }),
            " Sessions"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { href: route("tenant.profile.edit"), children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", children: [
            /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }),
            " Edit Profile"
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-5xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm h-fit", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-2 border-b border-border/40 pb-4", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Personal Identity" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2", children: [
          [
            { label: "First Name", value: firstName },
            { label: "Last Name", value: lastName },
            { label: "Email Address", value: (user == null ? void 0 : user.email) ?? "—", icon: Mail },
            { label: "Phone", value: (user == null ? void 0 : user.phone) ?? "—", icon: Phone }
          ].map((field) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: field.label }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-card-foreground", children: field.value })
          ] }, field.label)),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: "Account Status" }),
            /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${(user == null ? void 0 : user.status) === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }),
              (user == null ? void 0 : user.status) ?? "active"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: "Member Since" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-card-foreground", children: joinedDate })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm h-fit", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-5 flex items-center gap-2 border-b border-border/40 pb-4", children: [
          /* @__PURE__ */ jsx(Key, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground", children: "Tracking Credentials" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: "Global Account Secret" }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: showSecret ? "text" : "password",
                  value: (tenant == null ? void 0 : tenant.api_key) || "",
                  readOnly: true,
                  placeholder: "No Secret Initialized",
                  className: "pr-24 font-mono text-xs h-11 bg-muted/30 border-muted-foreground/10 focus:border-primary/30"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute right-1 top-1 flex gap-1", children: [
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-9 w-9 hover:bg-primary/5", onClick: () => setShowSecret(!showSecret), children: showSecret ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-9 w-9 hover:bg-primary/5", onClick: () => copyToClipboard(tenant == null ? void 0 : tenant.api_key, "API Key"), children: /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Use this global secret for secure sGTM container synchronization." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-primary/5 p-4 border border-primary/10 relative overflow-hidden group", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-primary fill-primary/20" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: "Event Quota" })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded", children: [
                  ((_a = tenant == null ? void 0 : tenant.usage) == null ? void 0 : _a.percentage) ?? 0,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("div", { className: "h-2 w-full bg-primary/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full bg-primary transition-all duration-1000 ease-out rounded-full",
                    style: { width: `${((_b = tenant == null ? void 0 : tenant.usage) == null ? void 0 : _b.percentage) ?? 0}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-lg font-black text-primary tracking-tight", children: [
                    ((_d = (_c = tenant == null ? void 0 : tenant.usage) == null ? void 0 : _c.used) == null ? void 0 : _d.toLocaleString()) ?? "0",
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground/60 ml-1", children: "REQUESTS" })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-medium text-muted-foreground/60 pb-0.5 uppercase tracking-tighter", children: [
                    "Limit: ",
                    ((((_e = tenant == null ? void 0 : tenant.usage) == null ? void 0 : _e.limit) ?? 1e4) / 1e3).toLocaleString(),
                    "k"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/30 p-4 border border-border/40 flex flex-col justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: "Infrastructure" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-card-foreground", children: "cGTM Hybrid Mode" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5", children: "Optimized for high-performance server-side tracking." })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  Profile as default
};
