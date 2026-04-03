import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React__default, { useState, useRef, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { C as Card, a as CardContent } from "./card-ByYW05sv.js";
import { Server, Globe, Code, Check, Cpu, Rocket, Loader2, CheckCircle2, AlertCircle, RefreshCw, Copy, Shield, Zap, ChevronDown, PartyPopper, ArrowRight, Activity, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import "@tanstack/react-query";
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
import "@radix-ui/react-label";
const steps = [
  { id: "container", label: "Container", icon: Server },
  { id: "domain", label: "Domain", icon: Globe },
  { id: "embed", label: "Embed Code", icon: Code },
  { id: "done", label: "Complete", icon: Check }
];
const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)", flag: "🇺🇸" },
  { value: "us-west-2", label: "US West (Oregon)", flag: "🇺🇸" },
  { value: "eu-west-1", label: "Europe (Ireland)", flag: "🇮🇪" },
  { value: "eu-central-1", label: "Europe (Frankfurt)", flag: "🇩🇪" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)", flag: "🇸🇬" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)", flag: "🇮🇳" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)", flag: "🇯🇵" },
  { value: "sa-east-1", label: "South America (São Paulo)", flag: "🇧🇷" },
  { value: "global", label: "Global Multi-Zone", flag: "🌍" }
];
function Onboarding() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDir, setSlideDir] = useState("forward");
  const [isAnimating, setIsAnimating] = useState(false);
  const [containerName, setContainerName] = useState("");
  const [gtmConfig, setGtmConfig] = useState("");
  const [serverLocation, setServerLocation] = useState("global");
  const [deploymentType, setDeploymentType] = useState("docker");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState("idle");
  const [containerId, setContainerId] = useState(null);
  const [trackingDomain, setTrackingDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [dnsInstructions, setDnsInstructions] = useState(null);
  const [isDomainSetup, setIsDomainSetup] = useState(false);
  const [snippet, setSnippet] = useState("");
  const [transportUrl, setTransportUrl] = useState("");
  const [measurementId, setMeasurementId] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [embedTab, setEmbedTab] = useState("gtag");
  const pollRef = useRef(null);
  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);
  const animateStep = useCallback((next) => {
    setSlideDir(next > currentStep ? "forward" : "backward");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsAnimating(false);
    }, 150);
  }, [currentStep]);
  const handleCreateContainer = async () => {
    if (!containerName || !serverLocation) return;
    setShowConsole(true);
    setIsDeploying(true);
    setConsoleLogs(["Initializing...", "Provisioning sGTM container..."]);
    try {
      const response = await axios.post(`/api/tracking/containers`, {
        name: containerName,
        server_location: serverLocation,
        deployment_type: deploymentType,
        container_config: gtmConfig
      });
      if (response.data.success) {
        setConsoleLogs((prev) => [...prev, "Queueing registration...", "Processing..."]);
        setTimeout(() => {
          setConsoleLogs((prev) => [...prev, "Registration accepted ✓"]);
          setTimeout(() => {
            const subdomain = "pixelmaster.com";
            setConsoleLogs((prev) => [...prev, `Subdomain reserved: ${subdomain}`]);
            setTimeout(() => {
              setConsoleLogs((prev) => [...prev, `Tracking domain: track.${subdomain} ✓`]);
              setTimeout(() => {
                setDeployStatus("running");
                setIsDeploying(false);
                toast.success("Container deployed successfully!");
              }, 1500);
            }, 1e3);
          }, 1e3);
        }, 1500);
      }
    } catch (error) {
      setDeployStatus("error");
      setIsDeploying(false);
      setConsoleLogs((prev) => [...prev, "Error: Deployment failed. Please check your configuration."]);
      toast.error("Failed to create container");
    }
  };
  const handleAddCustomDomain = async () => {
    var _a2, _b2, _c2, _d2;
    if (!customDomain || !containerId) return;
    try {
      const res = await axios.post(`/api/tracking/containers/${containerId}/setup-domain`, {
        tracking_type: "custom",
        domain: customDomain
      });
      if ((_a2 = res.data) == null ? void 0 : _a2.success) {
        setDnsInstructions((_b2 = res.data.data) == null ? void 0 : _b2.dns_instructions);
        toast.success("Custom domain registered! Configure DNS below.");
      }
    } catch (err) {
      toast.error(((_d2 = (_c2 = err == null ? void 0 : err.response) == null ? void 0 : _c2.data) == null ? void 0 : _d2.message) || "Failed to add domain");
    }
  };
  const loadSnippet = useCallback(async () => {
    var _a2;
    try {
      const res = await axios.get("/api/tracking/snippet");
      if ((_a2 = res.data) == null ? void 0 : _a2.success) {
        setSnippet(res.data.snippet || "");
        setTransportUrl(res.data.transport_url || "");
        setMeasurementId(res.data.measurement_id || "");
      }
    } catch {
      const domain = trackingDomain || "track.your-tenant.pixelmaster.com";
      setTransportUrl(`https://${domain}`);
      setSnippet(`<!-- PixelMaster sGTM -->
<script async src="https://${domain}/gtag/js?id=G-XXXXXXXXX"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX', {
    transport_url: 'https://${domain}',
    first_party_collection: true
  });
<\/script>`);
    }
  }, [trackingDomain]);
  useEffect(() => {
    var _a2;
    if (((_a2 = steps[currentStep]) == null ? void 0 : _a2.id) === "embed") {
      loadSnippet();
    }
  }, [currentStep, loadSnippet]);
  const copyCode = (code, label) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSnippet(null), 2e3);
  };
  const gtagCode = snippet || `<!-- PixelMaster sGTM -->
<script async src="${transportUrl || "https://track.your-tenant.pixelmaster.com"}/gtag/js?id=${measurementId || "G-XXXXXXXXX"}"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId || "G-XXXXXXXXX"}', {
    transport_url: '${transportUrl || "https://track.your-tenant.pixelmaster.com"}',
    first_party_collection: true
  });
<\/script>`;
  const gtmCode = `<!-- PixelMaster GTM -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s), dl=l!='dataLayer'?'\\x26l='+l:'';
  j.async=true;
  j.src='${transportUrl || "https://track.your-tenant.pixelmaster.com"}/gtm.js?id=${measurementId || "GTM-XXXXXXX"}'+dl;
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${measurementId || "GTM-XXXXXXX"}');
<\/script>`;
  const sdkCode = `// PixelMaster JS SDK
import { PixelMaster } from '@pixelmaster/sdk';

const pm = new PixelMaster({
  containerId: '${measurementId || "GTM-XXXXXXX"}',
  transportUrl: '${transportUrl || "https://track.your-tenant.pixelmaster.com"}',
  firstParty: true,
});

pm.track('page_view');
pm.track('purchase', { value: 99.99, currency: 'USD' });`;
  const canProceed = () => {
    var _a2;
    const s = (_a2 = steps[currentStep]) == null ? void 0 : _a2.id;
    if (s === "container") return deployStatus === "running" || deployStatus === "error";
    if (s === "domain") return true;
    if (s === "embed") return true;
    return false;
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateStep(currentStep + 1);
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Setup Wizard — PixelMaster" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-[calc(100vh-64px)] flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b border-border/60 bg-card/50 backdrop-blur-sm", children: /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentStep;
        const active = i === currentStep;
        return /* @__PURE__ */ jsxs(React__default.Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: `h-9 w-9 rounded-xl flex items-center justify-center transition-all ${done ? "bg-emerald-500/15 text-emerald-500" : active ? "bg-primary/15 text-primary shadow-sm shadow-primary/10" : "bg-muted/60 text-muted-foreground"}`, children: done ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("span", { className: `text-sm font-bold hidden sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`, children: s.label })
          ] }),
          i < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: `flex-1 h-px mx-4 ${done ? "bg-emerald-500/30" : "bg-border/60"}` })
        ] }, s.id);
      }) }) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-start justify-center px-6 py-10", children: /* @__PURE__ */ jsxs("div", { className: `w-full max-w-2xl transition-all duration-300 ${isAnimating ? slideDir === "forward" ? "opacity-0 -translate-x-6" : "opacity-0 translate-x-6" : "opacity-100 translate-x-0"}`, children: [
        ((_a = steps[currentStep]) == null ? void 0 : _a.id) === "container" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight", children: "Create your first container" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "A container hosts your sGTM instance. Paste your GTM Config string to connect it." })
          ] }),
          /* @__PURE__ */ jsx(Card, { className: "rounded-2xl border-border/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs font-bold", children: "Container Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: containerName,
                  onChange: (e) => setContainerName(e.target.value),
                  placeholder: "My Website — Server",
                  className: "rounded-xl h-11",
                  disabled: isDeploying || deployStatus === "running"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs(Label, { className: "text-xs font-bold flex items-center gap-2", children: [
                "GTM Container Config",
                /* @__PURE__ */ jsx(Badge, { className: "bg-muted text-muted-foreground border-none text-[9px]", children: "From GTM Admin" })
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: gtmConfig,
                  onChange: (e) => setGtmConfig(e.target.value),
                  placeholder: "Paste your Container Config string from GTM → Admin → Container Settings → Manually provision...",
                  rows: 3,
                  className: "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none",
                  disabled: isDeploying || deployStatus === "running"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: 'You can find this in GTM → Admin → Container Settings → Under "Manually provision tagging server"' })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs(Label, { className: "text-xs font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Cpu, { className: "h-3 w-3" }),
                " Architecture (Deployment Model)"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setDeploymentType("docker"),
                    className: `p-4 rounded-xl border-2 text-left transition-all ${deploymentType === "docker" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"}`,
                    children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "Standard (Docker)" }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Isolated container instances. Best for SMBs." })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setDeploymentType("kubernetes"),
                    className: `p-4 rounded-xl border-2 text-left transition-all ${deploymentType === "kubernetes" ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"}`,
                    children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "High-Scale (K8s)" }),
                        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Auto-scaling clusters. For high traffic." })
                      ] }),
                      /* @__PURE__ */ jsx(Badge, { className: "bg-primary/10 text-primary border-none text-[8px] font-bold", children: "Scale" })
                    ] })
                  }
                )
              ] })
            ] }),
            deployStatus === "idle" && /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: handleCreateContainer,
                disabled: !containerName || isDeploying,
                className: "w-full h-12 rounded-xl font-bold text-base gap-2",
                children: [
                  /* @__PURE__ */ jsx(Rocket, { className: "h-4 w-4" }),
                  " Create & Deploy Container"
                ]
              }
            ),
            deployStatus === "deploying" && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 text-primary animate-spin" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: "Deploying your sGTM container..." }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "This takes about 3–5 minutes. Don't close this page." })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-primary/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary rounded-full animate-pulse", style: { width: "60%" } }) })
            ] }),
            deployStatus === "running" && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-500" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: "Container deployed! ✓" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "Your sGTM instance is running in ",
                    ((_b = AWS_REGIONS.find((r) => r.value === serverLocation)) == null ? void 0 : _b.label) || serverLocation
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Badge, { className: "bg-emerald-500/10 text-emerald-500 border-none font-bold", children: [
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" }),
                " Running"
              ] })
            ] }),
            deployStatus === "error" && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 text-red-500" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-red-500", children: "Deploy failed — you can retry from the dashboard" })
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleCreateContainer, className: "gap-1", children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
                " Retry"
              ] })
            ] })
          ] }) })
        ] }),
        ((_c = steps[currentStep]) == null ? void 0 : _c.id) === "domain" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight", children: "Configure your tracking domain" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Your SaaS tracking domain is ready. Optionally add a custom domain for first-party tracking." })
          ] }),
          /* @__PURE__ */ jsx(Card, { className: "rounded-2xl border-border/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center", children: /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-emerald-500" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "SaaS Tracking Domain" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Automatically provisioned — no DNS needed" })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Badge, { className: "bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-bold", children: "Active" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-muted/50 border border-border/60 font-mono text-sm flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: trackingDomain || "track.your-tenant.pixelmaster.com" }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 px-2 gap-1 text-xs",
                  onClick: () => copyCode(trackingDomain || "track.your-tenant.pixelmaster.com", "domain"),
                  children: copiedSnippet === "domain" ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 dark:text-blue-400", children: "This works immediately but acts as a third-party domain. For first-party cookies and ad-blocker bypass, add a custom domain below." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { className: "rounded-2xl border-border/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowCustomDomain(!showCustomDomain),
                className: "w-full p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors rounded-2xl",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5 text-primary" }) }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold", children: "Add Custom Domain" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Recommended for first-party tracking (e.g., sst.yourdomain.com)" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${showCustomDomain ? "rotate-180" : ""}` })
                ]
              }
            ),
            showCustomDomain && /* @__PURE__ */ jsxs("div", { className: "px-5 pb-5 space-y-4 border-t border-border/60 pt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: customDomain,
                    onChange: (e) => setCustomDomain(e.target.value),
                    placeholder: "sst.yourdomain.com",
                    className: "rounded-xl h-10 font-mono flex-1"
                  }
                ),
                /* @__PURE__ */ jsxs(Button, { onClick: handleAddCustomDomain, disabled: !customDomain, className: "rounded-xl h-10 gap-1 px-5 font-bold", children: [
                  /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }),
                  " Add"
                ] })
              ] }),
              dnsInstructions && /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4 rounded-xl bg-muted/50 border border-border/60", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground", children: "DNS Records to Add" }),
                dnsInstructions.cname && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/60", children: [
                  /* @__PURE__ */ jsx(Badge, { className: "bg-blue-500/10 text-blue-500 border-none text-[10px] font-mono", children: "CNAME" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 font-mono text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: dnsInstructions.cname.host }),
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground mx-2", children: "→" }),
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-bold", children: dnsInstructions.cname.value })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "h-6 w-6 p-0",
                      onClick: () => copyCode(dnsInstructions.cname.value, "cname"),
                      children: copiedSnippet === "cname" ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                dnsInstructions.txt && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/60", children: [
                  /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500/10 text-amber-500 border-none text-[10px] font-mono", children: "TXT" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 font-mono text-xs truncate", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: dnsInstructions.txt.host }),
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground mx-2", children: "→" }),
                    /* @__PURE__ */ jsx("span", { className: "text-foreground", children: dnsInstructions.txt.value })
                  ] }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "h-6 w-6 p-0",
                      onClick: () => copyCode(dnsInstructions.txt.value, "txt"),
                      children: copiedSnippet === "txt" ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-500" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Add these records to your DNS provider. Verification may take up to 72 hours. You'll be notified by email when the domain is ready." })
              ] })
            ] })
          ] }) })
        ] }),
        ((_d = steps[currentStep]) == null ? void 0 : _d.id) === "embed" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black tracking-tight", children: "Add tracking to your website" }),
            /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-sm", children: [
              "Copy the snippet below and paste it into your website's ",
              /* @__PURE__ */ jsx("code", { className: "bg-muted px-1.5 py-0.5 rounded text-foreground text-xs font-mono", children: "<head>" }),
              " section."
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/60", children: ["gtag", "gtm", "sdk"].map((tab) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setEmbedTab(tab),
              className: `flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${embedTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
              children: tab === "gtag" ? "gtag.js" : tab === "gtm" ? "GTM Container" : "JS SDK"
            },
            tab
          )) }),
          /* @__PURE__ */ jsxs(Card, { className: "rounded-2xl border-border/60 overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e] border-b border-white/5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono", children: embedTab === "gtag" ? "HTML — gtag.js" : embedTab === "gtm" ? "HTML — GTM" : "JavaScript — SDK" }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 px-3 gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10",
                  onClick: () => copyCode(embedTab === "gtag" ? gtagCode : embedTab === "gtm" ? gtmCode : sdkCode, embedTab),
                  children: copiedSnippet === embedTab ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }),
                    " Copied!"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                    " Copy"
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "p-4 bg-[#1e1e2e] overflow-x-auto text-[12px] leading-relaxed font-mono text-slate-300 max-h-72", children: /* @__PURE__ */ jsx("code", { children: embedTab === "gtag" ? gtagCode : embedTab === "gtm" ? gtmCode : sdkCode }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: [
            { name: "WordPress", desc: "Plugin or header injection", icon: "🔌" },
            { name: "Shopify", desc: "Theme.liquid or app", icon: "🛒" },
            { name: "Custom", desc: "Any website or app", icon: "⚡" }
          ].map((g) => /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors text-center space-y-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: g.icon }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground", children: g.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: g.desc })
          ] }, g.name)) })
        ] }),
        ((_e = steps[currentStep]) == null ? void 0 : _e.id) === "done" && /* @__PURE__ */ jsxs("div", { className: "space-y-8 text-center py-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(PartyPopper, { className: "h-10 w-10 text-primary" }) }),
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tight", children: "You're all set! 🎉" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm max-w-md mx-auto", children: "Your sGTM container is running and events will start flowing as soon as the tracking code is installed on your website." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4 max-w-lg mx-auto", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border/60 space-y-1", children: [
              /* @__PURE__ */ jsx(Server, { className: "h-5 w-5 text-primary mx-auto" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", children: "1 Container" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-500 font-bold", children: "Running" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border/60 space-y-1", children: [
              /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5 text-primary mx-auto" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", children: isDomainSetup ? "1 Domain" : "Pending" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-500 font-bold", children: "Active" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-card border border-border/60 space-y-1", children: [
              /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary mx-auto" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold", children: "Tracking" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-500 font-bold", children: "Ready" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Button, { onClick: () => router.visit("/dashboard"), className: "h-12 px-10 rounded-xl font-bold text-base gap-2", children: [
              "Go to Dashboard ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => router.visit("/containers"), className: "text-xs text-primary font-bold hover:underline flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Server, { className: "h-3 w-3" }),
                " Containers"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => router.visit("/analytics"), className: "text-xs text-primary font-bold hover:underline flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-3 w-3" }),
                " Analytics"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => router.visit("/power-ups"), className: "text-xs text-primary font-bold hover:underline flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
                " Power-Ups"
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      ((_f = steps[currentStep]) == null ? void 0 : _f.id) !== "done" && /* @__PURE__ */ jsx("div", { className: "border-t border-border/60 p-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            disabled: currentStep === 0,
            onClick: () => animateStep(currentStep - 1),
            className: "h-10 px-5 font-bold gap-2 text-muted-foreground hover:text-foreground",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              " Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          ((_g = steps[currentStep]) == null ? void 0 : _g.id) !== "container" && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handleNext,
              className: "text-muted-foreground text-xs",
              children: "Skip for now"
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleNext,
              disabled: !canProceed(),
              className: "h-10 px-8 rounded-xl font-bold gap-2",
              children: [
                ((_h = steps[currentStep]) == null ? void 0 : _h.id) === "embed" ? "Finish Setup" : "Continue",
                " ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
              ]
            }
          )
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Onboarding as default
};
