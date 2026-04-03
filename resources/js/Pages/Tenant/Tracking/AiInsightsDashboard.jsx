import React, { useState, useEffect } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Head, Link } from '@inertiajs/react';
import { 
    BrainCircuit, 
    TrendingUp, 
    Users, 
    Activity, 
    ChevronRight, 
    AlertTriangle, 
    ShieldCheck, 
    Zap, 
    ArrowUpRight, 
    Info, 
    Rocket,
    BarChart3,
    Sparkles,
    PieChart,
    RefreshCcw,
    LayoutDashboard
} from 'lucide-react';
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";

const AiInsightsDashboard = ({ insights = [], predictive = {}, container }) => {
    const [isLoading, setIsLoading] = useState(false);

    const getSeverityBadge = (sev) => {
        switch (sev?.toLowerCase()) {
            case 'critical': return <Badge className="bg-rose-50 text-rose-700 border-rose-100 text-[10px] font-bold uppercase tracking-wider">Critical</Badge>;
            case 'warning': return <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-bold uppercase tracking-wider">Warning</Badge>;
            case 'success': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold uppercase tracking-wider">Success</Badge>;
            default: return <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase tracking-wider">Info</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="AI Predictive Insights — PixelMaster" />

            <div className="max-w-6xl mx-auto py-10 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">AI Advisor & Predictions</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Predict LTV and prevent churn using Gemini-powered analytics.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsLoading(true);
                                window.location.reload();
                            }}
                            className="bg-white hover:bg-muted h-9 text-xs font-bold px-4"
                        >
                            <RefreshCcw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Update insights
                        </Button>
                        <div className="h-9 px-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-bold flex items-center gap-2">
                            <ShieldCheck size={14} /> Health: {predictive.health_score || 0}%
                        </div>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Predicted Revenue Upside</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-bold text-foreground">${predictive.total_predicted_upside?.toLocaleString() || 0}</h2>
                            <span className="text-xs font-bold text-emerald-600 flex items-center">
                                <TrendingUp size={12} className="mr-1" /> +14.2%
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Next 90-day retention forecast</p>
                    </div>

                    <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">VIP Churn Risk</p>
                        <h2 className="text-2xl font-bold text-rose-600">{predictive.vip_at_risk || 0}</h2>
                        <p className="text-xs text-muted-foreground mt-2">High-LTV contacts in critical zone</p>
                    </div>

                    <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-6">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Prediction Accuracy</p>
                        <h2 className="text-2xl font-bold text-blue-600">92.4%</h2>
                        <p className="text-xs text-muted-foreground mt-2">Gemini signal confidence level</p>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Insights List */}
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold text-foreground">AI Priority Feed</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Recommended actions based on real-time event patterns and visitor behavior.
                        </p>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="bg-white dark:bg-card border border-border shadow-sm rounded-lg p-5 group flex items-start justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {getSeverityBadge(insight.severity)}
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{insight.type}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">{insight.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.message}</p>
                                    </div>
                                    <div className="flex items-center gap-4 pt-1">
                                        <p className="text-[11px] font-bold text-foreground">Impact: <span className="text-primary">{insight.impact}</span></p>
                                        <Link href={insight.action_link} className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                                            View strategy <ChevronRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-2 bg-muted rounded-md opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Sparkles size={16} className="text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Risk Heatmap */}
                    <div className="md:col-span-1 pt-6 border-t border-border mt-4">
                        <h3 className="text-sm font-semibold text-foreground">Health Matrix</h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            Customer segments mapped by their current churn probability.
                        </p>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-border mt-4">
                        <div className="bg-white dark:bg-card border border-border shadow-sm rounded-lg overflow-hidden">
                            <div className="grid grid-cols-4 divide-x divide-border">
                                {Object.entries(predictive.risk_distribution || {}).map(([level, count]) => (
                                    <div key={level} className="p-6 text-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{level}</p>
                                        <p className="text-xl font-bold text-foreground">{count}</p>
                                        <div className={`h-1 w-12 mx-auto mt-3 rounded-full ${
                                            level === 'Safe' ? 'bg-emerald-500' :
                                            level === 'Warning' ? 'bg-amber-400' :
                                            level === 'High' ? 'bg-orange-500' : 'bg-rose-600'
                                        }`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white">
                                    <Rocket size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-900 leading-tight">Gemini ROI Strategy</p>
                                    <p className="text-xs text-blue-700 mt-0.5">Generate a quarterly retention plan based on your CDP data.</p>
                                </div>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6 text-xs font-bold">
                                Upgrade to Pro
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AiInsightsDashboard;
