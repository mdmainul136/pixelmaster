import { jsx, jsxs } from "react/jsx-runtime";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { c as cn } from "../ssr.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeft, DollarSign, Calendar, Ruler, Globe, Loader2, Save } from "lucide-react";
import "@tanstack/react-query";
import "axios";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-slot";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tooltip";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Localization = ({ settings }) => {
  const route = window.route;
  const { data, setData, post, processing, errors } = useForm({
    currency_code: settings.currency_code || "BDT",
    currency_symbol: settings.currency_symbol || "৳",
    timezone: settings.timezone || "Asia/Dhaka",
    date_format: settings.date_format || "Y-m-d",
    measurement_unit: settings.measurement_unit || "metric",
    fiscal_year_start: settings.fiscal_year_start || 1,
    is_global: settings.is_global || false,
    auto_language_switcher: settings.auto_language_switcher || false,
    multi_currency_detection: settings.multi_currency_detection || false
  });
  const handleSave = (e) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=localization", {
      onSuccess: () => toast.success("Localization settings updated"),
      onError: () => toast.error("Failed to update localization settings")
    });
  };
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Localization Settings" }),
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
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Localization" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Currency, timezone, and regional preferences" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5 text-primary" }),
          " Currency"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Currency Code" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.currency_code,
                onChange: (e) => setData("currency_code", e.target.value),
                placeholder: "BDT"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Currency Symbol" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.currency_symbol,
                onChange: (e) => setData("currency_symbol", e.target.value),
                placeholder: "৳"
              }
            )
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-primary" }),
          " Time & Date"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Timezone" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.timezone,
                onChange: (e) => setData("timezone", e.target.value),
                placeholder: "Asia/Dhaka"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Date Format" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.date_format,
                  onChange: (e) => setData("date_format", e.target.value),
                  className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "Y-m-d", children: "2026-03-19 (Y-m-d)" }),
                    /* @__PURE__ */ jsx("option", { value: "d/m/Y", children: "19/03/2026 (d/m/Y)" }),
                    /* @__PURE__ */ jsx("option", { value: "m/d/Y", children: "03/19/2026 (m/d/Y)" }),
                    /* @__PURE__ */ jsx("option", { value: "d-M-Y", children: "19-Mar-2026 (d-M-Y)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Fiscal Year Starts" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: data.fiscal_year_start,
                  onChange: (e) => setData("fiscal_year_start", parseInt(e.target.value)),
                  className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  children: months.map((m, i) => /* @__PURE__ */ jsx("option", { value: i + 1, children: m }, i + 1))
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Ruler, { className: "h-5 w-5 text-primary" }),
          " Measurement"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Measurement Unit" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: ["metric", "imperial"].map((unit) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setData("measurement_unit", unit),
              className: `flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-all ${data.measurement_unit === unit ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`,
              children: unit === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"
            },
            unit
          )) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-primary" }),
          " Multi-Region"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Global Store" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Enable for international customers" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.is_global,
                onCheckedChange: (v) => setData("is_global", v)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Auto Language Switcher" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Detect visitor language automatically" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.auto_language_switcher,
                onCheckedChange: (v) => setData("auto_language_switcher", v)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground", children: "Multi-Currency Detection" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Show prices in visitor's local currency" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: data.multi_currency_detection,
                onCheckedChange: (v) => setData("multi_currency_detection", v)
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
          "Save Localization"
        ]
      }
    ) })
  ] });
};
export {
  Localization as default
};
