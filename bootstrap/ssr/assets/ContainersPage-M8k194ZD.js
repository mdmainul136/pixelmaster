import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Shield, CheckCircle2, Server, Activity, RefreshCcw, Zap, Plus, XCircle, Clock, Square, Globe, Settings, Copy, AlertTriangle } from "lucide-react";
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
const fetchContainers = async (tenantId) => {
  const url = `/api/tracking/dashboard/containers${tenantId ? `?tenant_id=${tenantId}` : ""}`;
  const { data } = await axios.get(url);
  return data.containers ?? [];
};
const statusConfig = {
  running: { icon: CheckCircle2, color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Running" },
  deployed: { icon: CheckCircle2, color: "text-[hsl(160,84%,39%)]", bg: "bg-[hsl(160,84%,39%)]/10", label: "Deployed" },
  stopped: { icon: Square, color: "text-muted-foreground", bg: "bg-muted/30", label: "Stopped" },
  pending: { icon: Clock, color: "text-[hsl(38,92%,50%)]", bg: "bg-[hsl(38,92%,50%)]/10", label: "Pending" },
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
  provisioned: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Provisioned" }
};
const ContainersPage = () => {
  var _a;
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newConfig, setNewConfig] = useState("");
  const [serverLocation, setServerLocation] = useState("global");
  const [deploymentType, setDeploymentType] = useState("docker");
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [activeSnippetContainer, setActiveSnippetContainer] = useState(null);
  const [snippetData, setSnippetData] = useState(null);
  const [snippetLoading, setSnippetLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(null);
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedScript(null), 2e3);
  };
  const openSnippetModal = async (container) => {
    setActiveSnippetContainer(container);
    setSnippetModalOpen(true);
    setSnippetLoading(true);
    try {
      const { data } = await axios.get(`/api/tracking/snippet`);
      setSnippetData(data);
    } catch {
      toast.error("Failed to fetch container snippet configuration");
    } finally {
      setSnippetLoading(false);
    }
  };
  const { props } = usePage();
  const pageProps = props;
  const activeTenantId = pageProps.active_container_id;
  const { data: containers = [], isLoading, error } = useQuery({
    queryKey: ["tracking-containers", activeTenantId],
    queryFn: () => fetchContainers(activeTenantId),
    retry: false
  });
  const isLocked = ((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.status) === 402;
  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/subscriptions/plans");
      return data.data;
    }
  });
  const handleCreateOrPay = async () => {
    if (selectedPlan !== "starter" || isLocked) {
      setPaymentLoading(true);
      try {
        const { data } = await axios.post("/api/v1/payment/checkout", {
          plan_slug: selectedPlan,
          subscription_type: "monthly",
          token_tenant_id: activeTenantId
        });
        if (data.success && data.data.url) {
          window.location.href = data.data.url;
          return;
        }
      } catch (err) {
        toast.error("Failed to initiate payment. Please try again.");
      } finally {
        setPaymentLoading(false);
      }
      return;
    }
    createMutation.mutate();
  };
  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/tracking/containers", {
        name: newName,
        container_config: newConfig,
        server_location: serverLocation,
        deployment_type: deploymentType
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      setShowCreate(false);
      setNewName("");
      setNewConfig("");
      setServerLocation("global");
      toast.success("Container created successfully!");
    },
    onError: () => toast.error("Failed to create container")
  });
  useMutation({
    mutationFn: async (id) => {
      await axios.post(`/api/tracking/containers/${id}/deploy`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      toast.success("Deployment triggered");
    },
    onError: () => toast.error("Deployment failed")
  });
  const provisionAnalyticsMutation = useMutation({
    mutationFn: async (id) => {
      await axios.post(`/api/tracking/containers/${id}/provision-analytics`);
    },
    onSuccess: () => toast.success("Analytics provisioning started!"),
    onError: () => toast.error("Analytics provisioning failed")
  });
  const syncMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/api/tracking/dashboard/health/sync");
    },
    onSuccess: () => toast.success("Infrastructure mappings synchronized successfully!"),
    onError: () => toast.error("Infrastructure sync failed")
  });
  if (isLocked) {
    return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "shopify-card p-12 text-center bg-slate-50 border-destructive/20 shadow-none mt-8", children: [
      /* @__PURE__ */ jsx(Shield, { className: "mx-auto h-12 w-12 text-destructive mb-6" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-4", children: "Account Suspended" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-lg mx-auto mb-10 text-sm leading-relaxed", children: "Your tracking infrastructure is currently inactive. Please select a plan to restore your global server nodes and event processing." }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto", children: plansData == null ? void 0 : plansData.map((plan) => {
        var _a2, _b, _c, _d;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `shopify-card p-8 transition-all cursor-pointer flex flex-col relative ${selectedPlan === plan.plan_key ? "border-accent ring-1 ring-accent bg-accent/5 shadow-sm" : "bg-white hover:border-slate-400"}`,
            onClick: () => setSelectedPlan(plan.plan_key),
            children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-lg font-bold mb-1 uppercase tracking-tight flex items-center justify-between", children: [
                plan.name,
                selectedPlan === plan.plan_key && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-accent" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-3xl font-black mb-6", children: [
                "$",
                parseFloat(plan.price_monthly).toFixed(0),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground ml-1.5 uppercase", children: "/ mo" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3 mb-8 text-left border-t border-slate-100 pt-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs font-bold text-foreground", children: [
                  /* @__PURE__ */ jsx(Server, { className: "h-4 w-4 text-accent" }),
                  ((_a2 = plan.quotas) == null ? void 0 : _a2.containers) === -1 ? "Unlimited" : (_b = plan.quotas) == null ? void 0 : _b.containers,
                  " Containers"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs font-bold text-foreground", children: [
                  /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-accent" }),
                  (_d = (_c = plan.quotas) == null ? void 0 : _c.events) == null ? void 0 : _d.toLocaleString(),
                  " Events / mo"
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  className: `w-full rounded-lg font-bold ${selectedPlan === plan.plan_key ? "bg-accent hover:bg-accent/90" : ""}`,
                  variant: selectedPlan === plan.plan_key ? "default" : "outline",
                  onClick: () => handleCreateOrPay(),
                  disabled: paymentLoading && selectedPlan === plan.plan_key,
                  children: paymentLoading && selectedPlan === plan.plan_key ? "Processing..." : "Choose Plan"
                }
              )
            ]
          },
          plan.id
        );
      }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-b border-border pb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Active Containers" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => syncMutation.mutate(),
              className: "text-[11px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1.5",
              disabled: syncMutation.isPending,
              children: [
                syncMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
                "Refresh Infrastructure"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setShowCreate(!showCreate), className: "rounded-lg font-bold px-6 shadow-sm", children: showCreate ? "Cancel" : "Add Container" })
      ] }),
      showCreate && /* @__PURE__ */ jsx("div", { className: "shopify-card p-8 bg-slate-50/50 shadow-none border-dashed animate-in slide-in-from-top-4 duration-300", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1", children: "Container Identity" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: newName,
                onChange: (e) => setNewName(e.target.value),
                placeholder: "e.g. Master GTM (Production)",
                className: "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1", children: "GTM Configuration (ID)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: newConfig,
                onChange: (e) => setNewConfig(e.target.value),
                placeholder: "GTM-XXXXXXX",
                className: "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1", children: "Edge Server Region" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: serverLocation,
                onChange: (e) => setServerLocation(e.target.value),
                className: "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "global", children: "Auto (Nearest Node)" }),
                  /* @__PURE__ */ jsx("option", { value: "us", children: "United States (Standard)" }),
                  /* @__PURE__ */ jsx("option", { value: "eu", children: "Europe (GDPR Optimized)" }),
                  /* @__PURE__ */ jsx("option", { value: "asia", children: "Asia (Singapore)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1", children: "Infrastructure Capacity" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: deploymentType,
                onChange: (e) => setDeploymentType(e.target.value),
                className: "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all shadow-sm cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "docker", children: "Single VPS (Standard)" }),
                  /* @__PURE__ */ jsx("option", { value: "kubernetes", children: "Auto-scaling Cluster (High Traffic)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-slate-200", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-black uppercase tracking-widest text-primary mb-4 block", children: "Select Network Plan" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: plansData == null ? void 0 : plansData.map((plan) => {
            var _a2, _b;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `p-4 rounded-lg border transition-all cursor-pointer ${selectedPlan === plan.plan_key ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-slate-200 bg-white hover:border-slate-300"}`,
                onClick: () => setSelectedPlan(plan.plan_key),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-xs", children: plan.name }),
                    selectedPlan === plan.plan_key && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-accent" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-lg font-black", children: [
                    "$",
                    parseFloat(plan.price_monthly).toFixed(0)
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: [
                    (_b = (_a2 = plan.quotas) == null ? void 0 : _a2.events) == null ? void 0 : _b.toLocaleString(),
                    " Monthly Events"
                  ] })
                ]
              },
              plan.id
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end pt-8", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setShowCreate(false), className: "text-xs font-bold uppercase tracking-widest", children: "Discard" }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => handleCreateOrPay(),
              disabled: !newName || createMutation.isPending || paymentLoading,
              className: "rounded-lg px-8 font-bold shadow-md h-11",
              children: [
                createMutation.isPending || paymentLoading ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                selectedPlan === "starter" ? "Create Container" : "Authorize & Provision"
              ]
            }
          )
        ] })
      ] }) }),
      containers.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: containers.map((container) => {
        var _a2;
        const status = statusConfig[container.deploy_status] || statusConfig.pending;
        const StatusIcon = status.icon;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "shopify-card group hover:border-slate-400 transition-all duration-200 flex flex-col",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "p-6 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary border border-border", children: /* @__PURE__ */ jsx(Server, { className: "h-5 w-5" }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-foreground", children: container.name }),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: container.container_id || "Provisioned" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${status.bg} ${status.color} border border-current opacity-80`, children: [
                    /* @__PURE__ */ jsx(StatusIcon, { className: "h-2.5 w-2.5" }),
                    status.label
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-100", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1", children: "Today's Traffic" }),
                    /* @__PURE__ */ jsx("div", { className: "text-lg font-black tabular-nums", children: ((_a2 = container.events_today) == null ? void 0 : _a2.toLocaleString()) ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1", children: "Connections" }),
                    /* @__PURE__ */ jsx("div", { className: "text-lg font-black tabular-nums", children: container.destinations ?? 0 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2 truncate", children: [
                  /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5 text-accent" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: container.transport_url || "Configuring subdomain..." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-muted/30 border-t border-border flex items-center gap-2 rounded-b-xl", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "flex-1 rounded-md text-[11px] font-bold uppercase border-slate-300 hover:bg-white shadow-none",
                    onClick: () => openSnippetModal(container),
                    children: "Installation"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "flex-1 rounded-md text-[11px] font-bold uppercase border-slate-300 hover:bg-white shadow-none",
                    onClick: () => provisionAnalyticsMutation.mutate(container.id),
                    disabled: provisionAnalyticsMutation.isPending,
                    children: provisionAnalyticsMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-3 w-3 animate-spin" }) : "Sync"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    className: "rounded-md px-3 bg-primary",
                    asChild: true,
                    children: /* @__PURE__ */ jsx("a", { href: `/containers/${container.id}/settings`, children: /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5 text-white" }) })
                  }
                )
              ] })
            ]
          },
          container.id
        );
      }) }) : /* @__PURE__ */ jsxs("div", { className: "shopify-card p-20 text-center border-dashed border-2 bg-slate-50/50 shadow-none", children: [
        /* @__PURE__ */ jsx(Server, { className: "mx-auto h-12 w-12 text-slate-300 mb-6" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-foreground", children: "Build your tracking engine" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 max-w-sm mx-auto", children: "Deploy your first sGTM server-side container to start collecting 1st-party data globally." }),
        /* @__PURE__ */ jsx(Button, { onClick: () => setShowCreate(true), className: "mt-8 px-10 font-bold shadow-md rounded-lg", children: "Start Configuration" })
      ] })
    ] }),
    snippetModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300 p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl rounded-xl bg-white shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-300", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-primary shadow-sm", children: /* @__PURE__ */ jsx(Copy, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground", children: "Container Installation" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Standard 1st-party telemetry snippet." })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "p-2 rounded-lg hover:bg-slate-200 transition-colors",
            onClick: () => setSnippetModalOpen(false),
            children: /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-muted-foreground" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-8 max-h-[70vh] overflow-y-auto space-y-8", children: snippetLoading ? /* @__PURE__ */ jsxs("div", { className: "flex py-12 items-center justify-center flex-col gap-4", children: [
        /* @__PURE__ */ jsx(RefreshCcw, { className: "h-10 w-10 animate-spin text-accent" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: "Provisioning secure snippet..." })
      ] }) : snippetData ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-foreground", children: "Phase 1: Header Deployment" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "text-xs font-black text-accent hover:underline flex items-center gap-1.5",
                onClick: () => copyToClipboard(snippetData.gtm_snippet, "gtm"),
                children: [
                  copiedScript === "gtm" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                  copiedScript === "gtm" ? "Success" : "Copy"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx("pre", { className: "rounded-lg border border-slate-200 bg-slate-800 p-5 overflow-x-auto shadow-inner text-[11px] leading-relaxed text-emerald-400 font-mono", children: snippetData.gtm_snippet }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-foreground", children: "Phase 2: Body Fallback" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "text-xs font-black text-accent hover:underline flex items-center gap-1.5",
                onClick: () => copyToClipboard(snippetData.gtm_noscript, "noscript"),
                children: [
                  copiedScript === "noscript" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                  copiedScript === "noscript" ? "Success" : "Copy"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("pre", { className: "rounded-lg border border-slate-200 bg-slate-800 p-5 overflow-x-auto shadow-inner text-[11px] leading-relaxed text-amber-300 font-mono", children: snippetData.gtm_noscript })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-accent/5 border border-accent/10", children: [
            /* @__PURE__ */ jsx("h5", { className: "text-[11px] font-black uppercase text-accent mb-1 tracking-widest", children: "Enhanced Privacy" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Encrypted 1st-party cookie resolution active for this container path." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg bg-slate-50 border border-slate-200", children: [
            /* @__PURE__ */ jsx("h5", { className: "text-[11px] font-black uppercase text-foreground mb-1 tracking-widest", children: "Browser Optimized" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Compressed JS delivery for 95+ Pagespeed performance." })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "mx-auto h-8 w-8 text-amber-500 mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold uppercase tracking-widest text-muted-foreground", children: "Configuration Mismatch" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-50 px-8 py-5 flex justify-end border-t border-slate-200", children: /* @__PURE__ */ jsx(Button, { onClick: () => setSnippetModalOpen(false), className: "rounded-lg px-8 font-bold", children: "Complete" }) })
    ] }) })
  ] });
};
export {
  ContainersPage as default
};
