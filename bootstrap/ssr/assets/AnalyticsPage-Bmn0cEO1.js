import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { BarChart3, RefreshCw, ExternalLink, Shield, Clock, AlertTriangle, Activity, Info } from "lucide-react";
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
import "sonner";
import "@radix-ui/react-tooltip";
function AnalyticsPage({ analytics, provisioning, type, containers, active_container_id }) {
  const handleTenantChange = (e) => {
    window.location.href = `/analytics/${type || "overview"}?tenant_id=${e.target.value}`;
  };
  const title = type === "realtime" ? "Real-time Stream" : "Analytics Overview";
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Real-time Analytics | PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground uppercase", children: title }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1 shadow-sm", children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/analytics/overview",
                  className: `px-3 py-1 text-[10px] font-bold rounded-full transition-all ${type !== "realtime" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`,
                  children: "OVERVIEW"
                }
              ),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/analytics/realtime",
                  className: `px-3 py-1 text-[10px] font-bold rounded-full transition-all ${type === "realtime" ? "bg-amber-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`,
                  children: "REAL-TIME"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: type === "realtime" ? "Live event stream and active user sessions." : "Deep-dive business intelligence and historical performance." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          containers && containers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-white p-1.5 rounded-xl border border-border/60 shadow-sm transition-all hover:border-indigo-500/40 group", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "absolute right-0 h-4 w-4 hidden group-hover:block" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-2", children: "Workspace:" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "bg-transparent border-none text-sm font-bold rounded-lg px-2 py-1.5 focus:ring-0 outline-none cursor-pointer",
                value: active_container_id || "",
                onChange: handleTenantChange,
                children: containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => window.location.reload(),
              className: "p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all active:scale-95",
              title: "Refresh Data",
              children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" })
            }
          ),
          (analytics == null ? void 0 : analytics.url) && /* @__PURE__ */ jsxs(
            "a",
            {
              href: analytics.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95",
              children: [
                "Full Screen ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-primary-foreground/80 mb-1", children: "Authenticated First-Party Access" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "You are viewing a secure, signed enterprise reporting view. Your data is isolated in a dedicated ClickHouse warehouse and served via HS256 JWT encryption for maximum security and performance." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm min-h-[85vh] flex flex-col relative group", children: (analytics == null ? void 0 : analytics.full_embed) ? /* @__PURE__ */ jsx(
        "iframe",
        {
          src: analytics.full_embed,
          frameBorder: "0",
          width: "100%",
          height: "800",
          allowTransparency: true,
          className: "w-full flex-grow rounded-2xl",
          title: "Enterprise Analytics"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20", children: provisioning ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-2", children: "Provisioning Your Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-sm mx-auto mb-8", children: "Our platform is currently setting up a dedicated Metabase instance for your workspace. This usually takes 1-2 minutes." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-white border border-border/60 rounded-xl", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-amber-500 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: "Est. wait: less than 1 minute" })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-10 w-10 text-amber-500" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground mb-2", children: "No Tracking Data Found" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md mx-auto mb-8", children: "To activate analytics, please ensure your tracking container is live and receiving events. The dashboard will automatically provision once the first event is processed." }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3", children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/containers",
            className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
              " Go to Containers"
            ]
          }
        ) })
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-center text-muted-foreground opacity-60", children: [
        /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px]", children: "Data updates in real-time as events are processed via Kafka. Last sync: Just now." })
      ] })
    ] })
  ] });
}
export {
  AnalyticsPage as default
};
