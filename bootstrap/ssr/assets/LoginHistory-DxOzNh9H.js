import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { ArrowLeft, Monitor, Smartphone, Globe, History } from "lucide-react";
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
import "sonner";
import "@radix-ui/react-tooltip";
function LoginHistory({ loginHistories }) {
  const route = window.route;
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Login History" }),
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
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Login History" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Review your recent account access activity and devices." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-4xl", children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card shadow-sm mb-6", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/50 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 font-medium", children: "Device & Browser" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 font-medium", children: "IP Address" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 font-medium", children: "Location" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-4 font-medium text-right", children: "Time" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border", children: loginHistories.data.length > 0 ? loginHistories.data.map((history) => {
          var _a, _b, _c;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary", children: ((_a = history.device) == null ? void 0 : _a.toLowerCase().includes("mac")) || ((_b = history.device) == null ? void 0 : _b.toLowerCase().includes("windows")) || ((_c = history.device) == null ? void 0 : _c.toLowerCase().includes("linux")) ? /* @__PURE__ */ jsx(Monitor, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "font-medium text-foreground flex items-center gap-2", children: [
                  history.device || "Unknown OS",
                  history.is_current_device && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 border border-green-500/20", children: "This Device" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: history.browser || "Unknown Browser" })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { children: history.ip_address || "N/A" })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground", children: history.location }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground", children: history.login_at_human }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: history.login_at })
            ] })
          ] }, history.id);
        }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-6 py-8 text-center text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx(History, { className: "h-10 w-10 text-muted-foreground/50 mb-3" }),
          /* @__PURE__ */ jsx("p", { children: "No login history recorded yet." })
        ] }) }) }) })
      ] }) }),
      loginHistories.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-border flex flex-col sm:flex-row sm:justify-between items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Showing ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: (loginHistories.current_page - 1) * 10 + 1 }),
          " to ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: Math.min(loginHistories.current_page * 10, loginHistories.total) }),
          " of ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: loginHistories.total }),
          " entries"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: loginHistories.prev_page_url || "#",
              className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${!loginHistories.prev_page_url ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`,
              preserveScroll: true,
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: loginHistories.next_page_url || "#",
              className: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${!loginHistories.next_page_url ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`,
              preserveScroll: true,
              children: "Next"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  LoginHistory as default
};
