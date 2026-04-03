import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { 
    CreditCard, 
    Globe, 
    History as LucideHistory, 
    Zap, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Calendar, 
    Receipt, 
    Download, 
    ShieldCheck, 
    Mail, 
    ArrowUpCircle,
    HardDrive,
    Users,
    Package,
    Activity,
    ExternalLink,
    Star,
    MoreVertical,
    FileText,
    ArrowUpRight,
    Plus,
    Trash2
} from "lucide-react";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import { Progress } from "@Tenant/components/ui/progress";
// DomainManagement and AddCardModal were removed during sGTM cleanup
// Inline stub replacements:
const DomainManagement = ({ initialDomains, plan }: any) => (
  <div className="space-y-3">
    {initialDomains?.length > 0 ? initialDomains.map((d: any, i: number) => (
      <div key={i} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm font-mono text-foreground">{d.domain || d}</span>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">Active</Badge>
      </div>
    )) : <p className="text-sm text-muted-foreground text-center py-6">No custom domains connected.</p>}
  </div>
);
const AddCardModal = ({ isOpen, onClose, onSuccess }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl bg-card border border-border p-8 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground mb-4">Add Payment Method</h3>
        <p className="text-sm text-muted-foreground mb-6">Payment method management will be connected to your billing provider.</p>
        <Button variant="outline" onClick={onClose} className="w-full rounded-xl">Close</Button>
      </div>
    </div>
  );
};
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@Tenant/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@Tenant/components/ui/tabs";
import { billingApi, type SubscriptionPlan } from "@Tenant/lib/billingApi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@Tenant/components/ui/dropdown-menu";
import { toast } from "sonner";

import { router } from "@inertiajs/react";

interface BillingProps {
    tenant: any;
    billing: any;
    domains: any[];
    subscription: any;
    plans: any[];
    paymentMethods: any[];
    invoices: any[];
    timeline: any[];
}

export default function BillingSettings({ 
    tenant, 
    billing, 
    domains,
    subscription,
    plans,
    paymentMethods,
    invoices,
    timeline
}: BillingProps) {
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
    const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

    const refresh = () => {
        router.reload({ only: ['subscription', 'plans', 'paymentMethods', 'invoices', 'timeline'] });
    };

    const cancelSubscription = async () => {
        try {
            const res = await billingApi.cancelSubscription();
            if (res.success) {
                toast.success("Subscription canceled successfully");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to cancel subscription");
        }
    };

    const reactivateSubscription = async () => {
        try {
            const res = await billingApi.reactivateSubscription();
            if (res.success) {
                toast.success("Subscription reactivated!");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reactivate subscription");
        }
    };

    const deletePaymentMethod = async (id: number) => {
        if (!confirm("Remove this payment method?")) return;
        try {
            const res = await billingApi.deletePaymentMethod(id);
            if (res.success) {
                toast.success("Payment method removed");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to remove payment method");
        }
    };

    const setDefaultPaymentMethod = async (id: number) => {
        try {
            const res = await billingApi.setDefaultPaymentMethod(id);
            if (res.success) {
                toast.success("Default payment method updated");
                refresh();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update default payment method");
        }
    };

    const usage = subscription?.usage || { db_usage_percent: 0, db_usage_gb: 0, db_limit_gb: 0 };
    const activePlan = subscription?.plan;
    const isStarterPlan = activePlan?.plan_key === "starter";

    const handleUpgrade = async (planSlug: string) => {
        try {
            setIsUpgrading(planSlug);
            const result = await billingApi.createCheckoutSession({
                plan_slug: planSlug,
                subscription_type: billingCycle
            });

            if (result.success && result.data?.url) {
                window.location.href = result.data.url;
            } else {
                toast.error(result.message || "Failed to initiate upgrade");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to initiate upgrade");
        } finally {
            setIsUpgrading(null);
        }
    };

    const handlePayInvoice = async (id: number) => {
        try {
            setPayingInvoiceId(id);
            const result = await billingApi.payInvoice(id);
            if (result.success && result.data?.url) {
                window.location.href = result.data.url;
            } else {
                toast.error(result.message || "Failed to initiate payment");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to initiate payment");
        } finally {
            setPayingInvoiceId(null);
        }
    };

    const scrollToPlans = () => {
        const element = document.getElementById('pricing-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Subscription & Billing" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-indigo-500" />
                            </div>
                            Billing & Domains
                        </h1>
                        <p className="mt-2 text-muted-foreground font-medium">
                            Manage your plan, connect custom domains, and view transaction history.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 py-1.5 px-3 rounded-lg font-bold">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                            System Active
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                        <TabsTrigger value="overview" className="rounded-lg font-bold px-6">Overview</TabsTrigger>
                        <TabsTrigger value="plans" className="rounded-lg font-bold px-6">Plans</TabsTrigger>
                        <TabsTrigger value="domains" className="rounded-lg font-bold px-6">Domains</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg font-bold px-6">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Current Plan Overview (Premium Design) */}
                            <Card className={`lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br transition-all duration-500 rounded-3xl relative group ${isStarterPlan ? 'from-amber-500/10 via-amber-600/5 to-transparent' : 'from-primary/10 via-primary/5 to-transparent'}`}>
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                    <ShieldCheck className="h-48 w-48 text-primary" />
                                </div>
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
                                                        {activePlan?.name || "Starter Plan"}
                                                    </h2>
                                                    {isStarterPlan && (
                                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                            Standard
                                                        </Badge>
                                                    )}
                                                    {subscription?.status === 'active' && <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[10px] font-bold uppercase">Active</Badge>}
                                                </div>
                                                <p className="text-muted-foreground font-medium">
                                                    {subscription?.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription
                                                </p>
                                            </div>

                                            <div className="flex items-baseline gap-1">
                                                <span className="text-5xl font-black text-foreground">
                                                    ${activePlan ? (subscription?.billing_cycle === 'yearly' ? activePlan.price_yearly : activePlan.price_monthly) : '0'}
                                                </span>
                                                <span className="text-muted-foreground font-bold">
                                                    /{subscription?.billing_cycle === 'yearly' ? 'year' : 'month'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-2">
                                                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 transition-colors hover:bg-background/80">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-semibold">
                                                        Renews: {subscription?.renews_at ? new Date(subscription.renews_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 transition-colors hover:bg-background/80">
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-semibold uppercase tracking-tight">
                                                        {subscription?.status || 'Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full md:w-auto">
                                            <Button
                                                className="h-12 px-8 text-base font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                                                onClick={scrollToPlans}
                                            >
                                                {isStarterPlan ? 'Upgrade Plan' : 'Manage Plan'}
                                            </Button>
                                            {subscription?.status === 'active' ? (
                                                <Button
                                                    variant="ghost"
                                                    className="h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-semibold"
                                                    onClick={cancelSubscription}
                                                >
                                                    Cancel Subscription
                                                </Button>
                                            ) : subscription?.status === 'canceled' ? (
                                                <Button
                                                    variant="ghost"
                                                    className="h-10 text-emerald-600 hover:bg-emerald-50 font-semibold"
                                                    onClick={reactivateSubscription}
                                                >
                                                    Reactivate Plan
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>

                                    {isStarterPlan && (
                                        <div className="mt-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                            <div className="flex items-center gap-4 text-center md:text-left">
                                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                                                    <Zap className="h-6 w-6 fill-amber-500/20" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-amber-900">Unlock Premium Features</h4>
                                                    <p className="text-sm text-amber-800/80 max-w-md">
                                                        Upgrade to Growth or Pro to unlock custom domains, advanced analytics, and priority supports.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-transparent border-amber-500/30 text-amber-700 hover:bg-amber-500 hover:text-white font-bold h-10 px-6 rounded-lg transition-all"
                                                onClick={scrollToPlans}
                                            >
                                                View Plans
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resource Status (Usage Bars) */}
                            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5">Resource Status</CardTitle>
                                        <Activity className="h-4 w-4 text-primary" />
                                    </div>
                                    <CardDescription>Live monitoring of your scale</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 flex-1">
                                    {/* Database Storage */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight">
                                                <HardDrive className="h-3.5 w-3.5" /> Storage
                                            </span>
                                            <span className={usage?.is_over_quota ? "text-destructive" : "text-foreground"}>
                                                {Number(usage?.db_usage_gb || 0).toFixed(2)} / {usage?.db_limit_gb || 0} GB
                                            </span>
                                        </div>
                                        <Progress
                                            value={usage?.db_usage_percent || 0}
                                            className={`h-2 ${usage?.is_over_quota ? "bg-destructive/20 [&>div]:bg-destructive" : "bg-primary/10"}`}
                                        />
                                    </div>

                                    {/* Admin Users */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight">
                                                <Users className="h-3.5 w-3.5" /> Team Seats
                                            </span>
                                            <span>
                                                {usage?.users?.used || 0} / {usage?.users?.limit || 0}
                                            </span>
                                        </div>
                                        <Progress
                                            value={((usage?.users?.used || 0) / (usage?.users?.limit || 1)) * 100}
                                            className="h-2 bg-primary/10"
                                        />
                                    </div>

                                    {/* AI Daily Quota */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight">
                                                <Zap className="h-3.5 w-3.5" /> AI Daily
                                            </span>
                                            <span>
                                                {usage?.ai_daily?.used || 0} / {usage?.ai_daily?.limit || 0}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(usage?.ai_daily?.used || 0) / (usage?.ai_daily?.limit || 1) * 100}
                                            className="h-2 bg-primary/10"
                                        />
                                    </div>

                                    {/* Scraping */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-tight">
                                                <Globe className="h-3.5 w-3.5" /> Scraping
                                            </span>
                                            <span>
                                                {usage?.scraping_daily?.used || 0} / {usage?.scraping_daily?.limit || 0}
                                            </span>
                                        </div>
                                        <Progress
                                            value={(usage?.scraping_daily?.used || 0) / (usage?.scraping_daily?.limit || 1) * 100}
                                            className="h-2 bg-primary/10"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Methods (Quick View) */}
                            <Card className="lg:col-span-3 rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                                    <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5">Primary Payment Methods</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary font-bold gap-1" onClick={() => setIsAddCardOpen(true)}>
                                        <Plus className="h-4 w-4" /> Add Method
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {paymentMethods.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-slate-100">
                                            {paymentMethods.map(pm => (
                                                <div key={pm.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-14 rounded-lg bg-slate-900 flex items-center justify-center text-white relative overflow-hidden shadow-inner">
                                                            <span className="text-[10px] font-black italic uppercase">{pm.brand}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">•••• {pm.last4}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expires {pm.expiry_display}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {pm.is_default && <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">Default</Badge>}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                                                                {!pm.is_default && (
                                                                    <DropdownMenuItem className="font-bold text-xs gap-2" onClick={() => setDefaultPaymentMethod(pm.id)}>
                                                                        <Star className="h-3.5 w-3.5 fill-primary text-primary" /> Set Default
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem className="font-bold text-xs gap-2 text-rose-500 focus:text-rose-500" onClick={() => deletePaymentMethod(pm.id)}>
                                                                    <Trash2 className="h-3.5 w-3.5" /> Remove Card
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50/30 flex flex-col items-center justify-center space-y-3">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <CreditCard className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold max-w-[200px]">No payment methods linked. Invoices will require manual payment.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="plans" id="pricing-section" className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-black tracking-tight uppercase">Choose the best plan for your scale</h2>
                            <p className="text-muted-foreground font-medium">Switch between billing cycles to save on annual subscriptions.</p>
                            
                            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mt-4">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Yearly <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black h-4">-20%</Badge>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((p) => {
                                const isActive = activePlan?.plan_key === p.plan_key;
                                const price = billingCycle === 'yearly' ? p.price_yearly : p.price_monthly;
                                const period = billingCycle === 'yearly' ? '/yr' : '/mo';

                                return (
                                    <Card key={p.id} className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${isActive ? 'border-primary shadow-xl shadow-primary/5' : 'border-slate-100 shadow-sm'}`}>
                                        {isActive && (
                                            <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-xl">
                                                Current Plan
                                            </div>
                                        )}
                                        <CardHeader className="space-y-1 pb-4">
                                            <CardTitle className="text-xl font-black uppercase">{p.name}</CardTitle>
                                            <CardDescription className="font-medium line-clamp-1">{p.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-slate-900">${price}</span>
                                                <span className="text-sm font-bold text-slate-400">{period}</span>
                                            </div>
                                            <ul className="space-y-3">
                                                {p.features && p.features.map((feature: string) => (
                                                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                                        <div className="mt-1 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                                        </div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button
                                                className="w-full h-11 rounded-xl font-black gap-2"
                                                variant={isActive ? "outline" : "default"}
                                                disabled={isActive || isUpgrading === p.plan_key}
                                                onClick={() => handleUpgrade(p.plan_key)}
                                            >
                                                {isUpgrading === p.plan_key && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {isActive ? "Managed" : "Subscribe"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="domains" className="animate-in slide-in-from-bottom-2 duration-300">
                        <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black text-slate-900">Connected Domains</CardTitle>
                                    <CardDescription>Configure custom DNS for your storefront access.</CardDescription>
                                </div>
                                <Globe className="h-6 w-6 text-indigo-500/50" />
                            </CardHeader>
                            <CardContent className="p-6">
                                <DomainManagement initialDomains={domains} plan={billing?.plan} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="animate-in slide-in-from-bottom-2 duration-300 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Invoices List */}
                            <Card className="lg:col-span-2 rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-black text-slate-900">Recent Invoices</CardTitle>
                                        <Receipt className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <CardDescription>Download and manage your subscription payments.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {invoices.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {invoices.map(invoice => (
                                                <div key={invoice.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{invoice.invoice_number}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                                <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>{invoice.subscription_type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900">${invoice.total.toFixed(2)}</p>
                                                            <Badge className={`rounded-lg border-none text-[9px] font-black h-5 uppercase px-2 shadow-sm ${
                                                                invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                                            }`}>
                                                                {invoice.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {invoice.status === 'pending' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    className="h-8 text-[10px] font-bold uppercase tracking-tight gap-1 px-3"
                                                                    disabled={payingInvoiceId === invoice.id}
                                                                    onClick={() => handlePayInvoice(invoice.id)}
                                                                >
                                                                    {payingInvoiceId === invoice.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                                                                    Pay Now
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                                onClick={() => window.open(billingApi.getInvoiceDownloadUrl(invoice.id), '_blank')}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                                            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <LucideHistory className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-black text-slate-900">No Payment History</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline Component */}
                            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest pt-0.5">Billing Timeline</CardTitle>
                                    <CardDescription>Activity log of your subscription</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                                        {timeline.length > 0 ? timeline.map((event) => (
                                            <div key={event.id} className="relative pl-10 group">
                                                <div className="absolute left-0 top-1.5 h-8 w-8 rounded-xl border-4 border-white bg-slate-200 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                                    {event.type === 'payment' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                    {event.type === 'invoice' && <FileText className="h-4 w-4 text-slate-400" />}
                                                    {event.type === 'subscription' && <Activity className="h-4 w-4 text-indigo-500" />}
                                                    {event.type === 'module' && <Package className="h-4 w-4 text-amber-500" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{event.title}</p>
                                                        <time className="text-[10px] font-bold text-slate-400">{new Date(event.date).toLocaleDateString()}</time>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{event.description}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-10 text-center italic text-slate-300 text-xs font-medium">
                                                No events recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <AddCardModal 
                isOpen={isAddCardOpen} 
                onClose={() => setIsAddCardOpen(false)} 
                onSuccess={() => {
                    refresh();
                }}
            />
        </DashboardLayout>
    );
}
