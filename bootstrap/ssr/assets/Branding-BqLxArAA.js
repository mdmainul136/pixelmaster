import { jsxs, jsx } from "react/jsx-runtime";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeft, Palette, Image, Share2, Facebook, Instagram, Twitter, Linkedin, Loader2, Save } from "lucide-react";
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
const Branding = ({ settings }) => {
  const route = window.route;
  const { data, setData, post, processing, errors } = useForm({
    logo_url: settings.logo_url || "",
    favicon_url: settings.favicon_url || "",
    primary_color: settings.primary_color || "#6366f1",
    secondary_color: settings.secondary_color || "#8b5cf6",
    facebook_url: settings.facebook_url || "",
    instagram_url: settings.instagram_url || "",
    twitter_url: settings.twitter_url || "",
    linkedin_url: settings.linkedin_url || "",
    theme_id: settings.theme_id || ""
  });
  const handleSave = (e) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=branding", {
      onSuccess: () => toast.success("Branding settings updated"),
      onError: () => toast.error("Failed to update branding settings")
    });
  };
  const presetColors = [
    { name: "Indigo", primary: "#6366f1", secondary: "#8b5cf6" },
    { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
    { name: "Emerald", primary: "#10b981", secondary: "#34d399" },
    { name: "Rose", primary: "#f43f5e", secondary: "#fb7185" },
    { name: "Amber", primary: "#f59e0b", secondary: "#fbbf24" },
    { name: "Cyan", primary: "#06b6d4", secondary: "#22d3ee" }
  ];
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Branding Settings" }),
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
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Branding" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Colors, logos, and social media links" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Palette, { className: "h-5 w-5 text-primary" }),
          " Brand Colors"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Primary Color" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "color",
                    value: data.primary_color,
                    onChange: (e) => setData("primary_color", e.target.value),
                    className: "h-10 w-14 rounded-md border border-input cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: data.primary_color,
                    onChange: (e) => setData("primary_color", e.target.value),
                    placeholder: "#6366f1",
                    className: "flex-1"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Secondary Color" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "color",
                    value: data.secondary_color,
                    onChange: (e) => setData("secondary_color", e.target.value),
                    className: "h-10 w-14 rounded-md border border-input cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: data.secondary_color,
                    onChange: (e) => setData("secondary_color", e.target.value),
                    placeholder: "#8b5cf6",
                    className: "flex-1"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs text-muted-foreground", children: "Quick Presets" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: presetColors.map((preset) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setData("primary_color", preset.primary);
                  setData("secondary_color", preset.secondary);
                },
                className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40 transition-colors",
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "h-3 w-3 rounded-full",
                      style: { background: preset.primary }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "h-3 w-3 rounded-full",
                      style: { background: preset.secondary }
                    }
                  ),
                  preset.name
                ]
              },
              preset.name
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Preview" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-10 w-24 rounded-lg",
                  style: { background: data.primary_color }
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-10 w-24 rounded-lg",
                  style: { background: data.secondary_color }
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-10 flex-1 rounded-lg",
                  style: {
                    background: `linear-gradient(135deg, ${data.primary_color}, ${data.secondary_color})`
                  }
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Image, { className: "h-5 w-5 text-primary" }),
          " Logo & Favicon"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Logo URL" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.logo_url,
                onChange: (e) => setData("logo_url", e.target.value),
                placeholder: "https://example.com/logo.png"
              }
            ),
            data.logo_url && /* @__PURE__ */ jsx("div", { className: "mt-2 rounded-lg border border-border p-3 bg-muted/50", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: data.logo_url,
                alt: "Logo preview",
                className: "h-12 object-contain",
                onError: (e) => {
                  e.target.style.display = "none";
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Favicon URL" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.favicon_url,
                onChange: (e) => setData("favicon_url", e.target.value),
                placeholder: "https://example.com/favicon.ico"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Theme" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.theme_id,
                onChange: (e) => setData("theme_id", e.target.value),
                placeholder: "default"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: "Theme identifier applied to your storefront" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6 shadow-sm xl:col-span-2", children: [
        /* @__PURE__ */ jsxs("h3", { className: "mb-4 text-base font-semibold text-card-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Share2, { className: "h-5 w-5 text-primary" }),
          " Social Media"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(Label, { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Facebook, { className: "h-4 w-4 text-blue-600" }),
              " Facebook"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.facebook_url,
                onChange: (e) => setData("facebook_url", e.target.value),
                placeholder: "https://facebook.com/your-page"
              }
            ),
            errors.facebook_url && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.facebook_url })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(Label, { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4 text-pink-500" }),
              " Instagram"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.instagram_url,
                onChange: (e) => setData("instagram_url", e.target.value),
                placeholder: "https://instagram.com/your-handle"
              }
            ),
            errors.instagram_url && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.instagram_url })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(Label, { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Twitter, { className: "h-4 w-4 text-sky-500" }),
              " Twitter / X"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.twitter_url,
                onChange: (e) => setData("twitter_url", e.target.value),
                placeholder: "https://x.com/your-handle"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs(Label, { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Linkedin, { className: "h-4 w-4 text-blue-700" }),
              " LinkedIn"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: data.linkedin_url,
                onChange: (e) => setData("linkedin_url", e.target.value),
                placeholder: "https://linkedin.com/company/your-company"
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
          "Save Branding"
        ]
      }
    ) })
  ] });
};
export {
  Branding as default
};
