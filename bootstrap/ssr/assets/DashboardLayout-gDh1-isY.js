import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { useState, useSyncExternalStore } from "react";
import { usePage, Link } from "@inertiajs/react";
import { Activity, X, LayoutDashboard, BarChart3, Server, Layers, Globe, Code, Terminal, Cloud, Zap, Target, BrainCircuit, Users, Settings, LogOut, ChevronDown, Lock, CheckCheck, Trash2, GraduationCap, FileText, Flame, Award, BookOpen, DollarSign, Monitor, Package, ShoppingCart, Menu, Search, Bell, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { cva } from "class-variance-authority";
import { c as cn, a as useLanguage } from "../ssr.js";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-success/10 text-success",
        warning: "border-transparent bg-warning/10 text-warning"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const PLAN_RANK = {
  free: 0,
  pro: 1,
  business: 2,
  enterprise: 3,
  custom: 4
};
function atLeast(currentPlan, requiredPlan) {
  const planObj = currentPlan;
  const planKey = (typeof currentPlan === "string" ? currentPlan : (planObj == null ? void 0 : planObj.name) || (planObj == null ? void 0 : planObj.plan_key) || "free").toLowerCase();
  return (PLAN_RANK[planKey] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 99);
}
const SectionHeader = ({ label }) => /* @__PURE__ */ jsx("p", { className: "mb-2 mt-6 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60", children: label });
const NavItem = ({ icon, label, href, currentPath, children, locked }) => {
  const isActive = children ? children.some((c) => currentPath.startsWith(c.href)) : currentPath === href || currentPath.startsWith(href + "/");
  const [expanded, setExpanded] = useState(isActive);
  if (children) {
    return /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setExpanded(!expanded),
          className: `group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: `${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`, children: React__default.cloneElement(icon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("span", { className: "flex-1 text-start", children: label }),
            /* @__PURE__ */ jsx(ChevronDown, { className: `h-3 w-3 opacity-40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}` })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: `overflow-hidden transition-all duration-200 ${expanded ? "max-h-96 mt-1" : "max-h-0"}`, children: /* @__PURE__ */ jsx("ul", { className: "space-y-0.5 ps-10", children: children.map((child) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        Link,
        {
          href: child.href,
          className: `block rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentPath === child.href || currentPath.startsWith(child.href + "/") ? "text-primary font-bold bg-sidebar-accent/50" : "text-muted-foreground hover:text-primary hover:bg-sidebar-accent/30"}`,
          children: child.label
        }
      ) }, child.href)) }) })
    ] });
  }
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    Link,
    {
      href,
      className: `group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: `${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`, children: React__default.cloneElement(icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("span", { className: "flex-1", children: label }),
        locked && /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-amber-600/60" })
      ]
    }
  ) });
};
const UsageWidget = ({ plan, tenantId }) => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["billing-usage", tenantId],
    queryFn: async () => {
      const url = tenantId ? `/api/v1/subscriptions/usage?tenant_id=${tenantId}` : "/api/v1/subscriptions/usage";
      const { data } = await axios.get(url);
      return data.data;
    },
    refetchInterval: 6e4
  });
  const planObj = plan;
  const planKey = (typeof plan === "string" ? plan : (planObj == null ? void 0 : planObj.name) || (planObj == null ? void 0 : planObj.plan_key) || "free").toLowerCase();
  if (isLoading || !usage) return null;
  const fmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  const isWarning = usage.percent >= 80;
  return /* @__PURE__ */ jsxs("div", { className: "mx-2 p-4 rounded-xl bg-white border border-border shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Network Activity" }),
      /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[9px] font-black h-4 px-1.5 border-slate-200", children: planKey })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between mb-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-foreground", children: fmt.format(usage.usage) }),
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-medium text-muted-foreground", children: [
        "/ ",
        fmt.format(usage.limit)
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: `h-full rounded-full transition-all duration-1000 ease-out ${isWarning ? "bg-amber-500" : "bg-accent"}`,
        style: { width: `${Math.min(100, usage.percent)}%` }
      }
    ) })
  ] });
};
const Sidebar = ({ isOpen, onClose }) => {
  var _a, _b;
  const { url, props } = usePage();
  const currentPath = url;
  const [devPlan, setDevPlan] = React__default.useState(null);
  React__default.useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      const stored = localStorage.getItem("dev_plan_override");
      if (stored) setDevPlan(stored);
    }
  }, []);
  const basePlan = props.plan ?? ((_a = props.auth) == null ? void 0 : _a.plan) ?? "free";
  const plan = devPlan || basePlan;
  const isPro = atLeast(plan, "pro");
  const isBusiness = atLeast(plan, "business");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] lg:hidden", onClick: onClose }),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `fixed top-0 left-0 z-50 flex h-screen flex-col bg-sidebar border-right border-sidebar-border transition-all duration-300 lg:static shadow-sm ${isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-64"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "px-6 py-6 border-b border-sidebar-border bg-white flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs(Link, { href: "/", className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm", children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-base font-black tracking-tight text-foreground uppercase", children: "PixelMaster" })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: onClose, className: "lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-muted-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-3 py-4 overflow-y-auto scrollbar-thin", children: [
            /* @__PURE__ */ jsx(SectionHeader, { label: "Overview" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(LayoutDashboard, {}), label: "Dashboard", href: "/dashboard", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(BarChart3, {}), label: "Analytics", href: "/analytics", currentPath })
            ] }),
            /* @__PURE__ */ jsx(SectionHeader, { label: "Infrastructure" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Server, {}), label: "Containers", href: "/containers", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Layers, {}), label: "Destinations", href: "/destinations", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Globe, {}), label: "Tracking Domains", href: "/domains", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Code, {}), label: "Implementation", href: "/embed", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Terminal, {}), label: "Live Debug", href: `/sgtm/debugger/${props.active_container_id || "main"}`, currentPath })
            ] }),
            /* @__PURE__ */ jsx(SectionHeader, { label: "Data Cloud" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Activity, {}), label: "Event Logs", href: "/event-logs", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Cloud, {}), label: "Audience Sync", href: "/sgtm/audience-sync", currentPath }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Zap, {}), label: "Power-Ups", href: "/power-ups", currentPath, locked: !isPro })
            ] }),
            /* @__PURE__ */ jsx(SectionHeader, { label: "Enterprise" }),
            /* @__PURE__ */ jsxs("ul", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Target, {}), label: "Attribution", href: `/sgtm/attribution/${props.active_container_id || "default"}`, currentPath, locked: !isBusiness }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(BrainCircuit, {}), label: "AI Intelligence", href: "/sgtm/ai-insights", currentPath, locked: !isBusiness }),
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Users, {}), label: "Customer CDP", href: `/sgtm/cdp/${props.active_container_id || "default"}`, currentPath, locked: !isBusiness })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-3 bg-slate-50/50 border-t border-sidebar-border", children: [
            /* @__PURE__ */ jsx(UsageWidget, { plan, tenantId: props.tenant_id || ((_b = props.auth) == null ? void 0 : _b.tenant_id) }),
            /* @__PURE__ */ jsxs("div", { className: "px-3 pb-2 flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Settings, {}), label: "Settings", href: "/settings", currentPath }),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: "/auth/logout",
                  method: "post",
                  as: "button",
                  className: "group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-all",
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Sign Out" })
                  ]
                }
              )
            ] }),
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && /* @__PURE__ */ jsx("div", { className: "px-3 pb-2 opacity-60 hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: plan,
                onChange: (e) => {
                  const val = e.target.value;
                  localStorage.setItem("dev_plan_override", val);
                  setDevPlan(val);
                },
                className: "w-full bg-white border border-slate-200 text-[10px] font-bold uppercase rounded-md py-1 px-2 text-muted-foreground outline-none cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "free", children: "Free" }),
                  /* @__PURE__ */ jsx("option", { value: "pro", children: "Pro" }),
                  /* @__PURE__ */ jsx("option", { value: "business", children: "Business" }),
                  /* @__PURE__ */ jsx("option", { value: "enterprise", children: "Enterprise" })
                ]
              }
            ) })
          ] })
        ]
      }
    )
  ] });
};
const EMPTY_NOTIFICATIONS = [];
const getNotifications = () => EMPTY_NOTIFICATIONS;
const subscribe = (_cb) => () => {
};
const markAsRead = (_id) => {
};
const markAllAsRead = () => {
};
const deleteNotification = (_id) => {
};
function useNotifications() {
  return useSyncExternalStore(subscribe, getNotifications, getNotifications);
}
const typeIcons = {
  order: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4" }),
  stock: /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }),
  system: /* @__PURE__ */ jsx(Monitor, { className: "h-4 w-4" }),
  staff: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
  payment: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }),
  "lms-course": /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
  "lms-badge": /* @__PURE__ */ jsx(Award, { className: "h-4 w-4" }),
  "lms-streak": /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4" }),
  "lms-quiz": /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
  "lms-certificate": /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" })
};
const typeColors = {
  order: "bg-primary/10 text-primary",
  stock: "bg-warning/10 text-warning",
  system: "bg-muted text-muted-foreground",
  staff: "bg-violet-500/10 text-violet-600",
  payment: "bg-success/10 text-success",
  "lms-course": "bg-blue-500/10 text-blue-600",
  "lms-badge": "bg-amber-500/10 text-amber-600",
  "lms-streak": "bg-orange-500/10 text-orange-600",
  "lms-quiz": "bg-emerald-500/10 text-emerald-600",
  "lms-certificate": "bg-purple-500/10 text-purple-600"
};
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 6e4;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}
const NotificationCenter = ({ open, onClose }) => {
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-card-foreground", children: "Notifications" }),
        unreadCount > 0 && /* @__PURE__ */ jsx(Badge, { className: "bg-primary text-primary-foreground text-xs px-1.5", children: unreadCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        unreadCount > 0 && /* @__PURE__ */ jsx("button", { onClick: markAllAsRead, className: "rounded p-1 text-xs text-muted-foreground hover:text-foreground", title: "Mark all read", children: /* @__PURE__ */ jsx(CheckCheck, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "rounded p-1 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-h-[400px] overflow-y-auto scrollbar-thin", children: notifications.length === 0 ? /* @__PURE__ */ jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No notifications" }) : notifications.map((n) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn("flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer", !n.read && "bg-primary/5"),
        onClick: () => !n.read && markAsRead(n.id),
        children: [
          /* @__PURE__ */ jsx("div", { className: cn("mt-0.5 rounded-lg p-2", typeColors[n.type]), children: typeIcons[n.type] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: cn("text-sm", !n.read ? "font-semibold text-card-foreground" : "text-card-foreground"), children: n.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: n.message }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: timeAgo(n.createdAt) })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.stopPropagation();
            deleteNotification(n.id);
          }, className: "mt-1 rounded p-1 text-muted-foreground/50 hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ]
      },
      n.id
    )) })
  ] });
};
const Header = ({ sidebarOpen, onToggleSidebar }) => {
  const { t } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { auth } = usePage().props;
  const user = auth == null ? void 0 : auth.user;
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-none", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onToggleSidebar,
          className: "lg:hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: `relative hidden sm:flex items-center w-full max-w-md group`, children: [
        /* @__PURE__ */ jsx("div", { className: `absolute left-3 transition-colors ${searchFocused ? "text-primary" : "text-muted-foreground"}`, children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search sGTM resources...",
            className: `h-9 w-full rounded-lg border bg-slate-50 pl-10 pr-4 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/60 ${searchFocused ? "border-primary ring-1 ring-primary bg-white shadow-sm" : "border-slate-200 hover:border-slate-300"}`,
            onFocus: () => setSearchFocused(true),
            onBlur: () => setSearchFocused(false)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20", children: [
        /* @__PURE__ */ jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-accent animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-accent uppercase tracking-wider", children: "Node: Healthy" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            },
            className: `relative rounded-lg p-2 transition-all ${notifOpen ? "bg-slate-100 text-primary" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "h-4.5 w-4.5" }),
              unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-black text-white", children: unreadCount })
            ]
          }
        ),
        /* @__PURE__ */ jsx(NotificationCenter, { open: notifOpen, onClose: () => setNotifOpen(false) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-slate-200 mx-1 hidden sm:block" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            },
            className: `flex items-center gap-2.5 rounded-lg p-1 transition-all ${profileOpen ? "bg-slate-100" : "hover:bg-slate-50"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white text-xs font-black uppercase shadow-sm", children: (user == null ? void 0 : user.name) ? user.name.charAt(0) : "A" }),
              /* @__PURE__ */ jsxs("div", { className: "hidden text-left lg:block mr-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground leading-none", children: (user == null ? void 0 : user.name) || "Administrator" }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-medium mt-0.5", children: (user == null ? void 0 : user.email) || "admin@pixelmaster.io" })
              ] }),
              /* @__PURE__ */ jsx(ChevronDown, { className: `hidden h-3 w-3 text-muted-foreground lg:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}` })
            ]
          }
        ),
        profileOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in zoom-in-95 duration-100", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-slate-100 mb-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-muted-foreground tracking-widest", children: "Signed in as" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-foreground truncate", children: (user == null ? void 0 : user.email) || "admin" })
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: "/profile", className: "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-slate-50", children: [
            /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " Account Settings"
          ] }),
          /* @__PURE__ */ jsxs(Link, { href: "/settings", className: "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-slate-50", children: [
            /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " GTM Configuration"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-slate-100" }),
          /* @__PURE__ */ jsxs(Link, { href: "/auth/logout", method: "post", as: "button", className: "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50", children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
            " Sign Out"
          ] })
        ] })
      ] })
    ] })
  ] });
};
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { dir } = useLanguage();
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen overflow-hidden bg-background", dir, children: [
    /* @__PURE__ */ jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx(Header, { sidebarOpen, onToggleSidebar: () => setSidebarOpen(!sidebarOpen) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7", children })
    ] })
  ] });
};
export {
  Badge as B,
  DashboardLayout as D
};
