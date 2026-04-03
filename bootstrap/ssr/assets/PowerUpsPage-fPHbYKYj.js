import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { usePage } from "@inertiajs/react";
import { LayoutGrid, RefreshCcw, Zap, Layers, Database, List, Bug, MousePointer, ShoppingBag, ShoppingCart, Clock, Calendar, ShieldOff, Cloud, Users, Target, Code, Table, Activity, Shield, Fingerprint, BarChart3, Globe, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
const PLAN_HIERARCHY = ["free", "pro", "business", "enterprise", "custom"];
function useFeature() {
  const { features = [], plan = "free" } = usePage().props;
  const hasFeature = (featureKey) => features.includes(featureKey);
  const requiresPlan = (featureKey) => {
    const featureMap = {
      // Phase 1 Core â€” Free+
      custom_domain: "free",
      custom_loader: "free",
      pixelmaster_analytics: "free",
      anonymizer: "free",
      http_header_config: "free",
      global_cdn: "free",
      geo_headers: "free",
      user_agent_info: "free",
      pixelmaster_api: "free",
      user_id: "free",
      open_container_bot_index: "free",
      click_id_restorer: "free",
      service_account: "free",
      // Phase 1 Core â€” Pro+
      logs: "pro",
      cookie_keeper: "pro",
      bot_detection: "pro",
      ad_blocker_info: "pro",
      poas_data_feed: "pro",
      pixelmaster_store: "pro",
      // Phase 2 Infrastructure â€” Business+
      multi_zone_infrastructure: "business",
      multi_domains: "business",
      monitoring: "business",
      file_proxy: "business",
      xml_to_json: "business",
      block_request_by_ip: "business",
      schedule_requests: "business",
      request_delay: "business",
      // Phase 2 Infrastructure â€” Custom only
      custom_logs_retention: "custom",
      dedicated_ip: "custom",
      private_cluster: "custom",
      // Phase 3 Account â€” Free+
      transfer_ownership: "free",
      consolidated_invoice: "free",
      share_access: "free",
      two_factor_auth: "free",
      // Phase 3 Account â€” Pro+
      google_sheets_connection: "pro",
      // Phase 3 Account â€” Custom only
      single_sign_on: "custom",
      // Phase 4 Connections â€” Pro+
      data_manager_api: "pro",
      google_ads_connection: "pro",
      microsoft_ads_connection: "pro",
      meta_custom_audiences: "pro"
    };
    return featureMap[featureKey] ?? null;
  };
  const requiredPlanLabel = (featureKey) => {
    const tier = requiresPlan(featureKey);
    if (!tier) return null;
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  const currentFeatures = features;
  const isPlanAtLeast = (requiredTier) => {
    const currentIndex = PLAN_HIERARCHY.indexOf(plan);
    const requiredIndex = PLAN_HIERARCHY.indexOf(requiredTier);
    if (currentIndex === -1 || requiredIndex === -1) return false;
    return currentIndex >= requiredIndex;
  };
  return {
    plan,
    features: currentFeatures,
    hasFeature,
    requiresPlan,
    requiredPlanLabel,
    isPlanAtLeast
  };
}
const iconComponentMap = {
  globe: Globe,
  zap: Zap,
  "bar-chart-3": BarChart3,
  fingerprint: Fingerprint,
  "file-text": Activity,
  shield: Shield,
  "brain-circuit": Bug,
  layers: Layers,
  activity: Activity,
  table: Table,
  code: Code,
  target: Target,
  users: Users,
  cloud: Cloud,
  "shield-off": ShieldOff,
  calendar: Calendar,
  clock: Clock,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "mouse-pointer": MousePointer,
  bug: Bug,
  list: List,
  database: Database
};
const categoryMap = {
  all: "All Extensions",
  tracking: "Tracking & Core",
  connectivity: "Connectivity",
  infrastructure: "Advanced Infra",
  integration: "Integrations"
};
const PowerUpsPage = () => {
  const { auth } = usePage().props;
  const { hasFeature, plan, requiredPlanLabel } = useFeature();
  const queryClient = useQueryClient();
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [enabledPowerUps, setEnabledPowerUps] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const { data: containers = [] } = useQuery({
    queryKey: ["tracking-containers"],
    queryFn: async () => {
      const { data } = await axios.get("/api/tracking/dashboard/containers");
      return data.containers ?? [];
    }
  });
  const { data: registry = [] } = useQuery({
    queryKey: ["power-up-registry"],
    queryFn: async () => {
      const { data } = await axios.get("/api/tracking/power-ups");
      return data.data ?? [];
    }
  });
  useEffect(() => {
    if (selectedContainer) {
      const container = containers.find((c) => c.id === selectedContainer);
      if (container && container.power_ups) {
        const enabled = {};
        container.power_ups.forEach((key) => enabled[key] = true);
        setEnabledPowerUps(enabled);
      } else {
        setEnabledPowerUps({});
      }
    }
  }, [selectedContainer, containers]);
  const filteredPowerUps = useMemo(() => {
    if (activeTab === "all") return registry;
    return registry.filter((pu) => pu.category === activeTab);
  }, [registry, activeTab]);
  const togglePowerUp = (id) => {
    setEnabledPowerUps((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const power_ups = Object.keys(enabledPowerUps).filter((key) => enabledPowerUps[key]);
      await axios.put(`/api/tracking/containers/${selectedContainer}/power-ups`, { power_ups });
    },
    onSuccess: () => {
      toast.success("PixelMaster Store settings updated!");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("Failed to save store settings")
  });
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-8 pb-20", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse", children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight text-foreground", children: "PixelMaster Store" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[10px]", children: [
              plan,
              " Plan"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "â€¢ Server-side Extensions" })
          ] })
        ] })
      ] }),
      selectedContainer && /* @__PURE__ */ jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: saveMutation.isPending, className: "gap-2 rounded-xl h-12 px-8 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95", children: [
        saveMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
        "Update Container Config"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black uppercase tracking-widest text-muted-foreground block px-1", children: "Selected Container" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: selectedContainer ?? "",
              onChange: (e) => setSelectedContainer(Number(e.target.value) || null),
              className: "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a container..." }),
                containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1.5 p-1 rounded-2xl border border-border/40 bg-muted/20", children: Object.entries(categoryMap).map(([key, label]) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(key),
            className: `flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === key ? "bg-card text-primary shadow-sm border border-border/40" : "text-muted-foreground hover:bg-card/50 hover:text-foreground"}`,
            children: [
              label,
              activeTab === key && /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" })
            ]
          },
          key
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: !selectedContainer ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/60 bg-muted/5", children: [
        /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Layers, { className: "h-8 w-8 text-muted-foreground/40" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground", children: "Select an operational container" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center max-w-xs mt-1", children: "Choose a container from the sidebar to view and manage available power-ups." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: filteredPowerUps.map((pu) => {
        const Icon = iconComponentMap[pu.icon] || Sparkles;
        const isUnlocked = hasFeature(pu.id) || hasFeature("pixelmaster_store");
        const isEnabled = enabledPowerUps[pu.id] ?? false;
        const isRestricted = !isUnlocked;
        const neededPlan = requiredPlanLabel(pu.id) ?? (pu.tier ? pu.tier.charAt(0).toUpperCase() + pu.tier.slice(1) : "Pro");
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `group relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-2xl animate-fade-in overflow-hidden ${isEnabled ? "border-primary/40 bg-card shadow-md shadow-primary/5" : "border-border/60 bg-card shadow-sm"} ${isRestricted ? "opacity-80" : ""}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0", children: /* @__PURE__ */ jsx(Badge, { className: `rounded-none rounded-bl-lg border-none font-black uppercase text-[8px] px-3 py-1 ${pu.tier === "business" ? "bg-indigo-600 text-white" : pu.tier === "pro" ? "bg-primary text-white" : "bg-muted text-muted-foreground border border-border"}`, children: pu.tier }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-5", children: [
                /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 bg-muted/40 group-hover:bg-primary group-hover:text-white`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" }) }),
                isRestricted ? /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground", children: /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5" }) }) : /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => togglePowerUp(pu.id),
                    className: `relative h-7 w-12 rounded-full transition-all duration-300 ${isEnabled ? "bg-primary" : "bg-muted"} cursor-pointer`,
                    children: /* @__PURE__ */ jsx("span", { className: `absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ${isEnabled ? "left-[22px]" : "left-0.5"}` })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "text-[16px] font-black text-foreground mb-1.5", children: pu.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed font-medium mb-5 min-h-[32px]", children: pu.description || "Available extensions for sGTM tracking containers." }),
              isRestricted ? /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  className: "w-full text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl h-10 transition-all",
                  onClick: () => window.location.href = "/settings/plans",
                  children: [
                    "Unlock with ",
                    neededPlan
                  ]
                }
              ) : isEnabled ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Badge, { className: "bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none px-3 py-1", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
                " Active on Server"
              ] }) }) : /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-muted-foreground/40" }),
                " Disabled"
              ] })
            ]
          },
          pu.id
        );
      }) }) })
    ] })
  ] }) });
};
export {
  PowerUpsPage as default
};
