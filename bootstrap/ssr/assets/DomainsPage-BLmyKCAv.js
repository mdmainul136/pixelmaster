import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { B as Button } from "./button-Dwr8R-lW.js";
import { Globe, Shield, Zap, CheckCircle2, Info, Copy, RefreshCcw, Clock, Lock, Server } from "lucide-react";
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
const caseConfig = {
  saas: {
    title: "SaaS Auto Domain",
    desc: "Instant setup — track.{tenant}.yoursaas.com",
    icon: Zap,
    badge: "Instant",
    badgeClass: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]",
    recommended: false
  },
  custom: {
    title: "Custom Domain",
    desc: "First-party cookies — track.yourdomain.com",
    icon: Shield,
    badge: "Recommended",
    badgeClass: "bg-primary/10 text-primary",
    recommended: true
  },
  existing: {
    title: "Existing Subdomain",
    desc: "Use your existing subdomain path /track",
    icon: Globe,
    badge: "Not Recommended",
    badgeClass: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]",
    recommended: false
  }
};
const DomainsPage = () => {
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [customDomain, setCustomDomain] = useState("");
  const { data: containers = [] } = useQuery({
    queryKey: ["tracking-containers"],
    queryFn: fetchContainers
  });
  const setupMutation = useMutation({
    mutationFn: async () => {
      const payload = { case: selectedCase };
      if (selectedCase === "custom") payload.domain = customDomain;
      const { data } = await axios.post(`/api/tracking/containers/${selectedContainer}/setup-domain`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
      toast.success("Domain configured successfully!");
      if (data == null ? void 0 : data.dns_instructions) {
        toast.info("Add the DNS records shown below to complete setup");
      }
    },
    onError: () => toast.error("Domain setup failed")
  });
  const verifyMutation = useMutation({
    mutationFn: async (domain) => {
      const { data } = await axios.post(`/api/v1/domains/${domain}/verify`);
      return data;
    },
    onSuccess: (data) => {
      if (data.success) toast.success(data.message || "Verification passed!");
      else toast.warning(data.message || "DNS verification is still pending.");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("DNS verification check failed.")
  });
  const oneClickMutation = useMutation({
    mutationFn: async (domain) => {
      const { data } = await axios.post(`/api/v1/domains/${domain}/one-click-setup`);
      return data;
    },
    onSuccess: (data) => {
      if (data.success) toast.success("One-Click setup complete!");
      else toast.error("One-Click setup failed.");
      queryClient.invalidateQueries({ queryKey: ["tracking-containers"] });
    },
    onError: () => toast.error("Failed to connect to Domain Provider.")
  });
  return /* @__PURE__ */ jsx(DashboardLayout, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Tracking Domains" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Configure first-party tracking domains for your containers" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: Object.entries(caseConfig).map(([key, cfg]) => {
      const Icon = cfg.icon;
      const isSelected = selectedCase === key;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSelectedCase(key),
          className: `group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:shadow-md ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 bg-card hover:border-border"}`,
          children: [
            cfg.recommended && /* @__PURE__ */ jsx("span", { className: "absolute -top-2.5 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider", children: "Recommended" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${isSelected ? "bg-primary/15 text-primary" : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: cfg.title }),
                  /* @__PURE__ */ jsx(Badge, { className: `text-[9px] ${cfg.badgeClass}`, children: cfg.badge })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: cfg.desc })
              ] })
            ] }),
            isSelected && /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-primary" }) })
          ]
        },
        key
      );
    }) }),
    selectedCase && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-base font-semibold text-card-foreground mb-4", children: [
        "Configure ",
        caseConfig[selectedCase].title
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: "Select Container" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedContainer ?? "",
            onChange: (e) => setSelectedContainer(Number(e.target.value)),
            className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Choose a container..." }),
              containers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
            ]
          }
        )
      ] }),
      selectedCase === "custom" && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground mb-1.5 block", children: "Custom Domain" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: customDomain,
            onChange: (e) => setCustomDomain(e.target.value),
            placeholder: "track.yourdomain.com",
            className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Info, { className: "h-3 w-3" }),
          " You'll need to add a CNAME record pointing to our tracking server"
        ] })
      ] }),
      selectedCase === "custom" && customDomain && /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-xl border border-border/40 bg-muted/20 p-4", children: [
        /* @__PURE__ */ jsxs("h4", { className: "text-xs font-semibold text-card-foreground mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4 text-primary" }),
          " DNS Records Required"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-lg bg-background p-3", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px] font-mono w-16 justify-center", children: "CNAME" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-xs font-mono text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { className: "text-card-foreground", children: customDomain }),
            /* @__PURE__ */ jsx("span", { className: "mx-2", children: "→" }),
            /* @__PURE__ */ jsx("span", { children: "tracking.yoursaas.com" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            navigator.clipboard.writeText("tracking.yoursaas.com");
            toast.success("Copied!");
          }, className: "rounded-lg p-1.5 hover:bg-accent transition-colors", children: /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSelectedCase(null), className: "rounded-xl", children: "Cancel" }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => setupMutation.mutate(),
            disabled: !selectedContainer || setupMutation.isPending || selectedCase === "custom" && !customDomain,
            className: "rounded-xl gap-2",
            children: [
              setupMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
              "Setup Domain"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6", children: [
      containers.filter((c) => c.domain && !c.is_verified).length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-amber-100 bg-amber-50/20 p-6 shadow-sm animate-fade-in mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-base font-black text-slate-900 tracking-tight flex items-center gap-2", children: [
              "Pending Verification",
              /* @__PURE__ */ jsx("span", { className: "flex h-2 w-2 rounded-full bg-amber-500 animate-ping" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-500 mt-0.5", children: "Action required: Update your DNS records to activate these domains." })
          ] }),
          /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 text-[10px] uppercase font-black tracking-widest animate-pulse", children: "Verifying DNS Propagation" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: containers.filter((c) => c.domain && !c.is_verified).map((c) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-slate-100 bg-slate-50/50 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm ring-1 ring-amber-500/20", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-base font-black text-slate-900 leading-none", children: c.domain }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest", children: c.name })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-[10px] font-black uppercase tracking-widest gap-2 bg-white rounded-xl shadow-sm border-slate-200", onClick: () => oneClickMutation.mutate(c.domain), disabled: oneClickMutation.isPending, children: [
                oneClickMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-amber-500" }),
                " One-Click Setup"
              ] }),
              /* @__PURE__ */ jsxs(Button, { size: "sm", className: "h-8 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl shadow-sm", onClick: () => verifyMutation.mutate(c.domain), disabled: verifyMutation.isPending, children: [
                verifyMutation.isPending ? /* @__PURE__ */ jsx(RefreshCcw, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Shield, { className: "h-3 w-3" }),
                " Verify DNS"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Step 1: DNS" }),
                /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600 animate-pulse", children: /* @__PURE__ */ jsx(RefreshCcw, { className: "h-3 w-3" }) })
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 mb-1", children: "CNAME Connectivity" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-500 leading-relaxed font-medium", children: [
                "Checking if ",
                c.domain,
                " points to sGTM server."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden opacity-60 bg-white`, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Step 2: Security" }),
                /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4 text-slate-300" })
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 mb-1", children: "SSL Certificate" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium", children: "Automatic issuance after DNS verification." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden opacity-60 bg-white", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Step 3: Online" }),
                /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4 text-slate-300" })
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 mb-1", children: "Global Delivery" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 font-medium", children: "Live traffic routing through Edge nodes." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-background p-3 border border-border/40", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "CNAME Record" }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] h-4", children: "Required" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("code", { className: "text-[11px] text-primary truncate", children: c.cname_target }),
                /* @__PURE__ */ jsx("button", { onClick: () => {
                  navigator.clipboard.writeText(c.cname_target);
                  toast.success("CNAME copied!");
                }, className: "p-1 hover:bg-accent rounded", children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3 text-muted-foreground" }) })
              ] })
            ] }),
            c.verification_token && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-background p-3 border border-border/40", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider", children: "TXT Verification" }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] h-4", children: "Owner Check" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxs("code", { className: "text-[11px] text-primary truncate", children: [
                  "_verify.",
                  c.domain
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => {
                  navigator.clipboard.writeText(c.verification_token);
                  toast.success("Token copied!");
                }, className: "p-1 hover:bg-accent rounded", children: /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3 text-muted-foreground" }) })
              ] })
            ] })
          ] })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-sm animate-fade-in", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-card-foreground mb-4", children: "Active Tracking Domains" }),
        containers.filter((c) => c.is_verified).length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: containers.filter((c) => c.is_verified).map((c) => {
          var _a;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/40 p-4 hover:bg-accent/30 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] shadow-sm", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-card-foreground", children: c.domain || c.name }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-muted-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Server, { className: "h-3 w-3" }),
                  " ",
                  c.deployment_type === "shared" ? "Shared Infra" : "Dedicated",
                  " • ",
                  c.deploy_status || "Active"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex flex-col items-end mr-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-muted-foreground uppercase", children: "Today's Traffic" }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-card-foreground", children: [
                  (_a = c.events_today) == null ? void 0 : _a.toLocaleString(),
                  " events"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Badge, { className: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[10px] px-2.5", children: "Live" }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
                navigator.clipboard.writeText("https://" + (c.domain || c.transport_url));
                toast.success("URL copied!");
              }, className: "rounded-lg p-2 hover:bg-accent transition-colors border border-border/40 bg-background shadow-xs", children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 text-muted-foreground" }) })
            ] })
          ] }, c.id);
        }) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Globe, { className: "h-8 w-8 text-muted-foreground/40" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-[240px]", children: "No active domains found. Setup a domain above to begin tracking." })
        ] })
      ] })
    ] })
  ] }) });
};
export {
  DomainsPage as default
};
