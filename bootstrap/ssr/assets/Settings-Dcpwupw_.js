import { jsxs, jsx } from "react/jsx-runtime";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Building, Mail, Phone, Server, ShieldCheck, Globe, Key, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, Head } from "@inertiajs/react";
import "react";
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
import "@radix-ui/react-label";
import "@radix-ui/react-slot";
const Settings = ({ tenant, settings: initialSettings }) => {
  const { patch, data, setData, processing } = useForm({
    tenant_name: (initialSettings == null ? void 0 : initialSettings.tenant_name) || (tenant == null ? void 0 : tenant.tenant_name) || "",
    company_name: (initialSettings == null ? void 0 : initialSettings.company_name) || (tenant == null ? void 0 : tenant.company_name) || "",
    company_email: (initialSettings == null ? void 0 : initialSettings.company_email) || (tenant == null ? void 0 : tenant.admin_email) || "",
    company_phone: (initialSettings == null ? void 0 : initialSettings.company_phone) || (tenant == null ? void 0 : tenant.phone) || ""
  });
  const route = window.route;
  const handleSave = (e) => {
    e.preventDefault();
    patch(route("tenant.settings.update"), {
      onSuccess: () => toast.success("Workspace identity updated successfully"),
      onError: () => toast.error("Failed to update settings")
    });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage your tracking platform's core identity and support contacts." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "grid grid-cols-1 gap-6 max-w-5xl pb-20", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4", children: [
              /* @__PURE__ */ jsx(Building, { className: "h-5 w-5 text-primary" }),
              " Workspace Identity"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Workspace Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: data.tenant_name,
                    onChange: (e) => setData("tenant_name", e.target.value),
                    placeholder: "e.g. Production Tracking",
                    className: "h-10"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Organization Name" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: data.company_name,
                    onChange: (e) => setData("company_name", e.target.value),
                    placeholder: "e.g. Acme Corp Inc.",
                    className: "h-10"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Primary Tracking Subdomain" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: (tenant == null ? void 0 : tenant.domain) || "—",
                    disabled: true,
                    className: "bg-muted h-10 font-mono text-xs opacity-70 cursor-not-allowed"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-primary" }),
              " Support & Contact"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Support Email" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: data.company_email,
                      onChange: (e) => setData("company_email", e.target.value),
                      placeholder: "admin@company.com",
                      className: "h-10 pl-10"
                    }
                  ),
                  /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Support Phone" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: data.company_phone,
                      onChange: (e) => setData("company_phone", e.target.value),
                      placeholder: "+1 234 567 890",
                      className: "h-10 pl-10"
                    }
                  ),
                  /* @__PURE__ */ jsx(Phone, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-2 italic", children: "These details are used for billing alerts and platform security notifications." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4", children: [
              /* @__PURE__ */ jsx(Server, { className: "h-5 w-5 text-primary" }),
              " Platform Meta"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4", children: [
              { label: "Tier", value: (tenant == null ? void 0 : tenant.plan) || "Free", icon: ShieldCheck, color: "text-emerald-500" },
              { label: "Region", value: (initialSettings == null ? void 0 : initialSettings.region) || "Global / USA", icon: Globe, color: "text-sky-500" },
              { label: "Quota", value: `${(initialSettings == null ? void 0 : initialSettings.event_limit) / 1e3 || 0}k/mo`, icon: Key, color: "text-amber-500" },
              { label: "Engine", value: "sGTM Hybrid", icon: Server, color: "text-primary" }
            ].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted/20 p-4 border border-border/40", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                /* @__PURE__ */ jsx(item.icon, { className: `h-3.5 w-3.5 ${item.color}` }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest", children: item.label })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-card-foreground truncate", children: item.value })
            ] }, i)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4", children: [
              /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-primary" }),
              " Security & Credentials"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1", children: "Notice" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed italic", children: "The Global Secret is your Master Key for Sidecar authentication. Handle with care." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2", children: [
                  "Global Account Secret ",
                  /* @__PURE__ */ jsx(Key, { className: "h-3 w-3" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      value: (initialSettings == null ? void 0 : initialSettings.global_account_secret) || (tenant == null ? void 0 : tenant.global_account_secret) || "—",
                      disabled: true,
                      className: "bg-muted h-10 font-mono text-[10px] opacity-70 cursor-not-allowed pr-10"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      className: "absolute right-1 top-1 h-8 w-8 text-muted-foreground",
                      onClick: () => {
                        const secret = (initialSettings == null ? void 0 : initialSettings.global_account_secret) || (tenant == null ? void 0 : tenant.global_account_secret);
                        if (secret) {
                          navigator.clipboard.writeText(secret);
                          toast.success("Secret copied to clipboard");
                        }
                      },
                      children: /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-widest", children: "Workspace API Key" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: (tenant == null ? void 0 : tenant.api_key) || "—",
                    disabled: true,
                    className: "bg-muted h-10 font-mono text-[10px] opacity-70 cursor-not-allowed"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "h-12 px-10 rounded-xl shadow-xl bg-primary text-primary-foreground font-bold flex items-center gap-2",
            children: [
              processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              "Save Workspace Changes"
            ]
          }
        ) })
      ] })
    ] })
  ] });
};
export {
  Settings as default
};
