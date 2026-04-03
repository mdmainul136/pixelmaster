import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import {
  BarChart3, Settings, Shield, Zap, Info, Lightbulb,
  ExternalLink, CheckCircle2, Server, Database, Lock,
  TrendingUp, Activity, ArrowRight, Share2, Eye, AlertTriangle,
} from "lucide-react";

/* ─── Reusable UI ───────────────────────────────────────── */

const Section = ({ id, icon: Icon, color, title, badge, subtitle, children }) => (
  <div id={id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden scroll-mt-6">
    <div className={`flex items-start gap-4 px-8 py-6 border-b border-white/10 ${color}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 mt-0.5">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {badge && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-8 py-7 text-slate-300">{children}</div>
  </div>
);

const Callout = ({ icon: Icon = Info, color = "blue", title, children }) => {
  const palette = { blue: "bg-blue-500/10 border-blue-500/20", amber: "bg-amber-500/10 border-amber-500/20", green: "bg-emerald-500/10 border-emerald-500/20", red: "bg-red-500/10 border-red-500/20" };
  const ic = { blue: "text-blue-400", amber: "text-amber-400", green: "text-emerald-400", red: "text-red-400" };
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${palette[color]}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${ic[color]}`} />
      <div>
        {title && <p className="text-xs font-bold text-white mb-1">{title}</p>}
        <p className="text-xs text-slate-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
};

const CodeBlock = ({ lang, children }) => (
  <div className="relative group">
    <div className="absolute right-4 top-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">{lang}</div>
    <pre className="rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  </div>
);

const Step = ({ num, title, simple, technical, children, warn }) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-sm font-black text-white">
        {num}
      </div>
      <div className="w-px grow bg-gradient-to-b from-white/10 to-transparent my-2" />
    </div>
    <div className="pb-8 min-w-0">
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <div className="rounded-lg bg-white/3 border border-white/5 p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Simple Flow</p>
          <p className="text-xs text-slate-400 leading-relaxed">{simple}</p>
        </div>
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">Technical Detail</p>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">{technical}</p>
        </div>
      </div>
      {warn && (
        <div className="flex items-start gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 p-2.5 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-orange-200/70 italic leading-relaxed">{warn}</p>
        </div>
      )}
      {children}
    </div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────── */

export default function MetabaseDocsPage() {
  const toc = [
    { id: "what-is",       label: "📊 What is Metabase Integration?" },
    { id: "flow",          label: "🚀 Provisioning Flow" },
    { id: "security",      label: "🔒 Signed Embeds (JWT)" },
    { id: "templates",     label: "📑 Dashboard Templates" },
    { id: "trouble",       label: "🛠️ Troubleshooting" },
  ];

  return (
    <PlatformLayout>
      <Head title="Metabase Analytics Docs | PixelMaster Platform" />

      {/* ── Dark canvas ── */}
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-full" style={{ background: 'hsl(222,47%,8%)' }}>
      <div className="p-4 sm:p-6 lg:p-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(222,47%,11%)] to-slate-900 border border-white/10 p-10 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 30%, hsl(200,80%,50%) 0%, transparent 50%), radial-gradient(circle at 30% 70%, hsl(140,84%,39%) 0%, transparent 40%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/30 px-4 py-1.5 mb-5">
            <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Enterprise Analytics · Metabase Integration</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            Automated Metabase Dashboards<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Zero-Touch Enterprise Reporting
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-6">
            Explore how PixelMaster auto-provisions high-performance ClickHouse dashboards for every tenant. 
            From session acquisition to signed iFrame embeds, we provide secure, real-time analytics at scale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[230px_1fr] gap-8">

        {/* ToC */}
        <div className="hidden xl:block">
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">On this page</p>
            <nav className="space-y-0.5">
              {toc.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 min-w-0">

          {/* 1 — What is it */}
          <Section id="what-is" icon={Lightbulb} title="What is Metabase Integration?"
            subtitle="Business Intelligence automated at the infrastructure layer"
            color="bg-gradient-to-r from-blue-600/30 to-cyan-500/20">

            <Callout color="blue" title="The Problem we solve">
              Creating a custom analytics UI for each tenant is slow and expensive. 
              Writing complex ClickHouse aggregation queries manually for every new report is error-prone. 
              <strong className="text-white"> Metabase</strong> solves this by providing a powerful, visual query builder that can be 
              cloned and embedded securely.
            </Callout>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              {[
                { icon: Share2, color: "text-blue-400", title: "Auto-Cloning", body: "Every time a new container is deployed, we clone a master template dashboard automatically." },
                { icon: Database, color: "text-emerald-400", title: "ClickHouse Native", body: "Queries run directly on our analytics warehouse with sub-second response times." },
                { icon: Lock, color: "text-purple-400", title: "White-Label Embeds", body: "Users see the dashboard directly in our platform via signed iFrames — no separate login." },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <Icon className={`h-5 w-5 mb-2 ${color}`} />
                  <p className="text-xs font-bold text-white mb-1.5">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 2 — Provisioning Flow */}
          <Section id="flow" icon={Activity} title="Auto-Provisioning Workflow"
            badge="Infrastructure Layer" subtitle="How a dashboard is born"
            color="bg-gradient-to-r from-emerald-600/30 to-teal-500/20">

            <div className="space-y-5">
              <Step num="1" title="Acquire Admin Session"
                simple="We authenticate with Metabase using admin credentials set in our environment."
                technical="MetabaseDashboardService::getToken() sends admin email/password to /api/session.">
                <CodeBlock lang="bash">{`POST /api/session
Body: { "username": "admin@pixelmaster.io", "password": "..." }
Returns: "X-Metabase-Session" Token`}</CodeBlock>
              </Step>

              <Step num="2" title="Ensure Data Source"
                simple="We make sure the tenant's specific ClickHouse database is registered as a Data Source in Metabase."
                technical="Service checks /api/database. If missing, registers ClickHouse under tracking_{tenant_id}.">
                <CodeBlock lang="php">{`// app/Modules/Tracking/Services/MetabaseDashboardService.php
$this->ensureClickHouseDatabase($token, $container->tenant_id);`}</CodeBlock>
              </Step>

              <Step num="3" title="Deep-Clone Template"
                simple="We clone the sGTM Master Template dashboard so the client gets a fresh copy they can customize later if needed."
                technical="POST /api/dashboard/{id}/copy with is_deep_copy=true. Clones dashboard + all associated questions.">
                <CodeBlock lang="bash">{`POST /api/dashboard/1/copy
Body: { "name": "sGTM Dashboard - Acme Store", "is_deep_copy": true }`}</CodeBlock>
              </Step>

              <Step num="4" title="Inject Container Filter"
                simple="We globally lock all questions on the new dashboard to only show data for THIS specific container ID."
                technical="Updates dashboard parameters to set container_id default value and hides it from the UI.">
                <CodeBlock lang="json">{`// Dashboard Parameters Update
{
  "parameters": [{
    "id": "container_filter", 
    "slug": "container_id", 
    "default": 142
  }]
}`}</CodeBlock>
              </Step>
            </div>
          </Section>

          {/* 3 — Security */}
          <Section id="security" icon={Shield} title="Signed Embeds (JWT Security)"
            badge="Zero Leakage" subtitle="Ensuring multi-tenant data isolation in iframes"
            color="bg-gradient-to-r from-purple-600/30 to-blue-600/20">

            <Callout color="amber" icon={Lock} title="No public access">
              Metabase dashboards are NOT public. They are only accessible via a <strong className="text-white">signed JWT token</strong> 
              that expires. Even if an attacker finds the iFrame URL, they cannot see any data without a valid signature from our backend.
            </Callout>

            <p className="text-sm text-slate-400 mt-5 mb-4 leading-relaxed">
              Our `MetabaseDashboardService` signs the embed request using an HS256 algorithm with our `METABASE_EMBED_SECRET`.
            </p>

            <CodeBlock lang="php">{`// generateEmbedToken() logic
$payload = [
  'resource' => ['dashboard' => $dashboardId],
  'params'   => ['container_id' => $containerId],
  'exp'      => time() + (3600 * 24) // 24 hour expiry
];

return JWT::encode($payload, env('METABASE_EMBED_SECRET'), 'HS256');`}</CodeBlock>

            <div className="mt-4">
              <Callout color="green" title="Multi-tenant guarantee">
                The <code className="text-white bg-black/30 px-1 rounded">container_id</code> parameter is 
                <strong className="text-white"> "Locked"</strong> in the signature. The user cannot change 
                the ID in the URL to see another client's data — the signature would become invalid.
              </Callout>
            </div>
          </Section>

          {/* 4 — Templates */}
          <Section id="templates" icon={Share2} title="Master Dashboard Templates"
            badge="Managed" subtitle="The blueprint for client analytics"
            color="bg-gradient-to-r from-orange-600/30 to-amber-500/20">

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-sm font-bold text-white uppercase tracking-wider">Default Questions included:</p>
                <div className="space-y-2">
                  {[
                    ["Total Events (24h)", "Big number format"],
                    ["Processed vs Dropped", "Donut chart"],
                    ["Conversion Attribution", "Funnel visualization"],
                    ["Top Event Sources", "Bar chart"],
                    ["Hourly Volume Trend", "Area chart"],
                  ].map(([title, format]) => (
                    <div key={title} className="flex items-center gap-2 rounded-lg border border-white/10 p-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-white">{title}</p>
                        <p className="text-[11px] text-slate-500">{format}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-white uppercase tracking-wider">How to update templates:</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    To update dashboards for all NEW clients, simply edit the <strong className="text-white">Master Dashboard (ID #1)</strong> directly in Metabase.
                  </p>
                  <Callout color="blue">
                    Updating the master template does NOT update existing client dashboards. It only affects containers provisioned AFTER the change.
                  </Callout>
                </div>
              </div>
            </div>
          </Section>

          {/* 5 — Troubleshooting */}
          <Section id="trouble" icon={Settings} title="Metabase Troubleshooting"
            badge="SRE Guide" subtitle="Common issues and resolutions"
            color="bg-gradient-to-r from-slate-600/30 to-slate-500/20">

            <div className="space-y-3">
              {[
                { 
                  q: "Dashboard 'Refused to Connect' in iframe", 
                  a: "Check if 'Embedding in other Applications' is enabled in Metabase Admin → Settings → Embedding. Also ensure Allowed Origins matches our platform URL." 
                },
                { 
                  q: "Dashboard renders but says 'No Data'", 
                  a: "Verify the ClickHouse database tracking_{tenant_id} exists on the ClickHouse server and the table event_logs has data. Check if the container_id filter matches." 
                },
                { 
                  q: "Provisioning Job fails continuously", 
                  a: "Check the METABASE_ADMIN_PASSWORD in .env. Verify Metabase API is reachable from the Laravel server (docker network or public URL)." 
                },
                { 
                  q: "JWT signature error", 
                  a: "The METABASE_EMBED_SECRET must match EXACTLY between Metabase Admin settings and our .env file. Regenerating the secret in Metabase will break all existing embeds until .env is updated." 
                },
              ].map(({ q, a }, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-1.5 text-white font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> {q}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="h-4 w-4 text-slate-600" />
          <p className="text-xs text-slate-500">PixelMaster Infrastructure · Metabase Docs · iFrame Embedding v2.1</p>
        </div>
        <a href="mailto:infra@pixelmaster.io"
          className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
          infra@pixelmaster.io
        </a>
      </div>

      </div>{/* end dark inner padding */}
      </div>{/* end dark canvas */}
    </PlatformLayout>
  );
}
