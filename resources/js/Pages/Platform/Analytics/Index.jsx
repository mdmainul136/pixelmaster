import React from "react";
import { Head } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import { BarChart3, Shield, Info, AlertTriangle, ExternalLink, RefreshCw, Database } from "lucide-react";

export default function PlatformAnalyticsPage({ analytics, is_global }) {
  return (
    <PlatformLayout>
      <Head title="Platform Admin Analytics | PixelMaster" />

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Global Analytics</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Master Business Intelligence dashboard aggregating raw tracking data across all tenants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Refresh Data
            </button>
            <a 
              href={analytics?.url || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Open in Metabase <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Global Access Warning */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-4 items-start">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Raw Level Data Access</h4>
            <p className="text-xs text-indigo-800/70 leading-relaxed">
              You are currently viewing a **Global Master Dashboard**. This view is not restricted by tenant context and 
              provides access to the raw ClickHouse event stream. Use this for macro-level system auditing, 
              cross-tenant performance comparison, and high-level business intelligence.
            </p>
          </div>
        </div>

        {/* Metabase IFrame Container */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm min-h-[85vh] flex flex-col relative group">
          {analytics?.full_embed ? (
            <iframe
              src={analytics.full_embed}
              frameBorder="0"
              width="100%"
              height="900"
              allowTransparency
              className="w-full flex-grow rounded-2xl"
              title="Global Platform Analytics"
            ></iframe>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20">
              <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Analytics Not Configured</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                The global admin dashboard has not been fully configured in the environment settings. 
                Please ensure <code>METABASE_ADMIN_DASHBOARD_ID</code> and <code>METABASE_EMBED_SECRET</code> are set.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="/platform/settings"
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Configure Settings
                </a>
              </div>
            </div>
          )}

          {/* Overlay Info for Admins */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <div className="rounded-xl bg-black/80 backdrop-blur-md p-3 border border-white/10 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-indigo-400" />
                <span className="text-[11px] font-medium text-white/70">Source: ClickHouse Master (Global)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-mono text-emerald-400">Live Inactive Filters: None</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-2 justify-center text-muted-foreground opacity-60">
          <Info className="h-3.5 w-3.5" />
          <p className="text-[11px]">Authorized personnel only. All access to global analytics is logged for auditing purposes.</p>
        </div>
      </div>
    </PlatformLayout>
  );
}
