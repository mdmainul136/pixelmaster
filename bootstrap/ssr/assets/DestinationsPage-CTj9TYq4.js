import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Plus, CheckCircle2, Layers } from "lucide-react";
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
const fetchPlatforms = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/platforms");
    return data.platforms ?? [];
  } catch {
    return [];
  }
};
const fetchContainers = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/containers");
    return data.containers ?? [];
  } catch {
    return [];
  }
};
const destinationTypes = [
  { id: "ga4", name: "Google Analytics 4", icon: "📊", color: "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5" },
  { id: "facebook", name: "Meta (Facebook CAPI)", icon: "📘", color: "from-[hsl(220,60%,50%)]/15 to-[hsl(220,60%,50%)]/5" },
  { id: "tiktok", name: "TikTok Events API", icon: "🎵", color: "from-[hsl(340,75%,55%)]/15 to-[hsl(340,75%,55%)]/5" },
  { id: "snapchat", name: "Snapchat CAPI", icon: "👻", color: "from-[hsl(45,93%,47%)]/15 to-[hsl(45,93%,47%)]/5" },
  { id: "twitter", name: "Twitter/X CAPI", icon: "🐦", color: "from-[hsl(200,70%,50%)]/15 to-[hsl(200,70%,50%)]/5" }
];
const statusMap = {
  healthy: { color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Healthy" },
  degraded: { color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10", label: "Degraded" },
  down: { color: "text-destructive", bg: "bg-destructive/10", label: "Down" },
  unknown: { color: "text-muted-foreground", bg: "bg-muted/30", label: "Unknown" }
};
const DestinationsPage = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const { data: platforms = [] } = useQuery({ queryKey: ["tracking-platforms"], queryFn: fetchPlatforms });
  const { data: containers = [] } = useQuery({ queryKey: ["tracking-containers"], queryFn: fetchContainers });
  const addMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/tracking/containers/${selectedContainer}/destinations`, { type: selectedType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-platforms"] });
      setShowAdd(false);
      setSelectedType(null);
      toast.success("Destination added!");
    },
    onError: () => toast.error("Failed to add destination")
  });
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Destinations" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Manage marketing platform connections" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setShowAdd(!showAdd), className: "gap-2 rounded-xl", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Add Destination"
      ] })
    ] }),
    showAdd && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-primary/30 bg-card p-6 shadow-sm animate-fade-in", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground mb-4", children: "Add New Destination" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: "Container" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedContainer ?? "",
            onChange: (e) => setSelectedContainer(Number(e.target.value)),
            className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Choose container..." }),
              containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4", children: destinationTypes.map((dt) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSelectedType(dt.id),
          className: `group flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${selectedType === dt.id ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-accent/30"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${dt.color} text-lg`, children: dt.icon }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-card-foreground", children: dt.name }),
            selectedType === dt.id && /* @__PURE__ */ jsx(CheckCircle2, { className: "ml-auto h-4 w-4 text-primary" })
          ]
        },
        dt.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setShowAdd(false), className: "rounded-xl", children: "Cancel" }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => addMutation.mutate(), disabled: !selectedContainer || !selectedType, className: "rounded-xl gap-2", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add Destination"
        ] })
      ] })
    ] }),
    platforms.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: platforms.map((p, i) => {
      const st = statusMap[p.status] || statusMap.unknown;
      const dt = destinationTypes.find((d) => d.id === p.type);
      return /* @__PURE__ */ jsxs("div", { className: "group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${(dt == null ? void 0 : dt.color) ?? "from-primary/15 to-primary/5"} text-lg transition-transform duration-300 group-hover:scale-110`, children: (dt == null ? void 0 : dt.icon) ?? "📡" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-card-foreground", children: (dt == null ? void 0 : dt.name) ?? p.type }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: p.container_name })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Badge, { className: `text-[10px] ${st.bg} ${st.color}`, children: st.label })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted/30 p-3 text-center", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-card-foreground tabular-nums", children: [
              p.success_rate ?? "—",
              "%"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5", children: "Success" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted/30 p-3 text-center", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-card-foreground tabular-nums", children: [
              p.avg_latency_ms ?? "—",
              "ms"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5", children: "Latency" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted/30 p-3 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-card-foreground tabular-nums", children: p.error_count_24h ?? 0 }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5", children: "Errors 24h" })
          ] })
        ] })
      ] }, i);
    }) }) : /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-dashed border-border/60 bg-muted/20 p-12 text-center animate-fade-in", children: [
      /* @__PURE__ */ jsx(Layers, { className: "mx-auto h-12 w-12 text-muted-foreground/30 mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-card-foreground", children: "No Destinations" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Add GA4, Meta CAPI, TikTok, or other destinations" })
    ] })
  ] }) });
};
export {
  DestinationsPage as default
};
