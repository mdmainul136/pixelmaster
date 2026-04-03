import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { BookOpen, ExternalLink, Code, Puzzle, ShoppingBag, Terminal, Globe, Zap, Smartphone, Package, Box, CheckCircle2, ChevronDown, ChevronRight, Settings2, Copy, BarChart3, Blocks, Shield } from "lucide-react";
import { toast } from "sonner";
import "@inertiajs/react";
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
const fetchContainers = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/containers");
    return data.containers ?? [];
  } catch {
    return [];
  }
};
const EmbedCodePage = () => {
  const [activeTab, setActiveTab] = useState("snippets");
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [copied, setCopied] = useState(null);
  const [expandedGuide, setExpandedGuide] = useState(null);
  const { data: containers = [] } = useQuery({
    queryKey: ["tracking-containers"],
    queryFn: fetchContainers
  });
  const transportUrl = (selectedContainer == null ? void 0 : selectedContainer.transport_url) ?? "https://track.yoursite.com";
  const containerId = (selectedContainer == null ? void 0 : selectedContainer.container_id) ?? "GTM-XXXXX";
  const apiKey = (selectedContainer == null ? void 0 : selectedContainer.api_key) ?? "pm_live_XXXXXXXXXXXX";
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2e3);
  };
  const CopyBtn = ({ text, id }) => /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => copyText(text, id),
      className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
      children: copied === id ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-[hsl(160,84%,39%)]" }),
        " Copied"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" }),
        " Copy"
      ] })
    }
  );
  const CodeBlock = ({ code, id, lang = "html" }) => /* @__PURE__ */ jsxs("div", { className: "relative rounded-xl border border-border/50 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-[hsl(222,47%,10%)] border-b border-border/40 px-4 py-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground uppercase tracking-wider", children: lang }),
      /* @__PURE__ */ jsx(CopyBtn, { text: code, id })
    ] }),
    /* @__PURE__ */ jsx("pre", { className: "bg-[hsl(222,47%,8%)] p-4 overflow-x-auto", children: /* @__PURE__ */ jsx("code", { className: "text-xs text-[hsl(160,84%,70%)] font-mono whitespace-pre leading-relaxed", children: code }) })
  ] });
  const tabs = [
    { id: "snippets", label: "Embed Snippets", icon: Code },
    { id: "plugins", label: "CMS Plugins", icon: Puzzle, badge: "2" },
    { id: "apps", label: "Platform Apps", icon: ShoppingBag, badge: "3" },
    { id: "sdk", label: "JS / Node SDK", icon: Terminal },
    { id: "api", label: "REST API", icon: Globe }
  ];
  const snippetContent = () => /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: "Select Container" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: (selectedContainer == null ? void 0 : selectedContainer.id) ?? "",
          onChange: (e) => setSelectedContainer(containers.find((c) => c.id === Number(e.target.value)) || null),
          className: "w-full max-w-sm rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Choose a container..." }),
            containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: "gtag.js (Recommended)" }),
            /* @__PURE__ */ jsx(Badge, { className: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[9px]", children: "Most Popular" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Google Analytics 4 compatible — paste in <head>" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CodeBlock, { id: "gtag", code: `<!-- PixelMaster sGTM — First-Party gtag.js -->
<script async src="${transportUrl}/gtag/js?id=${containerId}"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${containerId}', {
    transport_url: '${transportUrl}',
    first_party_collection: true
  });
<\/script>` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]", children: /* @__PURE__ */ jsx(Blocks, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: "GTM Container Loader" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Drop-in replacement for standard GTM loader — paste in <head>" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CodeBlock, { id: "gtm-head", lang: "html", code: `<!-- PixelMaster sGTM — Head Snippet -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
  j.src='${transportUrl}/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${containerId}');
<\/script>` }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Additionally, paste immediately after <body> tag:" }),
        /* @__PURE__ */ jsx(CodeBlock, { id: "gtm-body", lang: "html", code: `<!-- PixelMaster sGTM — Body Snippet -->
<noscript><iframe src="${transportUrl}/ns.html?id=${containerId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(280,68%,60%)]/10 text-[hsl(280,68%,60%)]", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: "Measurement Protocol (Server-to-Server)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Send events from your backend directly — no browser required" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CodeBlock, { id: "mp", lang: "bash", code: `curl -X POST '${transportUrl}/mp/collect' \\
  -H 'Content-Type: application/json' \\
  -H 'X-PM-Api-Key: ${apiKey}' \\
  -d '{
    "client_id": "USER_CLIENT_ID",
    "events": [{
      "name": "purchase",
      "params": {
        "transaction_id": "TXN_001",
        "value": 99.99,
        "currency": "USD"
      }
    }]
  }'` })
    ] })
  ] });
  const pluginsContent = () => {
    const plugins = [
      {
        id: "wordpress",
        name: "WordPress / WooCommerce",
        icon: Puzzle,
        version: "v2.4.1",
        status: "stable",
        color: "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5",
        textColor: "text-[hsl(210,70%,50%)]",
        desc: "Full server-side tracking for WordPress & WooCommerce. Auto-tracks purchases, add-to-cart, page views and more.",
        features: ["Auto Purchase Tracking", "WooCommerce Events", "GDPR Consent Mode", "Cookie-less Mode"],
        steps: [
          "Download and install PixelMaster plugin from wordpress.org",
          `Go to Settings > PixelMaster and enter your Container ID: ${containerId}`,
          `Enter your API Key: ${apiKey}`,
          "Enable WooCommerce integration and save",
          "Verify connection using the 'Test Connection' button"
        ]
      },
      {
        id: "prestashop",
        name: "PrestaShop",
        icon: Box,
        version: "v1.2.0",
        status: "stable",
        color: "from-[hsl(0,84%,60%)]/15 to-[hsl(0,84%,60%)]/5",
        textColor: "text-[hsl(0,84%,60%)]",
        desc: "Track orders, product views, and customer actions in your PrestaShop store with Server-Side events.",
        features: ["Order Tracking", "Product Views", "Cart Events", "Customer Data"],
        steps: [
          "Download PixelMaster PrestaShop module from your dashboard",
          "Upload to /modules/ folder and activate in Back Office",
          `Configure Container ID: ${containerId} and API Key`,
          "Map your store events to PixelMaster destinations"
        ]
      }
    ];
    return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: plugins.map((plugin) => {
      const Icon = plugin.icon;
      const isOpen = expandedGuide === plugin.id;
      return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plugin.color} ${plugin.textColor} shrink-0`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: plugin.name }),
                /* @__PURE__ */ jsx(Badge, { className: "bg-muted text-muted-foreground text-[9px]", children: plugin.version }),
                /* @__PURE__ */ jsx(Badge, { className: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[9px]", children: plugin.status })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed max-w-lg", children: plugin.desc }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-2.5", children: plugin.features.map((f) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5 text-primary" }),
                " ",
                f
              ] }, f)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0 ml-4", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "rounded-xl text-xs gap-1.5",
                onClick: () => setExpandedGuide(isOpen ? null : plugin.id),
                children: [
                  /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }),
                  isOpen ? "Hide Guide" : "Setup Guide",
                  isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(Button, { size: "sm", className: "rounded-xl text-xs gap-1.5", children: [
              /* @__PURE__ */ jsx(Package, { className: "h-3.5 w-3.5" }),
              " Download"
            ] })
          ] })
        ] }) }),
        isOpen && /* @__PURE__ */ jsxs("div", { className: "border-t border-border/50 bg-muted/10 p-6 animate-in slide-in-from-top-2", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-xs font-semibold text-foreground mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4 text-primary" }),
            " Step-by-step Installation Guide"
          ] }),
          /* @__PURE__ */ jsx("ol", { className: "space-y-3", children: plugin.steps.map((step, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground", children: i + 1 }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pt-0.5", children: step })
          ] }, i)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-5 rounded-xl bg-primary/5 border border-primary/10 p-4", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Your API Key:" }),
            " ",
            /* @__PURE__ */ jsx("code", { className: "font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded", children: apiKey }),
            /* @__PURE__ */ jsx("button", { onClick: () => copyText(apiKey, `key-${plugin.id}`), className: "ml-2 text-muted-foreground hover:text-foreground transition-colors", children: copied === `key-${plugin.id}` ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 inline text-[hsl(160,84%,39%)]" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5 inline" }) })
          ] }) })
        ] })
      ] }, plugin.id);
    }) });
  };
  const appsContent = () => {
    const apps = [
      {
        id: "shopify",
        name: "Shopify",
        icon: ShoppingBag,
        status: "App Ready",
        color: "from-[hsl(160,84%,39%)]/15 to-[hsl(160,84%,39%)]/5",
        textColor: "text-[hsl(160,84%,39%)]",
        desc: "One-click Shopify app. Tracks all Shopify standard events (purchase, add_to_cart, checkout) via CAPI with deduplication.",
        features: ["Web Pixel API", "Server Events", "Order Deduplication", "Klaviyo Sync"],
        steps: [
          "Go to Shopify App Store and search for PixelMaster",
          "Click Install and authorize the app",
          `In the app settings, your Container ID (${containerId}) is pre-filled`,
          "Select the ad platforms you want to track (Facebook, GA4, TikTok, etc.)",
          "Enable 'Server-Side Deduplication' for accurate conversion tracking"
        ]
      },
      {
        id: "woocommerce",
        name: "WooCommerce (Direct App)",
        icon: Package,
        status: "Plugin Ready",
        color: "from-[hsl(280,68%,60%)]/15 to-[hsl(280,68%,60%)]/5",
        textColor: "text-[hsl(280,68%,60%)]",
        desc: "Native WooCommerce app for complete ecommerce event tracking with cart abandonment and customer lifetime value.",
        features: ["Cart Abandonment", "CLV tracking", "Refund Events", "Subscription Events"],
        steps: [
          "Download from PixelMaster dashboard under Integrations > Apps",
          "Upload to WordPress via Plugins > Add New > Upload",
          `Activate and go to WooCommerce > PixelMaster > Settings`,
          `Enter Container ID ${containerId} and save`,
          "Test a purchase to verify event data flows correctly"
        ]
      },
      {
        id: "magento",
        name: "Adobe Commerce (Magento)",
        icon: Box,
        status: "Beta",
        color: "from-[hsl(38,92%,50%)]/15 to-[hsl(38,92%,50%)]/5",
        textColor: "text-[hsl(38,92%,50%)]",
        desc: "Enterprise-grade Magento 2 extension for large-scale ecommerce tracking. Supports multi-store configurations.",
        features: ["Multi-Store", "B2B Events", "Quote Tracking", "SKU-Level Data"],
        steps: [
          "Install via Composer: `composer require pixelmaster/magento2-tracking`",
          "Run `php bin/magento module:enable PixelMaster_Tracking`",
          "Run `php bin/magento setup:upgrade && php bin/magento cache:flush`",
          `Configure API Key and Container ID in Stores > Configuration > PixelMaster`
        ]
      }
    ];
    return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: apps.map((app) => {
      const Icon = app.icon;
      const isOpen = expandedGuide === app.id;
      return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} ${app.textColor} shrink-0`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: app.name }),
                /* @__PURE__ */ jsx(Badge, { className: `text-[9px] ${app.status === "Beta" ? "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]" : "bg-primary/10 text-primary"}`, children: app.status })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed max-w-lg", children: app.desc }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-2.5", children: app.features.map((f) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5 text-primary" }),
                " ",
                f
              ] }, f)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "rounded-xl text-xs gap-1.5", onClick: () => setExpandedGuide(isOpen ? null : app.id), children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }),
              isOpen ? "Hide Guide" : "Setup Guide",
              isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" })
            ] }),
            /* @__PURE__ */ jsxs(Button, { size: "sm", className: "rounded-xl text-xs gap-1.5", children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
              " Install"
            ] })
          ] })
        ] }) }),
        isOpen && /* @__PURE__ */ jsxs("div", { className: "border-t border-border/50 bg-muted/10 p-6 animate-in slide-in-from-top-2", children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-xs font-semibold text-foreground mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4 text-primary" }),
            " Installation Steps"
          ] }),
          /* @__PURE__ */ jsx("ol", { className: "space-y-3", children: app.steps.map((step, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground", children: i + 1 }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed pt-0.5", children: step })
          ] }, i)) })
        ] })
      ] }, app.id);
    }) });
  };
  const sdkContent = () => /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Browser JS SDK" }),
            /* @__PURE__ */ jsx(Badge, { className: "bg-primary/10 text-primary text-[9px]", children: "v2.1.0" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Universal JavaScript tracker — works on any website" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "1. Load SDK via CDN" }),
          /* @__PURE__ */ jsx(CodeBlock, { id: "sdk-cdn", lang: "html", code: `<script src="https://cdn.pixelmaster.io/sdk/v2/pm.min.js" async><\/script>` })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "2. Initialize the SDK" }),
          /* @__PURE__ */ jsx(CodeBlock, { id: "sdk-init", lang: "javascript", code: `PixelMaster.init({
  containerId: '${containerId}',
  transportUrl: '${transportUrl}',
  apiKey: '${apiKey}',
  autoTrack: true,       // Auto page_view tracking
  ecommerce: true,       // Auto ecommerce event tracking
  cookieConsent: true,   // Respect user consent settings
  debug: false,          // Set true in development
});` })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "3. Track Custom Events" }),
          /* @__PURE__ */ jsx(CodeBlock, { id: "sdk-events", lang: "javascript", code: `// Track a custom event
PixelMaster.track('purchase', {
  transaction_id: 'TXN_12345',
  value: 99.99,
  currency: 'USD',
  items: [{ id: 'SKU_001', name: 'Product Name', price: 99.99, quantity: 1 }]
});

// Identify a user
PixelMaster.identify({
  email: 'user@example.com',
  phone: '+8801700000000',
  external_id: 'USER_12345',
});` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]", children: /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Node.js / TypeScript SDK" }),
            /* @__PURE__ */ jsx(Badge, { className: "bg-primary/10 text-primary text-[9px]", children: "v1.8.0" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Server-side SDK for Node.js, TypeScript, Next.js backends" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Install via npm" }),
          /* @__PURE__ */ jsx(CodeBlock, { id: "node-install", lang: "bash", code: `npm install @pixelmaster/node-sdk` })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Initialize and Track" }),
          /* @__PURE__ */ jsx(CodeBlock, { id: "node-track", lang: "typescript", code: `import { PixelMaster } from '@pixelmaster/node-sdk';

const pm = new PixelMaster({
  containerId: '${containerId}',
  apiKey: '${apiKey}',
  transportUrl: '${transportUrl}',
});

// Server-side purchase event
await pm.track({
  clientId: req.cookies['_pm_cid'],
  userId: user.id,
  events: [{
    name: 'purchase',
    params: {
      transaction_id: order.id,
      value: order.total,
      currency: 'USD',
      items: order.items.map(i => ({
        id: i.sku,
        name: i.name,
        price: i.price,
        quantity: i.qty,
      })),
    }
  }]
});` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm opacity-80", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(Smartphone, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Mobile SDK (iOS & Android)" }),
          /* @__PURE__ */ jsx(Badge, { className: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] text-[9px]", children: "Coming Soon" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Native iOS (Swift) and Android (Kotlin) tracking SDKs" })
      ] })
    ] }) })
  ] });
  const apiContent = () => /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "REST API Reference" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Direct HTTP API for any language or platform" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] font-bold text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10 px-2 py-0.5 rounded", children: "BASE URL" }),
        /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-foreground", children: transportUrl }),
        /* @__PURE__ */ jsx(CopyBtn, { text: transportUrl, id: "base-url" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] font-bold text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 px-2 py-0.5 rounded", children: "API KEY" }),
        /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-foreground", children: apiKey }),
        /* @__PURE__ */ jsx(CopyBtn, { text: apiKey, id: "api-key-rest" })
      ] })
    ] }),
    [
      {
        method: "POST",
        endpoint: "/mp/collect",
        desc: "Ingest browser or server events",
        body: `{
  "client_id": "string",        // Required: Browser client ID
  "user_id": "string",          // Optional: Authenticated user ID
  "events": [
    {
      "name": "purchase",
      "params": { "transaction_id": "TXN_001", "value": 99.99, "currency": "USD" }
    }
  ]
}`
      },
      {
        method: "GET",
        endpoint: "/tracking/snippet",
        desc: "Get your dynamic embed snippets",
        body: `// Response
{
  "gtm_snippet": "<script>...<\/script>",
  "gtm_noscript": "<noscript>...</noscript>",
  "transport_url": "${transportUrl}",
  "container_id": "${containerId}"
}`
      }
    ].map((ep) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/50 bg-muted/20 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/40", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold font-mono px-2 py-0.5 rounded ${ep.method === "POST" ? "bg-primary/10 text-primary" : "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]"}`, children: ep.method }),
          /* @__PURE__ */ jsx("code", { className: "text-xs font-mono text-foreground", children: ep.endpoint })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: ep.desc })
      ] }),
      /* @__PURE__ */ jsx("pre", { className: "bg-[hsl(222,47%,8%)] p-4 overflow-x-auto", children: /* @__PURE__ */ jsx("code", { className: "text-xs text-[hsl(160,84%,70%)] font-mono whitespace-pre leading-relaxed", children: ep.body }) })
    ] }, ep.endpoint))
  ] }) });
  const tabContent = {
    snippets: snippetContent,
    plugins: pluginsContent,
    apps: appsContent,
    sdk: sdkContent,
    api: apiContent
  };
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Integration Hub" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Plugins, Apps, SDKs and APIs to connect PixelMaster to any platform" })
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "https://docs.pixelmaster.io",
          target: "_blank",
          rel: "noreferrer",
          className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
          children: [
            /* @__PURE__ */ jsx(BookOpen, { className: "h-3.5 w-3.5" }),
            " Full Docs ",
            /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm", children: tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsx("span", { children: tab.label }),
            tab.badge && /* @__PURE__ */ jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`, children: tab.badge })
          ]
        },
        tab.id
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "animate-in fade-in duration-200", children: tabContent[activeTab]() })
  ] }) });
};
export {
  EmbedCodePage as default
};
