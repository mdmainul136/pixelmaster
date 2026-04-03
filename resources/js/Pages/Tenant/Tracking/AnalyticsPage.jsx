import React from "react";
import { Head } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { 
  BarChart3, RefreshCw, ExternalLink, Shield, 
  Clock, Info, AlertTriangle, Activity 
} from "lucide-react";

export default function AnalyticsPage({ analytics, provisioning, type, containers, active_container_id }) {
  
  const handleTenantChange = (e) => {
    window.location.href = `/analytics/${type || 'overview'}?tenant_id=${e.target.value}`;
  };

  const title = type === 'realtime' ? 'Real-time Stream' : 'Analytics Overview';

  return (
    <DashboardLayout>
      <Head title="Real-time Analytics | PixelMaster" />

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                {title}
              </h1>
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1 shadow-sm">
                <a 
                  href="/analytics/overview" 
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${type !== 'realtime' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  OVERVIEW
                </a>
                <a 
                  href="/analytics/realtime" 
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${type === 'realtime' ? 'bg-amber-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  REAL-TIME
                </a>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {type === 'realtime' ? 'Live event stream and active user sessions.' : 'Deep-dive business intelligence and historical performance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Switcher */}
            {containers && containers.length > 0 && (
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-border/60 shadow-sm transition-all hover:border-indigo-500/40 group">
                <BarChart3 className="absolute right-0 h-4 w-4 hidden group-hover:block" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-2">Workspace:</span>
                <select 
                  className="bg-transparent border-none text-sm font-bold rounded-lg px-2 py-1.5 focus:ring-0 outline-none cursor-pointer"
                  value={active_container_id || ""}
                  onChange={handleTenantChange}
                >
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {analytics?.url && (
              <a 
                href={analytics.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
              >
                Full Screen <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex gap-4 items-start">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-primary-foreground/80 mb-1">Authenticated First-Party Access</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are viewing a secure, signed enterprise reporting view. Your data is isolated in a dedicated ClickHouse 
              warehouse and served via HS256 JWT encryption for maximum security and performance.
            </p>
          </div>
        </div>

        {/* Main Reporting View */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm min-h-[85vh] flex flex-col relative group">
          {analytics?.full_embed ? (
            <iframe
              src={analytics.full_embed}
              frameBorder="0"
              width="100%"
              height="800"
              allowTransparency
              className="w-full flex-grow rounded-2xl"
              title="Enterprise Analytics"
            ></iframe>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-muted/20">
              {provisioning ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Provisioning Your Dashboard</h2>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                    Our platform is currently setting up a dedicated Metabase instance for your workspace. 
                    This usually takes 1-2 minutes.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-white border border-border/60 rounded-xl">
                    <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground">Est. wait: less than 1 minute</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">No Tracking Data Found</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    To activate analytics, please ensure your tracking container is live and receiving events. 
                    The dashboard will automatically provision once the first event is processed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href="/containers"
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Activity className="h-4 w-4" /> Go to Containers
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-2 justify-center text-muted-foreground opacity-60">
          <Info className="h-3.5 w-3.5" />
          <p className="text-[10px]">Data updates in real-time as events are processed via Kafka. Last sync: Just now.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
