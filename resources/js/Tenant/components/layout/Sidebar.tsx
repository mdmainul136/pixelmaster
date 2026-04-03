/**
 * ============================================================================
 * Sidebar — sGTM Tracking Platform Navigation
 * ============================================================================
 * Plan-based nav: items show/hide based on current plan tier.
 * No locking — just show what the tenant has access to.
 *
 * Plan hierarchy: free → pro → business → enterprise → custom
 *
 *  Free:       Dashboard, Containers, Domains, Destinations, Embed Code
 *  Pro+:       + Analytics, Event Logs, Power-Ups, Audience Sync
 *  Business+:  + Attribution, AI Insights, CDP
 *  Enterprise+ — full access (same as Business for now)
 * ============================================================================
 */
import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard, Server, Globe, Layers, Zap,
  Activity, Code, Settings, User, LogOut, X, ChevronDown, Lock,
  Target, Cloud, CreditCard, BarChart3, BrainCircuit, Users, Terminal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Badge } from "@Tenant/components/ui/badge";

// ─── Plan helpers ─────────────────────────────────────────────────────────────
const PLAN_RANK: Record<string, number> = {
  free: 0, pro: 1, business: 2, enterprise: 3, custom: 4,
};

/** Returns true when currentPlan >= requiredPlan */
function atLeast(currentPlan: any, requiredPlan: string): boolean {
  const planObj = currentPlan as any;
  const planKey = (typeof currentPlan === "string" ? currentPlan : planObj?.name || planObj?.plan_key || "free").toLowerCase();
  return (PLAN_RANK[planKey] ?? 0) >= (PLAN_RANK[requiredPlan] ?? 99);
}

// ─── Shared types ─────────────────────────────────────────────────────────────
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  currentPath: string;
  children?: { label: string; href: string }[];
  locked?: boolean;
}

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ label }: { label: string }) => (
  <p className="mb-2 mt-6 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
    {label}
  </p>
);

const NavItem = ({ icon, label, href, currentPath, children, locked }: NavItemProps) => {
  const isActive = children
    ? children.some((c) => currentPath.startsWith(c.href))
    : currentPath === href || (href !== '/' && currentPath.startsWith(href));
  const [expanded, setExpanded] = useState(isActive);

  if (children) {
    return (
      <li className="relative">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
              ? "bg-[#ebebed] text-foreground"
              : "text-muted-foreground hover:bg-[#ebebed] hover:text-foreground"
            }`}
        >
          {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />}
          <span className={`${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 stroke-[2px]" })}
          </span>
          <span className="flex-1 text-start">{label}</span>
          <ChevronDown className={`h-3 w-3 opacity-40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expanded ? "max-h-96 mt-1" : "max-h-0"}`}>
          <ul className="space-y-0.5 ps-10">
            {children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={`block rounded-md px-3 py-2 text-xs font-medium transition-all ${currentPath === child.href || currentPath.startsWith(child.href + "/")
                      ? "text-foreground font-bold bg-[#ebebed]/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#ebebed]/30"
                    }`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li className="relative">
      <Link
        href={href}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
            ? "bg-[#ebebed] text-foreground font-semibold"
            : "text-muted-foreground hover:bg-[#ebebed] hover:text-foreground"
          }`}
      >
        {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full" />}
        <span className={`${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 stroke-[2px]" })}
        </span>
        <span className="flex-1">{label}</span>
        {locked && <Lock className="h-3 w-3 text-amber-600/60" />}
      </Link>
    </li>
  );
};

// ─── Usage meter ──────────────────────────────────────────────────────────────
const UsageWidget = ({ plan, tenantId }: { plan: string, tenantId?: string }) => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["billing-usage", tenantId],
    queryFn: async () => {
      const url = tenantId ? `/api/v1/subscriptions/usage?tenant_id=${tenantId}` : "/api/v1/subscriptions/usage";
      const { data } = await axios.get(url);
      return data.data;
    },
    refetchInterval: 60_000,
  });

  const planObj = plan as any;
  const planKey = (typeof plan === "string" ? plan : planObj?.name || planObj?.plan_key || "free").toLowerCase();

  if (isLoading || !usage) return null;

  const fmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  
  const statusColors = {
    ok: "bg-emerald-500",
    overage: "bg-amber-500",
    dropped: "bg-rose-500"
  };

  const barColor = statusColors[usage.status as keyof typeof statusColors] || statusColors.ok;
  
  let displayPercent = usage.percent;
  let maxDisplay = usage.limit;

  if (usage.status === 'overage' || usage.status === 'dropped') {
      displayPercent = Math.min(100, (usage.usage / usage.drop_limit) * 100);
      maxDisplay = usage.drop_limit;
  }

  return (
    <div className="mx-2 p-3 rounded-lg bg-white border border-border/60 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Usage</span>
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground border-none">
           {planKey}
        </span>
      </div>
      
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-xs font-bold ${usage.status === 'dropped' ? 'text-rose-600' : 'text-foreground'}`}>
           {fmt.format(usage.usage)}
        </span>
        <span className="text-[9px] font-medium text-muted-foreground/60">
           / {fmt.format(maxDisplay)}
        </span>
      </div>

      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, displayPercent)}%` }}
        />
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { url, props } = usePage<any>();
  const currentPath = url;
  
  const plan = props.plan ?? props.auth?.plan ?? "free";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col bg-[#f1f2f4] border-r border-border transition-all duration-300 lg:static ${isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-60"
          }`}
      >
        {/* Shopify-Style Logo */}
        <div className="px-5 py-4 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2">
             <div className="flex h-7 w-7 items-center justify-center rounded bg-foreground text-background shadow-sm">
                <Zap className="h-4 w-4 fill-current" />
             </div>
             <span className="text-sm font-bold tracking-tight text-foreground">PixelMaster</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-2 overflow-y-auto scrollbar-none space-y-1">
          <ul className="space-y-0.5">
            <NavItem icon={<LayoutDashboard />} label="Home" href="/dashboard" currentPath={currentPath} />
            <NavItem icon={<BarChart3 />} label="Analytics" href="/analytics" currentPath={currentPath} />
          </ul>

          <SectionHeader label="Inventory" />
          <ul className="space-y-0.5">
            <NavItem icon={<Server />} label="Containers" href="/containers" currentPath={currentPath} />
            <NavItem icon={<Layers />} label="Destinations" href="/destinations" currentPath={currentPath} />
            <NavItem icon={<Globe />} label="Domains" href="/domains" currentPath={currentPath} />
            <NavItem icon={<Users />} label="Team" href="/settings/team" currentPath={currentPath} />
          </ul>

          <SectionHeader label="Advanced" />
          <ul className="space-y-0.5">
            <NavItem icon={<Activity />} label="Event Logs" href="/event-logs" currentPath={currentPath} />
            <NavItem icon={<Cloud />} label="Audience Sync" href="/sgtm/audience-sync" currentPath={currentPath} />
            <NavItem icon={<Zap />} label="Power-Ups" href="/power-ups" currentPath={currentPath} />
            <NavItem icon={<Terminal />} label="Debugger" href={`/sgtm/debugger/${props.active_container_id || 'main'}`} currentPath={currentPath} />
          </ul>

          <SectionHeader label="Intelligence" />
          <ul className="space-y-0.5">
            <NavItem icon={<Target />} label="Attribution" href={`/sgtm/attribution/${props.active_container_id || 'main'}`} currentPath={currentPath} />
            <NavItem icon={<BrainCircuit />} label="AI Insights" href="/sgtm/ai-insights" currentPath={currentPath} />
            <NavItem icon={<Users />} label="CDP" href={`/sgtm/cdp/${props.active_container_id || 'main'}`} currentPath={currentPath} />
          </ul>
        </nav>

        <div className="p-2 space-y-3">
          <UsageWidget plan={plan} tenantId={props.tenant_id || props.auth?.tenant_id} />
          
          <div className="flex flex-col gap-0.5">
             <NavItem icon={<CreditCard />} label="Billing" href="/settings/billing" currentPath={currentPath} />
             <NavItem icon={<Settings />} label="Settings" href="/settings" currentPath={currentPath} />
             
             <Link
               href="/auth/logout"
               method="post"
               as="button"
               className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-rose-100/50 hover:text-rose-600 transition-all mt-1"
             >
               <LogOut className="h-4 w-4" />
               <span>Logout</span>
             </Link>
          </div>
        </div>
      </aside>
    </>
  );
};


export default Sidebar;
