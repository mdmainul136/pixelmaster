import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { D as DashboardLayout, B as Badge } from "./DashboardLayout-gDh1-isY.js";
import { ChevronRight, Check, Circle, CreditCard, ShieldCheck, Calendar, Zap, Activity, HardDrive, Users, Globe, Plus, MoreVertical, Star, Trash2, CheckCircle2, Loader2, Receipt, FileText, ExternalLink, Download, History, Package } from "lucide-react";
import { B as Button } from "./button-Dwr8R-lW.js";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { c as cn } from "../ssr.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription, e as CardFooter } from "./card-ByYW05sv.js";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import axios from "axios";
import "clsx";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import "@tanstack/react-query";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "tailwind-merge";
import "@radix-ui/react-tooltip";
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground gap-0.5",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-foreground/80",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const PROJECT_DOMAIN = ".zosair.com";
const API_URL = "";
const tenantApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});
const getCookie = (name) => {
  var _a;
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return (_a = parts.pop()) == null ? void 0 : _a.split(";").shift();
  return null;
};
const clearAuthData = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("tenant_id");
  if (typeof document !== "undefined") {
    document.cookie = `x-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `x-tenant-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    {
      document.cookie = `x-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${PROJECT_DOMAIN}`;
      document.cookie = `x-tenant-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${PROJECT_DOMAIN}`;
    }
  }
};
let _authExpiredFired = false;
const fireAuthExpired = (url) => {
  if (_authExpiredFired) return;
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.includes("/auth") || path.includes("/onboarding")) return;
  if (url.includes("/api/store/settings") || url.includes("/api/themes/config/history") || url.includes("/api/themes") || url.includes("/api/public/")) {
    console.warn(`[Auth] 401 on non-critical route: ${url}. Skipping full logout.`);
    return;
  }
  console.error(`[Auth] Session Expired! Triggered by: ${url}`);
  _authExpiredFired = true;
  clearAuthData();
  window.dispatchEvent(new CustomEvent("auth:expired"));
  setTimeout(() => {
    _authExpiredFired = false;
  }, 5e3);
};
tenantApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("auth_token");
      if (token === "undefined" || token === "null") {
        token = null;
        localStorage.removeItem("auth_token");
      }
      if (!token) {
        token = getCookie("x-auth-token") || null;
        if (token === "undefined" || token === "null") token = null;
        if (token) {
          localStorage.setItem("auth_token", token);
        }
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let tenantId = null;
      if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
        tenantId = parts[0];
      } else {
        tenantId = localStorage.getItem("tenant_id");
      }
      if (tenantId) {
        config.headers["X-Tenant-ID"] = tenantId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
let _quotaState = {
  level: "normal",
  usageGb: null,
  limitGb: null,
  percentage: null
};
tenantApi.interceptors.response.use(
  (response) => {
    const warning = response.headers["x-quota-warning"];
    const usage = parseFloat(response.headers["x-quota-usage"] || "");
    const limit = parseFloat(response.headers["x-quota-limit"] || "");
    if (warning || !isNaN(usage)) {
      _quotaState = {
        level: warning || "normal",
        usageGb: isNaN(usage) ? null : usage,
        limitGb: isNaN(limit) ? null : limit,
        percentage: !isNaN(usage) && !isNaN(limit) && limit > 0 ? Math.round(usage / limit * 100) : null
      };
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("quota-warning", { detail: _quotaState })
        );
      }
    }
    return response;
  },
  (error) => {
    var _a, _b, _c;
    if (((_a = error.response) == null ? void 0 : _a.status) === 401 && typeof window !== "undefined") {
      const failedUrl = ((_b = error.config) == null ? void 0 : _b.url) || "unknown";
      fireAuthExpired(failedUrl);
    }
    if (((_c = error.response) == null ? void 0 : _c.status) === 402) {
      const data = error.response.data;
      if (data == null ? void 0 : data.payment_required) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("payment-required", { detail: data })
          );
        }
      } else {
        _quotaState = { level: "blocked", usageGb: null, limitGb: null, percentage: 100 };
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("quota-warning", { detail: _quotaState })
          );
        }
      }
    }
    return Promise.reject(error);
  }
);
const billingApi = {
  getPlans: async () => {
    const response = await tenantApi.get("/api/v1/subscriptions/plans");
    return response.data;
  },
  getStatus: async () => {
    const response = await tenantApi.get("/api/v1/subscriptions/status");
    return response.data;
  },
  cancelSubscription: async () => {
    const response = await tenantApi.post("/api/v1/subscriptions/cancel");
    return response.data;
  },
  reactivateSubscription: async () => {
    const response = await tenantApi.post("/api/v1/subscriptions/reactivate");
    return response.data;
  },
  getPaymentHistory: async () => {
    const response = await tenantApi.get("/api/v1/payment/history");
    return response.data;
  },
  getInvoices: async () => {
    const response = await tenantApi.get("/api/v1/invoices");
    return response.data;
  },
  getInvoiceDownloadUrl: (id) => {
    return `${"http://127.0.0.1:8000"}/api/v1/invoices/${id}/download`;
  },
  payInvoice: async (id) => {
    const response = await tenantApi.post(`/api/v1/invoices/${id}/pay`);
    return response.data;
  },
  createCheckoutSession: async (data) => {
    const response = await tenantApi.post("/api/v1/payment/checkout", data);
    return response.data;
  },
  verifyPayment: async (sessionId) => {
    const response = await tenantApi.post("/api/v1/payment/verify", { session_id: sessionId });
    return response.data;
  },
  // Payment Methods
  getPaymentMethods: async () => {
    const response = await tenantApi.get("/api/v1/payment-methods");
    return response.data;
  },
  createSetupIntent: async () => {
    const response = await tenantApi.post("/api/v1/payment-methods/setup-intent");
    return response.data;
  },
  addPaymentMethod: async (paymentMethodId) => {
    const response = await tenantApi.post("/api/v1/payment-methods", {
      stripe_payment_method_id: paymentMethodId
    });
    return response.data;
  },
  deletePaymentMethod: async (id) => {
    const response = await tenantApi.delete(`/api/v1/payment-methods/${id}`);
    return response.data;
  },
  setDefaultPaymentMethod: async (id) => {
    const response = await tenantApi.post(`/api/v1/payment-methods/${id}/default`);
    return response.data;
  },
  getTimeline: async () => {
    const response = await tenantApi.get("/api/v1/subscriptions/timeline");
    return response.data;
  }
};
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const DomainManagement = ({ initialDomains, plan }) => /* @__PURE__ */ jsx("div", { className: "space-y-3", children: (initialDomains == null ? void 0 : initialDomains.length) > 0 ? initialDomains.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/60 p-4", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4 text-primary" }),
    /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-foreground", children: d.domain || d })
  ] }),
  /* @__PURE__ */ jsx(Badge, { className: "bg-emerald-500/10 text-emerald-500 text-[10px]", children: "Active" })
] }, i)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "No custom domains connected." }) });
const AddCardModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-card border border-border p-8 max-w-md w-full shadow-xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-foreground mb-4", children: "Add Payment Method" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Payment method management will be connected to your billing provider." }),
    /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, className: "w-full rounded-xl", children: "Close" })
  ] }) });
};
function BillingSettings({
  tenant,
  billing,
  domains,
  subscription,
  plans,
  paymentMethods,
  invoices,
  timeline
}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isUpgrading, setIsUpgrading] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const refresh = () => {
    router.reload({ only: ["subscription", "plans", "paymentMethods", "invoices", "timeline"] });
  };
  const cancelSubscription = async () => {
    var _a2, _b2;
    try {
      const res = await billingApi.cancelSubscription();
      if (res.success) {
        toast.success("Subscription canceled successfully");
        refresh();
      }
    } catch (err) {
      toast.error(((_b2 = (_a2 = err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to cancel subscription");
    }
  };
  const reactivateSubscription = async () => {
    var _a2, _b2;
    try {
      const res = await billingApi.reactivateSubscription();
      if (res.success) {
        toast.success("Subscription reactivated!");
        refresh();
      }
    } catch (err) {
      toast.error(((_b2 = (_a2 = err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to reactivate subscription");
    }
  };
  const deletePaymentMethod = async (id) => {
    var _a2, _b2;
    if (!confirm("Remove this payment method?")) return;
    try {
      const res = await billingApi.deletePaymentMethod(id);
      if (res.success) {
        toast.success("Payment method removed");
        refresh();
      }
    } catch (err) {
      toast.error(((_b2 = (_a2 = err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to remove payment method");
    }
  };
  const setDefaultPaymentMethod = async (id) => {
    var _a2, _b2;
    try {
      const res = await billingApi.setDefaultPaymentMethod(id);
      if (res.success) {
        toast.success("Default payment method updated");
        refresh();
      }
    } catch (err) {
      toast.error(((_b2 = (_a2 = err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update default payment method");
    }
  };
  const usage = (subscription == null ? void 0 : subscription.usage) || { db_usage_percent: 0, db_usage_gb: 0, db_limit_gb: 0 };
  const activePlan = subscription == null ? void 0 : subscription.plan;
  const isStarterPlan = (activePlan == null ? void 0 : activePlan.plan_key) === "starter";
  const handleUpgrade = async (planSlug) => {
    var _a2, _b2, _c2;
    try {
      setIsUpgrading(planSlug);
      const result = await billingApi.createCheckoutSession({
        plan_slug: planSlug,
        subscription_type: billingCycle
      });
      if (result.success && ((_a2 = result.data) == null ? void 0 : _a2.url)) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.message || "Failed to initiate upgrade");
      }
    } catch (error) {
      toast.error(((_c2 = (_b2 = error.response) == null ? void 0 : _b2.data) == null ? void 0 : _c2.message) || "Failed to initiate upgrade");
    } finally {
      setIsUpgrading(null);
    }
  };
  const handlePayInvoice = async (id) => {
    var _a2, _b2, _c2;
    try {
      setPayingInvoiceId(id);
      const result = await billingApi.payInvoice(id);
      if (result.success && ((_a2 = result.data) == null ? void 0 : _a2.url)) {
        window.location.href = result.data.url;
      } else {
        toast.error(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error(((_c2 = (_b2 = error.response) == null ? void 0 : _b2.data) == null ? void 0 : _c2.message) || "Failed to initiate payment");
    } finally {
      setPayingInvoiceId(null);
    }
  };
  const scrollToPlans = () => {
    const element = document.getElementById("pricing-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Subscription & Billing" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black tracking-tight flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-6 w-6 text-indigo-500" }) }),
            "Billing & Domains"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground font-medium", children: "Manage your plan, connect custom domains, and view transaction history." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 py-1.5 px-3 rounded-lg font-bold", children: [
          /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" }),
          "System Active"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "bg-muted/50 p-1 rounded-xl mb-6", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "overview", className: "rounded-lg font-bold px-6", children: "Overview" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "plans", className: "rounded-lg font-bold px-6", children: "Plans" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "domains", className: "rounded-lg font-bold px-6", children: "Domains" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "history", className: "rounded-lg font-bold px-6", children: "Timeline" })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "overview", className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs(Card, { className: `lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br transition-all duration-500 rounded-3xl relative group ${isStarterPlan ? "from-amber-500/10 via-amber-600/5 to-transparent" : "from-primary/10 via-primary/5 to-transparent"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-48 w-48 text-primary" }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "p-8", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-8 items-start justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black tracking-tight text-foreground uppercase", children: (activePlan == null ? void 0 : activePlan.name) || "Starter Plan" }),
                      isStarterPlan && /* @__PURE__ */ jsx(Badge, { className: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", children: "Standard" }),
                      (subscription == null ? void 0 : subscription.status) === "active" && /* @__PURE__ */ jsx(Badge, { className: "bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[10px] font-bold uppercase", children: "Active" })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground font-medium", children: [
                      (subscription == null ? void 0 : subscription.billing_cycle) === "yearly" ? "Yearly" : "Monthly",
                      " Subscription"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-5xl font-black text-foreground", children: [
                      "$",
                      activePlan ? (subscription == null ? void 0 : subscription.billing_cycle) === "yearly" ? activePlan.price_yearly : activePlan.price_monthly : "0"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-bold", children: [
                      "/",
                      (subscription == null ? void 0 : subscription.billing_cycle) === "yearly" ? "year" : "month"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 pt-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 transition-colors hover:bg-background/80", children: [
                      /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-primary" }),
                      /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold", children: [
                        "Renews: ",
                        (subscription == null ? void 0 : subscription.renews_at) ? new Date(subscription.renews_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 transition-colors hover:bg-background/80", children: [
                      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold uppercase tracking-tight", children: (subscription == null ? void 0 : subscription.status) || "Active" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 w-full md:w-auto", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      className: "h-12 px-8 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5",
                      onClick: scrollToPlans,
                      children: isStarterPlan ? "Upgrade Plan" : "Manage Plan"
                    }
                  ),
                  (subscription == null ? void 0 : subscription.status) === "active" ? /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      className: "h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-semibold",
                      onClick: cancelSubscription,
                      children: "Cancel Subscription"
                    }
                  ) : (subscription == null ? void 0 : subscription.status) === "canceled" ? /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      className: "h-10 text-emerald-600 hover:bg-emerald-50 font-semibold",
                      onClick: reactivateSubscription,
                      children: "Reactivate Plan"
                    }
                  ) : null
                ] })
              ] }),
              isStarterPlan && /* @__PURE__ */ jsxs("div", { className: "mt-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-center md:text-left", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-3 bg-amber-500/10 rounded-xl text-amber-600", children: /* @__PURE__ */ jsx(Zap, { className: "h-6 w-6 fill-amber-500/20" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: "font-bold text-amber-900", children: "Unlock Premium Features" }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-800/80 max-w-md", children: "Upgrade to Growth or Pro to unlock custom domains, advanced analytics, and priority supports." })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "bg-transparent border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white font-bold h-10 px-6 rounded-lg transition-all",
                    onClick: scrollToPlans,
                    children: "View Plans"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "rounded-3xl border-slate-200 shadow-sm overflow-hidden flex flex-col", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "pb-4 bg-slate-50/50 border-b border-slate-100", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5", children: "Resource Status" }),
                /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Live monitoring of your scale" })
            ] }),
            /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight", children: [
                    /* @__PURE__ */ jsx(HardDrive, { className: "h-3.5 w-3.5" }),
                    " Storage"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: (usage == null ? void 0 : usage.is_over_quota) ? "text-destructive" : "text-foreground", children: [
                    Number((usage == null ? void 0 : usage.db_usage_gb) || 0).toFixed(2),
                    " / ",
                    (usage == null ? void 0 : usage.db_limit_gb) || 0,
                    " GB"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Progress,
                  {
                    value: (usage == null ? void 0 : usage.db_usage_percent) || 0,
                    className: `h-2 ${(usage == null ? void 0 : usage.is_over_quota) ? "bg-destructive/20 [&>div]:bg-destructive" : "bg-primary/10"}`
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight", children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }),
                    " Team Seats"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    ((_a = usage == null ? void 0 : usage.users) == null ? void 0 : _a.used) || 0,
                    " / ",
                    ((_b = usage == null ? void 0 : usage.users) == null ? void 0 : _b.limit) || 0
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Progress,
                  {
                    value: (((_c = usage == null ? void 0 : usage.users) == null ? void 0 : _c.used) || 0) / (((_d = usage == null ? void 0 : usage.users) == null ? void 0 : _d.limit) || 1) * 100,
                    className: "h-2 bg-primary/10"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight", children: [
                    /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5" }),
                    " AI Daily"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    ((_e = usage == null ? void 0 : usage.ai_daily) == null ? void 0 : _e.used) || 0,
                    " / ",
                    ((_f = usage == null ? void 0 : usage.ai_daily) == null ? void 0 : _f.limit) || 0
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Progress,
                  {
                    value: (((_g = usage == null ? void 0 : usage.ai_daily) == null ? void 0 : _g.used) || 0) / (((_h = usage == null ? void 0 : usage.ai_daily) == null ? void 0 : _h.limit) || 1) * 100,
                    className: "h-2 bg-primary/10"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight", children: [
                    /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }),
                    " Scraping"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    ((_i = usage == null ? void 0 : usage.scraping_daily) == null ? void 0 : _i.used) || 0,
                    " / ",
                    ((_j = usage == null ? void 0 : usage.scraping_daily) == null ? void 0 : _j.limit) || 0
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Progress,
                  {
                    value: (((_k = usage == null ? void 0 : usage.scraping_daily) == null ? void 0 : _k.used) || 0) / (((_l = usage == null ? void 0 : usage.scraping_daily) == null ? void 0 : _l.limit) || 1) * 100,
                    className: "h-2 bg-primary/10"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-3 rounded-3xl border-slate-200 shadow-sm overflow-hidden", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4", children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5", children: "Primary Payment Methods" }),
              /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "h-8 rounded-lg text-primary font-bold gap-1", onClick: () => setIsAddCardOpen(true), children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                " Add Method"
              ] })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: paymentMethods.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-100", children: paymentMethods.map((pm) => /* @__PURE__ */ jsxs("div", { className: "p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-14 rounded-lg bg-slate-900 flex items-center justify-center text-white relative overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black italic uppercase", children: pm.brand }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-900", children: [
                    "•••• ",
                    pm.last4
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: [
                    "Expires ",
                    pm.expiry_display
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                pm.is_default && /* @__PURE__ */ jsx(Badge, { className: "bg-primary/10 text-primary border-none text-[10px] font-bold", children: "Default" }),
                /* @__PURE__ */ jsxs(DropdownMenu, { children: [
                  /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4 text-slate-400" }) }) }),
                  /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "rounded-xl border-slate-200 shadow-xl", children: [
                    !pm.is_default && /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "font-bold text-xs gap-2", onClick: () => setDefaultPaymentMethod(pm.id), children: [
                      /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 fill-primary text-primary" }),
                      " Set Default"
                    ] }),
                    /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "font-bold text-xs gap-2 text-rose-500 focus:text-rose-500", onClick: () => deletePaymentMethod(pm.id), children: [
                      /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                      " Remove Card"
                    ] })
                  ] })
                ] })
              ] })
            ] }, pm.id)) }) : /* @__PURE__ */ jsxs("div", { className: "p-8 text-center bg-slate-50/30 flex flex-col items-center justify-center space-y-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-6 w-6 text-slate-400" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-bold max-w-[200px]", children: "No payment methods linked. Invoices will require manual payment." })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(TabsContent, { value: "plans", id: "pricing-section", className: "space-y-8 animate-in fade-in duration-500", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black tracking-tight uppercase", children: "Choose the best plan for your scale" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-medium", children: "Switch between billing cycles to save on annual subscriptions." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setBillingCycle("monthly"),
                  className: `px-6 py-2 rounded-xl text-sm font-black transition-all ${billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
                  children: "Monthly"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setBillingCycle("yearly"),
                  className: `px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
                  children: [
                    "Yearly ",
                    /* @__PURE__ */ jsx(Badge, { className: "bg-emerald-500 text-white border-none text-[9px] font-black h-4", children: "-20%" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: plans.map((p) => {
            const isActive = (activePlan == null ? void 0 : activePlan.plan_key) === p.plan_key;
            const price = billingCycle === "yearly" ? p.price_yearly : p.price_monthly;
            const period = billingCycle === "yearly" ? "/yr" : "/mo";
            return /* @__PURE__ */ jsxs(Card, { className: `relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${isActive ? "border-primary shadow-xl shadow-primary/5" : "border-slate-100 shadow-sm"}`, children: [
              isActive && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-xl", children: "Current Plan" }),
              /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 pb-4", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-black uppercase", children: p.name }),
                /* @__PURE__ */ jsx(CardDescription, { className: "font-medium line-clamp-1", children: p.description })
              ] }),
              /* @__PURE__ */ jsxs(CardContent, { className: "flex-1 space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-4xl font-black text-slate-900", children: [
                    "$",
                    price
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-slate-400", children: period })
                ] }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: p.features && p.features.map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm font-medium text-slate-600", children: [
                  /* @__PURE__ */ jsx("div", { className: "mt-1 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5 text-emerald-600" }) }),
                  feature
                ] }, feature)) })
              ] }),
              /* @__PURE__ */ jsx(CardFooter, { className: "pt-0", children: /* @__PURE__ */ jsxs(
                Button,
                {
                  className: "w-full h-11 rounded-xl font-black gap-2",
                  variant: isActive ? "outline" : "default",
                  disabled: isActive || isUpgrading === p.plan_key,
                  onClick: () => handleUpgrade(p.plan_key),
                  children: [
                    isUpgrading === p.plan_key && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                    isActive ? "Managed" : "Subscribe"
                  ]
                }
              ) })
            ] }, p.id);
          }) })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "domains", className: "animate-in slide-in-from-bottom-2 duration-300", children: /* @__PURE__ */ jsxs(Card, { className: "rounded-3xl border-slate-200 shadow-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-black text-slate-900", children: "Connected Domains" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Configure custom DNS for your storefront access." })
            ] }),
            /* @__PURE__ */ jsx(Globe, { className: "h-6 w-6 text-indigo-500/50" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx(DomainManagement, { initialDomains: domains, plan: billing == null ? void 0 : billing.plan }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "history", className: "animate-in slide-in-from-bottom-2 duration-300 space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2 rounded-3xl border-slate-200 shadow-sm overflow-hidden", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-slate-50/50 border-b border-slate-100", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-black text-slate-900", children: "Recent Invoices" }),
                /* @__PURE__ */ jsx(Receipt, { className: "h-6 w-6 text-slate-300" })
              ] }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Download and manage your subscription payments." })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: invoices.length > 0 ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: invoices.map((invoice) => /* @__PURE__ */ jsxs("div", { className: "p-5 flex items-center justify-between hover:bg-slate-50 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-slate-400" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900", children: invoice.invoice_number }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5", children: [
                    /* @__PURE__ */ jsx("span", { children: new Date(invoice.invoice_date).toLocaleDateString() }),
                    /* @__PURE__ */ jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsx("span", { children: invoice.subscription_type })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-900", children: [
                    "$",
                    invoice.total.toFixed(2)
                  ] }),
                  /* @__PURE__ */ jsx(Badge, { className: `rounded-lg border-none text-[9px] font-black h-5 uppercase px-2 shadow-sm ${invoice.status === "paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`, children: invoice.status })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  invoice.status === "pending" && /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      className: "h-8 text-[10px] font-bold uppercase tracking-tight gap-1 px-3",
                      disabled: payingInvoiceId === invoice.id,
                      onClick: () => handlePayInvoice(invoice.id),
                      children: [
                        payingInvoiceId === invoice.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" }),
                        "Pay Now"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors",
                      onClick: () => window.open(billingApi.getInvoiceDownloadUrl(invoice.id), "_blank"),
                      children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] })
            ] }, invoice.id)) }) : /* @__PURE__ */ jsxs("div", { className: "p-20 text-center flex flex-col items-center justify-center space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100", children: /* @__PURE__ */ jsx(History, { className: "h-8 w-8 text-slate-300" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-900", children: "No Payment History" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: "rounded-3xl border-slate-200 shadow-sm overflow-hidden", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "bg-slate-50/50 border-b border-slate-100", children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5", children: "Billing Timeline" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Activity log of your subscription" })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100", children: timeline.length > 0 ? timeline.map((event) => /* @__PURE__ */ jsxs("div", { className: "relative pl-10 group", children: [
              /* @__PURE__ */ jsxs("div", { className: "absolute left-0 top-1.5 h-8 w-8 rounded-xl border-4 border-white bg-slate-200 group-hover:bg-primary/20 flex items-center justify-center transition-colors", children: [
                event.type === "payment" && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-500" }),
                event.type === "invoice" && /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-slate-400" }),
                event.type === "subscription" && /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-indigo-500" }),
                event.type === "module" && /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 text-amber-500" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-slate-900 uppercase tracking-tight", children: event.title }),
                  /* @__PURE__ */ jsx("time", { className: "text-[10px] font-bold text-slate-400", children: new Date(event.date).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 font-medium leading-relaxed", children: event.description })
              ] })
            ] }, event.id)) : /* @__PURE__ */ jsx("div", { className: "py-10 text-center italic text-slate-300 text-xs font-medium", children: "No events recorded yet." }) }) })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      AddCardModal,
      {
        isOpen: isAddCardOpen,
        onClose: () => setIsAddCardOpen(false),
        onSuccess: () => {
          refresh();
        }
      }
    )
  ] });
}
export {
  BillingSettings as default
};
