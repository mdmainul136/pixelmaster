import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { BarChart3, RefreshCw, ExternalLink, Shield, AlertTriangle, Database, Info } from "lucide-react";
function PlatformAnalyticsPage({ analytics, is_global }) {
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Platform Admin Analytics | PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600", children: /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Platform Global Analytics" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Master Business Intelligence dashboard aggregating raw tracking data across all tenants." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
                " Refresh Data"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: (analytics == null ? void 0 : analytics.url) || "#",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm",
              children: [
                "Open in Metabase ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4 items-start", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-indigo-900 mb-1", children: "Raw Level Data Access" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-indigo-800/70 leading-relaxed", children: "You are currently viewing a **Global Master Dashboard**. This view is not restricted by tenant context and provides access to the raw ClickHouse event stream. Use this for macro-level system auditing, cross-tenant performance comparison, and high-level business intelligence." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm min-h-[85vh] flex flex-col relative group", children: [
        (analytics == null ? void 0 : analytics.full_embed) ? /* @__PURE__ */ jsx(
          "iframe",
          {
            src: analytics.full_embed,
            frameBorder: "0",
            width: "100%",
            height: "900",
            allowTransparency: true,
            className: "w-full flex-grow rounded-2xl",
            title: "Global Platform Analytics"
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20", children: [
          /* @__PURE__ */ jsx("div", { className: "h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-10 w-10 text-amber-500" }) }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-2", children: "Analytics Not Configured" }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground max-w-md mx-auto mb-8", children: [
            "The global admin dashboard has not been fully configured in the environment settings. Please ensure ",
            /* @__PURE__ */ jsx("code", { children: "METABASE_ADMIN_DASHBOARD_ID" }),
            " and ",
            /* @__PURE__ */ jsx("code", { children: "METABASE_EMBED_SECRET" }),
            " are set."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: "/platform/settings",
              className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2",
              children: "Configure Settings"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-black/80 backdrop-blur-md p-3 border border-white/10 flex items-center justify-between shadow-2xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-indigo-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-white/70", children: "Source: ClickHouse Master (Global)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-emerald-400", children: "Live Inactive Filters: None" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-center text-muted-foreground opacity-60", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px]", children: "Authorized personnel only. All access to global analytics is logged for auditing purposes." })
      ] })
    ] })
  ] });
}
export {
  PlatformAnalyticsPage as default
};
