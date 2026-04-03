import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { useQuery } from "@tanstack/react-query";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { RefreshCcw, Search, Activity, CheckCircle2, XCircle, Copy, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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
import "@radix-ui/react-slot";
const fetchEvents = async (params) => {
  try {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v !== 0).map(([k, v]) => [k, String(v)])
    ).toString();
    const { data } = await axios.get(`/api/tracking/dashboard/events/feed?${qs}`);
    return data;
  } catch {
    return { data: [], current_page: 1, last_page: 1 };
  }
};
const statusBadge = {
  processed: { color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Processed" },
  failed: { color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
  deduped: { color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10", label: "Deduped" },
  pending: { color: "text-muted-foreground", bg: "bg-muted/30", label: "Pending" }
};
const EventLogsPage = () => {
  const { props } = usePage();
  const pageProps = props;
  const activeTenantId = pageProps.active_container_id;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ event_name: "", status: "", per_page: 25 });
  const { data: result, isLoading, refetch } = useQuery({
    queryKey: ["tracking-events", page, filters, activeTenantId],
    queryFn: () => fetchEvents({ ...filters, page, tenant_id: activeTenantId }),
    refetchInterval: 15e3
  });
  const events = (result == null ? void 0 : result.data) ?? [];
  const currentPage = (result == null ? void 0 : result.current_page) ?? 1;
  const lastPage = (result == null ? void 0 : result.last_page) ?? 1;
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Event Logs" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Real-time event feed across all containers" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => refetch(), className: "gap-2 rounded-xl", children: [
        /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4" }),
        " Refresh"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1 block", children: "Event Name" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: filters.event_name,
              onChange: (e) => {
                setFilters((p) => ({ ...p, event_name: e.target.value }));
                setPage(1);
              },
              placeholder: "Search events...",
              className: "w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-40", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1 block", children: "Status" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.status,
            onChange: (e) => {
              setFilters((p) => ({ ...p, status: e.target.value }));
              setPage(1);
            },
            className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
              /* @__PURE__ */ jsx("option", { value: "processed", children: "Processed" }),
              /* @__PURE__ */ jsx("option", { value: "failed", children: "Failed" }),
              /* @__PURE__ */ jsx("option", { value: "deduped", children: "Deduped" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5 text-[hsl(160,84%,39%)]" }),
        /* @__PURE__ */ jsx("span", { children: "Auto-refreshes every 15s" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden animate-fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 bg-muted/20", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Event" }),
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Country" }),
          /* @__PURE__ */ jsx("th", { className: "text-right text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Value" }),
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Source IP" }),
          /* @__PURE__ */ jsx("th", { className: "text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-3 px-4", children: "Time" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: events.length > 0 ? events.map((evt) => {
          const st = statusBadge[evt.status] || statusBadge.pending;
          return /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/20 hover:bg-accent/30 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-medium text-card-foreground", children: evt.event_name }) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.color}`, children: [
              evt.status === "processed" && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
              evt.status === "failed" && /* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3" }),
              evt.status === "deduped" && /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
              st.label
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-xs text-muted-foreground", children: evt.country || "—" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-right tabular-nums text-xs font-medium text-card-foreground", children: evt.value ? `$${evt.value}` : "—" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-xs text-muted-foreground font-mono", children: evt.source_ip || "—" }),
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
              evt.processed_at ? new Date(evt.processed_at).toLocaleString() : "—"
            ] }) })
          ] }, evt.id);
        }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 6, className: "py-12 text-center", children: [
          /* @__PURE__ */ jsx(Activity, { className: "mx-auto h-8 w-8 text-muted-foreground/30 mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No events found" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Events will appear here when your containers start tracking" })
        ] }) }) })
      ] }) }),
      lastPage > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border/40 px-4 py-3", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Page ",
          currentPage,
          " of ",
          lastPage
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: currentPage <= 1, className: "rounded-lg h-8 w-8 p-0", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.min(lastPage, p + 1)), disabled: currentPage >= lastPage, className: "rounded-lg h-8 w-8 p-0", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) })
        ] })
      ] })
    ] })
  ] }) });
};
export {
  EventLogsPage as default
};
