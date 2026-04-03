import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
import { route } from "ziggy-js";
import { Toaster as Toaster$3 } from "react-hot-toast";
import * as React from "react";
import React__default, { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Toaster as Toaster$2 } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster$1() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const Toaster = ({ ...props }) => {
  const theme = "light";
  return /* @__PURE__ */ jsx(
    Toaster$2,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const translations = {
  // Section Headers
  "nav.main": { en: "Main", ar: "الرئيسية" },
  "nav.storefront": { en: "Storefront", ar: "واجهة المتجر" },
  "nav.sales": { en: "Sales & Commerce", ar: "المبيعات والتجارة" },
  "nav.marketplace": { en: "Marketplace & Growth", ar: "السوق والنمو" },
  "nav.platform": { en: "Platform & Compliance", ar: "المنصة والامتثال" },
  "nav.inventory": { en: "Inventory & Stock", ar: "المخزون" },
  "nav.finance": { en: "Finance & Accounting", ar: "المالية والمحاسبة" },
  "nav.reports": { en: "Reports & Analytics", ar: "التقارير والتحليلات" },
  "nav.hr": { en: "HR & Loyalty", ar: "الموارد البشرية والولاء" },
  "nav.operations": { en: "Operations", ar: "العمليات" },
  "nav.others": { en: "Others", ar: "أخرى" },
  // Nav Items
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.themeBuilder": { en: "Theme Builder", ar: "منشئ القوالب" },
  "nav.orders": { en: "Orders", ar: "الطلبات" },
  "nav.pos": { en: "POS Terminal", ar: "نقطة البيع" },
  "nav.crm": { en: "Customers / CRM", ar: "العملاء" },
  "nav.returns": { en: "Returns & Refunds", ar: "المرتجعات" },
  "nav.salesChannels": { en: "Sales Channels", ar: "قنوات البيع" },
  "nav.payments": { en: "Payments", ar: "المدفوعات" },
  "nav.subscriptions": { en: "Subscriptions", ar: "الاشتراكات" },
  "nav.delivery": { en: "Delivery", ar: "التوصيل" },
  "nav.marketplaceItem": { en: "Marketplace", ar: "السوق" },
  "nav.marketing": { en: "Marketing", ar: "التسويق" },
  "nav.flashSales": { en: "Flash Sales", ar: "عروض سريعة" },
  "nav.whatsapp": { en: "WhatsApp", ar: "واتساب" },
  "nav.seo": { en: "SEO Manager", ar: "إدارة SEO" },
  "nav.pagesBlog": { en: "Pages & Blog", ar: "الصفحات والمدونة" },
  "nav.zatca": { en: "ZATCA Compliance", ar: "امتثال زاتكا" },
  "nav.staffAccess": { en: "Staff Access", ar: "صلاحيات الموظفين" },
  "nav.appMarketplace": { en: "App Marketplace", ar: "متجر التطبيقات" },
  "nav.saudiServices": { en: "Saudi Services", ar: "الخدمات السعودية" },
  "nav.developer": { en: "Developer Portal", ar: "بوابة المطورين" },
  "nav.inventoryItem": { en: "Inventory", ar: "المخزون" },
  "nav.stockOverview": { en: "Stock Overview", ar: "نظرة عامة على المخزون" },
  "nav.products": { en: "Products", ar: "المنتجات" },
  "nav.suppliers": { en: "Suppliers", ar: "الموردون" },
  "nav.purchaseOrders": { en: "Purchase Orders", ar: "أوامر الشراء" },
  "nav.warehouse": { en: "Warehouse", ar: "المستودعات" },
  "nav.financeOverview": { en: "Overview", ar: "نظرة عامة" },
  "nav.taxCurrency": { en: "Multi-currency & Tax", ar: "العملات والضرائب" },
  "nav.salesReport": { en: "Sales Report", ar: "تقرير المبيعات" },
  "nav.inventoryReport": { en: "Inventory Report", ar: "تقرير المخزون" },
  "nav.customerInsights": { en: "Customer Insights", ar: "رؤى العملاء" },
  "nav.staffManagement": { en: "Staff Management", ar: "إدارة الموظفين" },
  "nav.loyalty": { en: "Loyalty & Coupons", ar: "الولاء والكوبونات" },
  "nav.branches": { en: "Branches", ar: "الفروع" },
  "nav.expenses": { en: "Expense Tracker", ar: "تتبع المصاريف" },
  "nav.auditLog": { en: "Audit Log", ar: "سجل المراجعة" },
  "nav.reviews": { en: "Reviews & Ratings", ar: "التقييمات" },
  "nav.calendar": { en: "Calendar", ar: "التقويم" },
  "nav.profile": { en: "User Profile", ar: "الملف الشخصي" },
  "nav.tables": { en: "Tables", ar: "الجداول" },
  "nav.pages": { en: "Pages", ar: "الصفحات" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },
  "nav.generalSettings": { en: "General Settings", ar: "الإعدادات العامة" },
  "nav.domainsBilling": { en: "Domains & Billing", ar: "النطاقات والفواتير" },
  "nav.emailNotifications": { en: "Email & Notifications", ar: "البريد والتنبيهات" },
  "nav.smsGateway": { en: "SMS Gateway", ar: "بوابة SMS" },
  "nav.whatsappAutomation": { en: "WhatsApp Automation", ar: "أتمتة واتساب" },
  "nav.aiConfig": { en: "AI Configuration", ar: "تكوين الذكاء الاصطناعي" },
  "nav.domains": { en: "Domains & System", ar: "النطاقات والنظام" },
  "nav.auth": { en: "Authentication", ar: "المصادقة" },
  "nav.signIn": { en: "Sign In", ar: "تسجيل الدخول" },
  "nav.signUp": { en: "Sign Up", ar: "إنشاء حساب" },
  "nav.roadmap": { en: "SaaS Roadmap", ar: "خارطة الطريق" },
  "nav.multiTenant": { en: "Multi-Tenant Core", ar: "النظام متعدد المستأجرين" },
  "nav.platformDashboard": { en: "Platform Dashboard", ar: "لوحة تحكم المنصة" },
  // Cross-Border IOR
  "nav.sourcing": { en: "Sourcing & Scraping", ar: "التوريد والكشط" },
  "nav.scraper": { en: "Product Scraper", ar: "كاشط المنتجات" },
  "nav.calculator": { en: "Price Calculator", ar: "حاسبة الأسعار" },
  "nav.catalog": { en: "Global Catalog", ar: "الكتالوج العالمي" },
  "nav.fulfillment": { en: "Orders & Fulfillment", ar: "الطلبات والتنفيذ" },
  "nav.foreignOrders": { en: "Foreign Orders", ar: "طلبات خارجية" },
  "nav.shipments": { en: "Shipment Batches", ar: "دفعات الشحن" },
  "nav.couriers": { en: "Couriers & Tracking", ar: "البريد السريع والتتبع" },
  "nav.financeAdmin": { en: "Finance & Admin", ar: "المالية والإدارة" },
  "nav.iorBilling": { en: "Billing & Payments", ar: "الفواتير والمدفوعات" },
  "nav.customs": { en: "Customs & Duty", ar: "الجمارك والرسوم" },
  "nav.iorStorefront": { en: "Storefront", ar: "واجهة المتجر" },
  "nav.iorSettings": { en: "IOR Settings", ar: "إعدادات IOR" },
  // Header
  "header.search": { en: "Type to search...", ar: "اكتب للبحث..." },
  "header.myProfile": { en: "My Profile", ar: "ملفي الشخصي" },
  "header.settings": { en: "Settings", ar: "الإعدادات" },
  "header.logOut": { en: "Log Out", ar: "تسجيل الخروج" }
};
const LanguageContext = createContext(void 0);
const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-lang") || "en";
    }
    return "en";
  });
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("app-lang", lang);
  }, [lang, dir]);
  const setLang = useCallback((newLang) => {
    setLangState(newLang);
  }, []);
  const t = useCallback(
    (key) => {
      var _a;
      return ((_a = translations[key]) == null ? void 0 : _a[lang]) || key;
    },
    [lang]
  );
  return /* @__PURE__ */ jsx(LanguageContext.Provider, { value: { lang, dir, setLang, t, isRTL }, children });
};
function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
const queryClient = new QueryClient();
class ErrorBoundary extends React__default.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[TenantGlobalLayout] React Error:", error);
    console.error("[TenantGlobalLayout] Component Stack:", errorInfo.componentStack);
  }
  render() {
    var _a;
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs("div", { style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        padding: "32px",
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "48px" }, children: "⚠️" }),
        /* @__PURE__ */ jsx("h1", { style: { fontSize: "24px", fontWeight: "bold" }, children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { style: { color: "#94a3b8", maxWidth: "400px", textAlign: "center", fontSize: "14px" }, children: "The application encountered an unexpected error. Please refresh the page or contact support." }),
        /* @__PURE__ */ jsx("pre", { style: {
          background: "#1e293b",
          padding: "16px",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#f87171",
          maxWidth: "600px",
          overflow: "auto",
          whiteSpace: "pre-wrap"
        }, children: (_a = this.state.error) == null ? void 0 : _a.message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            style: {
              background: "#3b82f6",
              color: "white",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            },
            children: "Reload Page"
          }
        )
      ] });
    }
    return this.props.children;
  }
}
function TenantGlobalLayout({ children }) {
  return /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(Toaster$1, {}),
    /* @__PURE__ */ jsx(Toaster, {}),
    children
  ] }) }) }) });
}
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Central/Auth.tsx": () => import("./assets/Auth-DA51ANiu.js"), "./Pages/Central/LegalPage.jsx": () => import("./assets/LegalPage-15h-e2DX.js"), "./Pages/Central/Onboarding.tsx": () => import("./assets/Onboarding-CnFVEKmt.js"), "./Pages/Central/VerifyEmail.jsx": () => import("./assets/VerifyEmail-zM8yow-f.js"), "./Pages/Platform/Analytics/Index.jsx": () => import("./assets/Index-D2xUBHPh.js"), "./Pages/Platform/Auth/Login.jsx": () => import("./assets/Login-BIjf0QV5.js"), "./Pages/Platform/Auth/TwoFactorChallenge.jsx": () => import("./assets/TwoFactorChallenge-DrQMVx05.js"), "./Pages/Platform/Billing/Plans.jsx": () => import("./assets/Plans-CGEaFZK6.js"), "./Pages/Platform/Dashboard.jsx": () => import("./assets/Dashboard-CuFjHhSP.js"), "./Pages/Platform/Events/Index.jsx": () => import("./assets/Index-Cy3T3JQW.js"), "./Pages/Platform/Infrastructure/Index.jsx": () => import("./assets/Index-DNR9KagT.js"), "./Pages/Platform/Legal/Index.jsx": () => import("./assets/Index-CG4Qgpu1.js"), "./Pages/Platform/Security/Audit.jsx": () => import("./assets/Audit-BVX5_M2j.js"), "./Pages/Platform/Security/Firewall.jsx": () => import("./assets/Firewall-CDyI1Q7i.js"), "./Pages/Platform/Security/Stats.jsx": () => import("./assets/Stats-DWLd7a4H.js"), "./Pages/Platform/Settings/BillingSettingsPage.jsx": () => import("./assets/BillingSettingsPage-BlsJ_EzW.js"), "./Pages/Platform/Settings/ClickHouseSettingsPage.jsx": () => import("./assets/ClickHouseSettingsPage-DH4yt7Gs.js"), "./Pages/Platform/Settings/InfrastructureSettingsPage.jsx": () => import("./assets/InfrastructureSettingsPage-B0j43da7.js"), "./Pages/Platform/Settings/MetabaseSettingsPage.jsx": () => import("./assets/MetabaseSettingsPage-CKzJUWBZ.js"), "./Pages/Platform/Settings/PipelineSettingsPage.jsx": () => import("./assets/PipelineSettingsPage-XT-miQJL.js"), "./Pages/Platform/SettingsPage.jsx": () => import("./assets/SettingsPage-M-GfhHBX.js"), "./Pages/Platform/Sgtm/AiAdvisor.jsx": () => import("./assets/AiAdvisor-D3TFAFme.js"), "./Pages/Platform/Sgtm/AiInsightsDashboard.jsx": () => import("./assets/AiInsightsDashboard-BtEwZEmW.js"), "./Pages/Platform/Sgtm/Analytics.jsx": () => import("./assets/Analytics-DGII8FCU.js"), "./Pages/Platform/Sgtm/Attribution.jsx": () => import("./assets/Attribution-D18Esu-C.js"), "./Pages/Platform/Sgtm/AttributionModeler.jsx": () => import("./assets/AttributionModeler-BTf4aryG.js"), "./Pages/Platform/Sgtm/BillingHub.jsx": () => import("./assets/BillingHub-CHz2Yupt.js"), "./Pages/Platform/Sgtm/Cdp/SingleCustomerView.jsx": () => import("./assets/SingleCustomerView-BaGHMF_K.js"), "./Pages/Platform/Sgtm/Diagnostics.jsx": () => import("./assets/Diagnostics-C-TD48BO.js"), "./Pages/Platform/Sgtm/Docs.jsx": () => import("./assets/Docs-CbfQPJtf.js"), "./Pages/Platform/Sgtm/EventDebugger.jsx": () => import("./assets/EventDebugger-BKht-1-u.js"), "./Pages/Platform/Sgtm/HealthDeck.jsx": () => import("./assets/HealthDeck-L1Ar0LWx.js"), "./Pages/Platform/Sgtm/Index.jsx": () => import("./assets/Index-ODm9BvQV.js"), "./Pages/Platform/Sgtm/Infrastructure.jsx": () => import("./assets/Infrastructure-C2Pam4jN.js"), "./Pages/Platform/Sgtm/InfrastructureDocsPage.jsx": () => import("./assets/InfrastructureDocsPage-CYW5Mpdh.js"), "./Pages/Platform/Sgtm/MetabaseDocsPage.jsx": () => import("./assets/MetabaseDocsPage-BOjQClEt.js"), "./Pages/Platform/Sgtm/MultiDbDocsPage.jsx": () => import("./assets/MultiDbDocsPage-DwMD9BZQ.js"), "./Pages/Platform/Sgtm/ProvisioningDocsPage.jsx": () => import("./assets/ProvisioningDocsPage-DGtHFE-N.js"), "./Pages/Platform/Sgtm/ShopifyIntegration.jsx": () => import("./assets/ShopifyIntegration-Duxl3YTe.js"), "./Pages/Platform/Subscriptions/Index.jsx": () => import("./assets/Index-xrSzVPNq.js"), "./Pages/Platform/Tenants/Domains.jsx": () => import("./assets/Domains-CKKRSUgF.js"), "./Pages/Platform/Tenants/Edit.jsx": () => import("./assets/Edit-B7aHKFxb.js"), "./Pages/Platform/Tenants/Index.jsx": () => import("./assets/Index-eY74UJ4k.js"), "./Pages/Platform/Tenants/Quotas.jsx": () => import("./assets/Quotas-D8TuLKD_.js"), "./Pages/Platform/Tenants/Show.jsx": () => import("./assets/Show-kPb8e9UD.js"), "./Pages/Tenant/Core/Auth.tsx": () => import("./assets/Auth-BdpoDiRY.js"), "./Pages/Tenant/Core/BillingSettings.tsx": () => import("./assets/BillingSettings-CKKLl0RF.js"), "./Pages/Tenant/Core/BillingSettingsPage.tsx": () => import("./assets/BillingSettingsPage-P1BVZScN.js"), "./Pages/Tenant/Core/Index.tsx": () => import("./assets/Index-RpQaZL_E.js"), "./Pages/Tenant/Core/NotFound.tsx": () => import("./assets/NotFound-C6P3hXj8.js"), "./Pages/Tenant/Core/Onboarding.tsx": () => import("./assets/Onboarding-BV5DMclw.js"), "./Pages/Tenant/Core/PricingPage.tsx": () => import("./assets/PricingPage-DhAuyXRW.js"), "./Pages/Tenant/Core/Profile.tsx": () => import("./assets/Profile-BF8eBtE8.js"), "./Pages/Tenant/Core/Profile/BrowserSessions.tsx": () => import("./assets/BrowserSessions-BPit92SN.js"), "./Pages/Tenant/Core/Profile/Edit.tsx": () => import("./assets/Edit-BYlZv5vx.js"), "./Pages/Tenant/Core/Profile/LoginHistory.tsx": () => import("./assets/LoginHistory-DxOzNh9H.js"), "./Pages/Tenant/Core/Profile/TwoFactor.tsx": () => import("./assets/TwoFactor-B1NjRq1J.js"), "./Pages/Tenant/Core/Settings.tsx": () => import("./assets/Settings-Dcpwupw_.js"), "./Pages/Tenant/Core/Settings/Branding.tsx": () => import("./assets/Branding-BqLxArAA.js"), "./Pages/Tenant/Core/Settings/Business.tsx": () => import("./assets/Business-CjR64G1m.js"), "./Pages/Tenant/Core/Settings/Localization.tsx": () => import("./assets/Localization-DCf1HLGq.js"), "./Pages/Tenant/Tracking/AiInsightsDashboard.jsx": () => import("./assets/AiInsightsDashboard-D7NTv-wI.js"), "./Pages/Tenant/Tracking/AnalyticsPage.jsx": () => import("./assets/AnalyticsPage-Bmn0cEO1.js"), "./Pages/Tenant/Tracking/AnalyticsPage.tsx": () => import("./assets/AnalyticsPage-tCs4DXJ6.js"), "./Pages/Tenant/Tracking/AttributionModeler.jsx": () => import("./assets/AttributionModeler-UmophFqL.js"), "./Pages/Tenant/Tracking/AudienceSync.jsx": () => import("./assets/AudienceSync-i8jaFlso.js"), "./Pages/Tenant/Tracking/CdpList.jsx": () => import("./assets/CdpList-Dl5hD0i3.js"), "./Pages/Tenant/Tracking/ContainersPage.tsx": () => import("./assets/ContainersPage-M8k194ZD.js"), "./Pages/Tenant/Tracking/DestinationsPage.tsx": () => import("./assets/DestinationsPage-CTj9TYq4.js"), "./Pages/Tenant/Tracking/DomainsPage.tsx": () => import("./assets/DomainsPage-BLmyKCAv.js"), "./Pages/Tenant/Tracking/EmbedCodePage.tsx": () => import("./assets/EmbedCodePage-6pupWZOt.js"), "./Pages/Tenant/Tracking/EventDebugger.jsx": () => import("./assets/EventDebugger-FpS5_3G5.js"), "./Pages/Tenant/Tracking/EventLogsPage.tsx": () => import("./assets/EventLogsPage-C8agENZJ.js"), "./Pages/Tenant/Tracking/Integrations/Shopify/ShopifyDashboard.jsx": () => import("./assets/ShopifyDashboard-h4M4ZW4y.js"), "./Pages/Tenant/Tracking/PowerUpsPage.tsx": () => import("./assets/PowerUpsPage-fPHbYKYj.js"), "./Pages/Tenant/Tracking/SingleCustomerView.jsx": () => import("./assets/SingleCustomerView-BcA0zSAg.js") });
      const path = `./Pages/${name}.tsx`;
      const altPath = `./Pages/${name}.jsx`;
      const importFn = pages[path] || pages[altPath];
      if (!importFn) {
        return Promise.reject(new Error(`Page not found: ${name}`));
      }
      return importFn().then((module) => {
        if (module.default) {
          module.default.layout = module.default.layout || ((p) => /* @__PURE__ */ jsx(TenantGlobalLayout, { children: p }));
        }
        return module;
      });
    },
    setup: ({ App, props }) => {
      global.route = (name, params, absolute) => route(name, params, absolute, {
        ...page.props.ziggy,
        location: new URL(page.props.ziggy.location)
      });
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(App, { ...props }),
        /* @__PURE__ */ jsx(Toaster$3, { position: "top-right", toastOptions: { duration: 4e3 } })
      ] });
    }
  })
);
export {
  useLanguage as a,
  cn as c,
  useToast as u
};
