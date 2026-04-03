import { jsxs, jsx } from "react/jsx-runtime";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeft, Shield, Building2, Receipt, Loader2, Save } from "lucide-react";
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
const Business = ({ settings }) => {
  const route = window.route;
  const { data, setData, post, processing, errors } = useForm({
    business_type: settings.business_type || "",
    business_category: settings.business_category || "",
    cr_number: settings.cr_number || "",
    vat_number: settings.vat_number || "",
    company_name: settings.company_name || "",
    company_address: settings.company_address || "",
    company_city: settings.company_city || "",
    country: settings.country || "",
    invoice_prefix: settings.invoice_prefix || "INV-",
    tax_rate: settings.tax_rate || ""
  });
  const handleSave = (e) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=business", {
      onSuccess: () => toast.success("Business settings updated"),
      onError: () => toast.error("Failed to update business settings")
    });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Business Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("tenant.settings"),
          className: "rounded-lg p-2 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5 text-muted-foreground" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Business Registration" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Legal and business registration details" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary" }),
          " Legal Identity"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Company Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.company_name,
                onChange: (e) => setData("company_name", e.target.value),
                placeholder: "Legal company name"
              }
            ),
            errors.company_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.company_name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "CR / Registration Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.cr_number,
                  onChange: (e) => setData("cr_number", e.target.value),
                  placeholder: "e.g. 1234567890"
                }
              ),
              errors.cr_number && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.cr_number })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "VAT Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.vat_number,
                  onChange: (e) => setData("vat_number", e.target.value),
                  placeholder: "e.g. 301234567890003"
                }
              ),
              errors.vat_number && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.vat_number })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Business Type" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.business_type,
                  onChange: (e) => setData("business_type", e.target.value),
                  placeholder: "e.g. LLC, Sole Proprietorship"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Business Category" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.business_category,
                  onChange: (e) => setData("business_category", e.target.value),
                  placeholder: "e.g. ecommerce, cross-border-ior"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-primary" }),
          " Address & Location"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Business Address" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.company_address,
                onChange: (e) => setData("company_address", e.target.value),
                placeholder: "Full registered address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "City" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.company_city,
                  onChange: (e) => setData("company_city", e.target.value),
                  placeholder: "City"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Country" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: data.country,
                  onChange: (e) => setData("country", e.target.value),
                  placeholder: "Country"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm xl:col-span-2", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Receipt, { className: "h-5 w-5 text-primary" }),
          " Invoice & Tax"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Invoice Prefix" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.invoice_prefix,
                onChange: (e) => setData("invoice_prefix", e.target.value),
                placeholder: "INV-"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Prefix for generated invoices (e.g. INV-0001)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Default Tax Rate (%)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: data.tax_rate,
                onChange: (e) => setData("tax_rate", e.target.value),
                placeholder: "15"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-8 right-8 z-50", children: /* @__PURE__ */ jsxs(
      Button,
      {
        onClick: handleSave,
        disabled: processing,
        className: "h-12 px-8 rounded-full shadow-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:scale-105 transition-transform",
        children: [
          processing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Save Business Settings"
        ]
      }
    ) })
  ] });
};
export {
  Business as default
};
