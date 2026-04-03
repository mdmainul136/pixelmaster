import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import {
  Terminal, Clock, Shield, Database, Zap, Radio,
  CheckCircle2, ChevronDown, ChevronRight, Activity,
  AlertTriangle, Info, Lightbulb, RefreshCcw, Server,
  BarChart3, Globe, Package, ArrowRight, Cpu, Eye,
  TrendingUp, Lock, BookOpen, Code2, Settings,
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
  const palette = {
    blue:   "bg-blue-500/10 border-blue-500/20",
    amber:  "bg-amber-500/10 border-amber-500/20",
    green:  "bg-emerald-500/10 border-emerald-500/20",
    purple: "bg-purple-500/10 border-purple-500/20",
    red:    "bg-red-500/10 border-red-500/20",
  };
  const iconColor = { blue:"text-blue-400", amber:"text-amber-400", green:"text-emerald-400", purple:"text-purple-400", red:"text-red-400" };
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${palette[color]}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor[color]}`} />
      <div>
        {title && <p className="text-xs font-bold text-white mb-1">{title}</p>}
        <p className="text-xs text-slate-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
};

const CodeBlock = ({ children, lang = "bash" }) => (
  <div className="rounded-xl bg-[hsl(222,47%,5%)] border border-white/10 overflow-hidden my-3">
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 bg-white/3">
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang}</span>
      <Code2 className="h-3 w-3 text-slate-700" />
    </div>
    <pre className="px-5 py-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
  </div>
);

const Step = ({ num, title, simple, technical, warn, children }) => (
  <div className="flex gap-4 items-start">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 mt-0.5">{num}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white mb-1">{title}</p>
      {simple && <p className="text-xs text-slate-400 leading-relaxed mb-2">{simple}</p>}
      {technical && <p className="text-xs text-slate-500 leading-relaxed italic mb-2">⚙️ {technical}</p>}
      {warn && <Callout color="amber" icon={AlertTriangle}>{warn}</Callout>}
      {children}
    </div>
  </div>
);

const CmdCard = ({ cmd, schedule, desc, value, icon: Icon = Terminal }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-colors">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
        <Icon className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="min-w-0 flex-1">
        <code className="text-[11px] font-mono text-emerald-400 bg-black/30 px-2 py-0.5 rounded break-all">{cmd}</code>
        {schedule && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="h-3 w-3 text-slate-600" />
            <span className="text-[10px] text-slate-500 font-mono">{schedule}</span>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{desc}</p>
        {value && (
          <div className="mt-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5">
            <p className="text-[10px] text-emerald-400"><span className="font-bold">Business Value: </span>{value}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const AccordionItem = ({ q, simple, technical }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-white hover:bg-white/5 transition-colors">
        <span>{q}</span>
        {open
          ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-white/10 pt-4 space-y-3">
          <div className="flex gap-2 items-start">
            <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 uppercase shrink-0 mt-0.5">Plain</span>
            <p className="text-xs text-slate-400 leading-relaxed">{simple}</p>
          </div>
          {technical && (
            <div className="flex gap-2 items-start">
              <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase shrink-0 mt-0.5">Tech</span>
              <p className="text-xs text-slate-400 leading-relaxed">{technical}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────── */

export default function ProvisioningDocsPage() {
  const toc = [
    { id: "what-is",       label: "🤔 What is Provisioning?" },
    { id: "new-tenant",    label: "🚀 Onboarding a New Client" },
    { id: "commands",      label: "⚙️ Artisan Commands" },
    { id: "scheduler",     label: "🕐 Automated Scheduler" },
    { id: "supervisor",    label: "🔄 Supervisor (Kafka Daemon)" },
    { id: "sgtm-docker",   label: "🐳 sGTM Container Lifecycle" },
    { id: "data-retention",label: "🗑️ Log Retention Policy" },
    { id: "monitoring",    label: "📡 Auto-Healing Monitor" },
    { id: "checklist",     label: "✅ Production Checklist" },
    { id: "faq",           label: "❓ FAQ" },
  ];

  return (
    <PlatformLayout>
      <Head title="Provisioning Docs | PixelMaster Platform" />
      {/* ── Dark canvas — keeps glassmorphism correct inside white layout ── */}
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-full" style={{ background: 'hsl(222,47%,8%)' }}>
      <div className="p-4 sm:p-6 lg:p-8">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(222,47%,11%)] to-slate-900 border border-white/10 p-10 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(142,70%,45%) 0%, transparent 50%), radial-gradient(circle at 20% 20%, hsl(222,70%,55%) 0%, transparent 40%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 mb-5">
            <Settings className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Platform Engineering Docs · Provisioning</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            Automating Enterprise<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Tracking Provisioning
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-6">
            Everything that happens <em>automatically</em> when a new client signs up — database setup, Docker containers,
            background workers, schedulers, and health monitors. Written for both business owners and engineers.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            {[
              { v: "One",     l: "command to onboard",  c: "text-emerald-400" },
              { v: "15+",     l: "automated schedulers", c: "text-yellow-400" },
              { v: "24/7",    l: "Kafka consumer daemon",c: "text-blue-400" },
              { v: "Auto",    l: "self-healing containers",c:"text-purple-400"},
            ].map(({ v, l, c }) => (
              <div key={l} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className={`text-2xl font-black ${c}`}>{v}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">{l}</p>
              </div>
            ))}
          </div>
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

          {/* 1 — What is Provisioning */}
          <Section id="what-is" icon={Lightbulb} title="What is Tracking Provisioning?"
            subtitle="For business owners and new team members"
            color="bg-gradient-to-r from-blue-600/30 to-cyan-500/20">

            <Callout color="blue" title="Simple definition">
              Provisioning means <strong className="text-white">setting everything up for a new client automatically</strong>, so
              they can start tracking events within seconds of signing up — without any engineer manually touching a server.
            </Callout>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              {[
                { icon: Database, color: "text-cyan-400",   title: "Database Setup",     body: "A private MySQL database and a private ClickHouse analytics warehouse are both created automatically for each new tenant." },
                { icon: Server,   color: "text-orange-400", title: "Docker Container",   body: "A real Google Tag Manager server-side container spins up on our infrastructure under the client's custom domain." },
                { icon: Clock,    color: "text-purple-400", title: "Scheduled Workers",  body: "15+ automated background jobs start monitoring, cleaning, alerting, and forwarding events — all without manual intervention." },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <Icon className={`h-5 w-5 mb-2 ${color}`} />
                  <p className="text-xs font-bold text-white mb-1.5">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Callout color="green" title="Business value">
                Manual provisioning at enterprise scale would require an engineer for 30-60 minutes per client. With PixelMaster's automated provisioning,
                a new client is <strong className="text-white">fully operational in under 60 seconds</strong>, with zero engineering intervention.
              </Callout>
            </div>
          </Section>

          {/* 2 — Onboarding a New Tenant */}
          <Section id="new-tenant" icon={ArrowRight} title="Onboarding a New Client — Step by Step"
            badge="Complete Flow" subtitle="From signup to first event tracked"
            color="bg-gradient-to-r from-emerald-600/30 to-teal-500/20">

            <div className="space-y-5">
              <Step num="1" title="Client signs up and pays"
                simple="The client registers on the platform and chooses a plan (Starter, Growth, Pro). Their account is created in the central database."
                technical="Tenant record inserted into central.tenants table. TenantSubscription created. Webhook fires to provisioning pipeline.">
                <CodeBlock lang="database">{`central.tenants
  id: 'acme-store'  |  plan: 'pro'  |  status: 'pending'
  admin_email: 'owner@acme.com'  |  created_at: now()`}</CodeBlock>
              </Step>

              <Step num="2" title="MySQL tenant database is created"
                simple="A completely separate database is created just for this client — like giving them their own filing room. No other client can access it."
                technical="Stancl/Tenancy runs tenant migration. Creates database tenant_acme_store with all schema tables.">
                <CodeBlock lang="bash">{`php artisan tenants:migrate --tenants=acme-store
# Creates: mysql://tenant_acme_store.*
# Runs all migrations inside the isolated DB`}</CodeBlock>
              </Step>

              <Step num="3" title="ClickHouse analytics database is provisioned"
                simple="A high-speed analytics warehouse is created for this client. This is what powers their reports — totals, trends, conversion rates."
                technical="ClickHouseMigrateCommand creates tracking_acme_store database with MergeTree event_logs table.">
                <CodeBlock lang="bash">{`php artisan tracking:clickhouse-migrate
# Provisions: tracking_acme_store database in ClickHouse
# Creates MergeTree table partitioned by month
# Idempotent — safe to run multiple times`}</CodeBlock>
              </Step>

              <Step num="4" title="GTM container is registered"
                simple="The client's GTM Container ID (e.g. GTM-ABC123) is linked to their account, their domain is whitelisted, and destinations (Facebook CAPI, GA4, etc.) are configured."
                technical="TrackingContainer record created. EnforceContainerOrigin whitelist seeded with domain. Destinations populated from plan template.">
                <CodeBlock lang="database">{`tracking_containers
  container_id: 'GTM-ABC123'
  tenant_id:    'acme-store'
  domain:       'acme.com'
  is_active:     true
  docker_status: 'pending'`}</CodeBlock>
              </Step>

              <Step num="5" title="sGTM Docker container is deployed"
                simple="A real Google Tag Manager server spins up on our cloud infrastructure, assigned to the client's custom subdomain (e.g. gtm.acme.com). HTTPS is configured automatically."
                technical="sgtm:deploy command triggers DockerOrchestratorService → docker run → nginx config → Let's Encrypt SSL cert."
                warn="The domain must resolve to our server IP before SSL provisioning. Clients must add a CNAME DNS record first.">
                <CodeBlock lang="bash">{`php artisan sgtm:deploy GTM-ABC123 --domain=gtm.acme.com
# Spins up Docker container
# Configures Nginx reverse proxy
# Requests Let's Encrypt SSL certificate
# Updates docker_status → 'running'`}</CodeBlock>
              </Step>

              <Step num="6" title="First event is tracked — pipeline is live"
                simple="The client puts the snippet on their website. When a visitor arrives, the event flows through Kafka, is stored in ClickHouse, the billing counter ticks, and the event is forwarded to Facebook/GA4."
                technical="POST /api/tracking/plugin/events → KafkaProducerService → tracking-events topic → ConsumeTrackingEventsCommand daemon → ClickHouse bulk insert → ForwardToDestinationJob.">
                <Callout color="green">
                  The Kafka consumer daemon is <strong className="text-white">always running</strong> via Supervisor.
                  There is no manual step needed — events start flowing the moment the snippet is on the website.
                </Callout>
              </Step>
            </div>
          </Section>

          {/* 3 — Commands Reference */}
          <Section id="commands" icon={Terminal} title="All Artisan Commands — Reference"
            badge="Developer Reference" subtitle="Every command, what it does, and why it matters"
            color="bg-gradient-to-r from-slate-600/30 to-slate-500/20">

            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              These commands are the building blocks of the provisioning system. Some are run once per client,
              others run continuously on a schedule. All are safe to re-run (idempotent where noted).
            </p>

            <div className="space-y-4">
              <p className="text-xs font-bold text-white uppercase tracking-wider">📦 Provisioning Commands (run once per client)</p>
              <div className="space-y-3">
                <CmdCard icon={Database}
                  cmd="php artisan tracking:clickhouse-migrate"
                  desc="Iterates all active tenants and creates an isolated ClickHouse analytics database (tracking_{tenant_id}) for each. Creates partitioned MergeTree tables optimised for high-speed aggregation. Idempotent — CREATE IF NOT EXISTS."
                  value="Every client gets a private analytics warehouse. Reports are 100x faster than MySQL. Data is isolated — one client cannot see another's analytics." />

                <CmdCard icon={Server}
                  cmd="php artisan sgtm:deploy {GTM-ID} --domain={domain}"
                  desc="Deploys a real Google Tag Manager server-side container in Docker for the given container ID. Provisions Nginx reverse proxy and requests a Let's Encrypt SSL certificate for the custom domain."
                  value="Clients get a first-party tracking endpoint on their own domain. Bypasses ad-blockers. Events that browsers would have blocked now reach ad platforms successfully." />

                <CmdCard icon={Globe}
                  cmd="php artisan sgtm:ssl {domain}"
                  desc="Requests or renews a Let's Encrypt TLS certificate for a container's custom domain via Certbot. Run automatically on deploy, or manually if a certificate expires."
                  value="HTTPS is non-negotiable for modern tracking. Browsers refuse to send data to non-secure endpoints. This command ensures every client endpoint is always HTTPS." />

                <CmdCard icon={Eye}
                  cmd="php artisan sgtm:list"
                  desc="Displays a table of all tracking containers, their Docker status, assigned domain, port, and active state. Useful for auditing the fleet."
                  value="Operators can see at a glance which containers are running, stopped, or pending — without accessing the Docker host directly." />

                <CmdCard icon={RefreshCcw}
                  cmd="php artisan sgtm:update-domain {GTM-ID} {new-domain}"
                  desc="Updates the Nginx configuration and database record for a container's custom domain without stopping it. Useful when a client migrates to a new subdomain."
                  value="Zero-downtime domain migrations. Clients can rebrand without losing tracking history." />
              </div>

              <p className="text-xs font-bold text-white uppercase tracking-wider mt-6">🔄 Worker Commands (run continuously)</p>
              <div className="space-y-3">
                <CmdCard icon={Radio}
                  cmd="php artisan tracking:kafka-consume"
                  desc="The core Kafka consumer daemon. Runs in a blocking loop, reading events from the tracking-events topic, switching tenant context, writing to ClickHouse + MySQL, incrementing billing counters, and dispatching forwarding jobs. Must be managed by Supervisor."
                  value="This is the heart of the pipeline. Without it, events pile up in Kafka but are never processed or forwarded to ad platforms."
                  schedule="Run continuously via Supervisor (not the scheduler)" />

                <CmdCard icon={Cpu}
                  cmd="php artisan tracking:process-retry-queue --batch=50"
                  desc="Reads the Dead Letter Queue (tracking_dlq table) for events past their backoff window and re-attempts processing them through the full pipeline. Processes up to 50 at a time."
                  value="Zero data loss guarantee. Events that failed due to a temporary ClickHouse outage are automatically recovered without manual intervention."
                  schedule="Every 1 minute" />
              </div>

              <p className="text-xs font-bold text-white uppercase tracking-wider mt-6">📊 Ad Platform Drain Queues</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { cmd: "tracking:drain-meta-queue --limit=500",      sch: "Every 5 min",  note: "Meta CAPI (180 req/hr rate limit)" },
                  { cmd: "tracking:drain-ga4-queue --limit=200",       sch: "Every 1 min",  note: "GA4 Measurement Protocol (10 eps)" },
                  { cmd: "tracking:drain-tiktok-queue --limit=250",    sch: "Every 1 min",  note: "TikTok Events API (900 req/min)" },
                  { cmd: "tracking:drain-snap-queue --limit=500",      sch: "Every 1 min",  note: "Snapchat CAPI (2000 req/min)" },
                  { cmd: "tracking:drain-linkedin-queue --limit=200",  sch: "Every 1 min",  note: "LinkedIn Conversions API" },
                  { cmd: "tracking:drain-pinterest-queue --limit=100", sch: "Every 1 min",  note: "Pinterest Conversions (120/min)" },
                  { cmd: "tracking:drain-gads-queue --limit=200",      sch: "Hourly",       note: "Google Ads (5000 req/day quota)" },
                  { cmd: "tracking:drain-twitter-queue --limit=200",   sch: "Every 1 min",  note: "Twitter/X Conversions API" },
                  { cmd: "tracking:drain-webhook-queue --limit=500",   sch: "Every 1 min",  note: "Generic webhook destinations" },
                ].map(({ cmd, sch, note }) => (
                  <div key={cmd} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <code className="text-[10px] text-emerald-400 font-mono block mb-1 break-all">{cmd}</code>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-600" />
                      <span className="text-[10px] text-slate-500">{sch}</span>
                      <span className="text-[10px] text-slate-600">· {note}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold text-white uppercase tracking-wider mt-6">🧹 Maintenance Commands</p>
              <div className="space-y-3">
                <CmdCard icon={RadioIcon => RefreshCcw}
                  cmd="php artisan sgtm:prune-logs {--dry-run}"
                  desc="Deletes old tracking event logs from each tenant's MySQL database according to their plan's retention tier: Starter=3 days, Growth=10 days, Pro=30 days. Use --dry-run to preview without deleting."
                  value="Prevents databases from growing unboundedly. Keeps storage costs predictable. GDPR compliance — data is not held longer than necessary."
                  schedule="Recommend: daily at 04:00 AM" />

                <CmdCard icon={Activity}
                  cmd="php artisan tracking:expire-dlq --days=7 --purge"
                  desc="Marks Dead Letter Queue entries older than 7 days as 'expired' and purges them. Prevents the DLQ table from growing indefinitely for events that have no chance of recovery."
                  value="Keeps the DLQ table lean. Expired events are logged to audit trail before deletion."
                  schedule="Daily at 02:30 AM" />

                <CmdCard icon={Shield}
                  cmd="php artisan tracking:purge-consent"
                  desc="Removes consent records for users who have withdrawn consent or whose records have exceeded the retention window. Required for GDPR Article 17 (Right to Erasure) compliance."
                  value="Legal requirement. Avoids GDPR fines. Demonstrates to clients that the platform handles their customers' data responsibly."
                  schedule="Daily at 03:30 AM" />

                <CmdCard icon={TrendingUp}
                  cmd="php artisan tracking:check-billing-alerts"
                  desc="Checks each tenant's Redis billing counter against their plan quota. Sends email + in-app notification at 80% and 100% usage. Monthly reset flag clears on the 1st of each month."
                  value="Proactive client communication. Clients upgrade before hitting limits, reducing support tickets and churn."
                  schedule="Daily at 08:30 AM · Monthly reset on 1st at 00:05" />

                <CmdCard icon={BarChart3}
                  cmd="php artisan tracking:health-report --alert-only"
                  desc="Generates a health report for all active ad platform destination channels. Checks success rate, latency, and error counts. With --alert-only, only sends notifications if a channel is degraded."
                  value="Operators are alerted before clients notice a problem. Mean time to detection (MTTD) drops from hours to minutes."
                  schedule="Every 15 minutes" />
              </div>
            </div>
          </Section>

          {/* 4 — Scheduler */}
          <Section id="scheduler" icon={Clock} title="Automated Scheduler — Full Timeline"
            badge="Cron Jobs" subtitle="What happens automatically and when"
            color="bg-gradient-to-r from-indigo-600/30 to-violet-500/20">

            <Callout color="blue" title="How the scheduler works">
              Laravel's scheduler reads <code className="text-white">routes/console.php</code> and runs one master cron entry every minute:
              <code className="text-white ml-2">* * * * * php artisan schedule:run</code>. Laravel then decides which commands
              are due and executes them. No manual crontab entries needed per command.
            </Callout>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-slate-500 font-bold uppercase tracking-wider">Time</th>
                    <th className="text-left py-2 pr-4 text-slate-500 font-bold uppercase tracking-wider">Command</th>
                    <th className="text-left py-2 text-slate-500 font-bold uppercase tracking-wider">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["Every minute",     "tracking:process-retry-queue",   "Re-process DLQ failed events"],
                    ["Every minute",     "tracking:drain-ga4-queue",       "Forward buffered GA4 events"],
                    ["Every minute",     "tracking:drain-tiktok-queue",    "Forward buffered TikTok events"],
                    ["Every minute",     "tracking:drain-snap-queue",      "Forward buffered Snapchat events"],
                    ["Every minute",     "tracking:drain-linkedin-queue",  "Forward buffered LinkedIn events"],
                    ["Every minute",     "tracking:drain-twitter-queue",   "Forward buffered Twitter events"],
                    ["Every minute",     "tracking:drain-webhook-queue",   "Forward buffered webhook events"],
                    ["Every 5 minutes",  "sgtm:monitor",                  "Health-check + auto-heal Docker containers"],
                    ["Every 5 minutes",  "tracking:drain-meta-queue",      "Forward buffered Meta CAPI events"],
                    ["Every 5 minutes",  "tracking:monitor-nodes",         "Monitor Docker node capacity"],
                    ["Every 15 minutes", "tracking:health-report",         "Alert on degraded ad platform channels"],
                    ["Hourly",           "tracking:drain-gads-queue",      "Forward buffered Google Ads events"],
                    ["Hourly",           "tenant:collect-db-stats",        "Database usage stats per tenant"],
                    ["00:00 daily",      "BillingEnforcementService",      "Enforce overdue invoices"],
                    ["00:05 daily",      "subscriptions:check",            "Trial → expired, active → past_due"],
                    ["01:00 daily",      "subscriptions:renew",            "Auto-renew expiring subscriptions"],
                    ["02:00 daily",      "tenants:backup",                 "Full database backup all tenants"],
                    ["02:30 daily",      "tracking:expire-dlq",            "Purge DLQ entries >7 days"],
                    ["03:30 daily",      "tracking:purge-consent",         "GDPR right-to-erasure purge"],
                    ["08:00 daily",      "subscriptions:notify-expiry",    "Send renewal warning emails"],
                    ["08:30 daily",      "tracking:check-billing-alerts",  "80% / 100% quota alert emails"],
                    ["1st of month",     "tracking:check-billing-alerts --reset", "Reset monthly alert flags"],
                  ].map(([time, cmd, purpose]) => (
                    <tr key={cmd} className="hover:bg-white/3 transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">{time}</td>
                      <td className="py-2.5 pr-4"><code className="text-[10px] text-emerald-400 bg-black/20 px-1.5 py-0.5 rounded">{cmd}</code></td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 5 — Supervisor */}
          <Section id="supervisor" icon={Cpu} title="Supervisor — Kafka Consumer Daemon"
            badge="Production Setup" subtitle="How the background event processor stays running 24/7 in production"
            color="bg-gradient-to-r from-orange-600/30 to-amber-500/20">

            <Callout color="amber" title="Why Supervisor?">
              The Kafka consumer (<code className="text-white">tracking:kafka-consume</code>) is a long-running blocking process — it never exits.
              If the server restarts or the process crashes, Supervisor automatically restarts it within seconds.
              Without Supervisor, events would pile up in Kafka unprocessed.
            </Callout>

            <p className="text-xs text-slate-400 mt-4 mb-3">
              Create this config file on the production server at <code className="bg-white/10 px-1.5 rounded text-white text-[11px]">/etc/supervisor/conf.d/pixelmaster-tracking.conf</code>:
            </p>

            <CodeBlock lang="ini">{`[program:pixelmaster-kafka-consumer]
command=/usr/bin/php /var/www/pixelmaster/artisan tracking:kafka-consume
directory=/var/www/pixelmaster
autostart=true
autorestart=true
startretries=3
numprocs=1
startsecs=5
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/kafka-consumer.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=5

[program:pixelmaster-queue-worker]
command=/usr/bin/php /var/www/pixelmaster/artisan queue:work redis --sleep=3 --tries=3 --max-jobs=500
directory=/var/www/pixelmaster
autostart=true
autorestart=true
numprocs=2
user=www-data
stdout_logfile=/var/log/supervisor/queue-worker.log`}</CodeBlock>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-white mb-2">Reload Supervisor after config change:</p>
                <CodeBlock lang="bash">{`sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pixelmaster-kafka-consumer`}</CodeBlock>
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-2">Check daemon status:</p>
                <CodeBlock lang="bash">{`sudo supervisorctl status
# pixelmaster-kafka-consumer   RUNNING   pid 12345, uptime 2 days
sudo supervisorctl tail -f pixelmaster-kafka-consumer`}</CodeBlock>
              </div>
            </div>

            <Callout color="green" title="Performance consideration">
              For high-volume tenants (&gt;10M events/day), run <strong className="text-white">multiple consumer instances</strong> with
              different consumer group IDs and separate Kafka partitions. Scale <code className="text-white">numprocs</code> to match partition count.
            </Callout>
          </Section>

          {/* 6 — sGTM Docker lifecycle */}
          <Section id="sgtm-docker" icon={Server} title="sGTM Docker Container Lifecycle"
            subtitle="Full lifecycle: deploy → health-check → auto-heal → stop"
            color="bg-gradient-to-r from-cyan-600/30 to-blue-500/20">

            <div className="space-y-4">
              {[
                {
                  icon: ArrowRight, color: "text-emerald-400",
                  state: "Deploy",
                  cmd: "php artisan sgtm:deploy GTM-XXXX --domain=gtm.client.com",
                  simple: "Spins up a Docker container running the official Google Tag Manager server image on port 8080. Nginx proxies traffic. SSL is issued automatically.",
                  tech: "DockerOrchestratorService::deploy() → docker run -d --name container_GTM-XXXX -e CONTAINER_CONFIG=... → updates docker_container_id + docker_port in DB.",
                },
                {
                  icon: Eye, color: "text-blue-400",
                  state: "Health Check",
                  cmd: "php artisan sgtm:health GTM-XXXX",
                  simple: "Checks if the container is running and responding to HTTP requests. Returns its port, uptime, and HTTP status code.",
                  tech: "DockerOrchestratorService::healthCheck() → docker inspect + HTTP GET /healthz → returns array of status fields.",
                },
                {
                  icon: RefreshCcw, color: "text-yellow-400",
                  state: "Auto-Heal (Monitor)",
                  cmd: "sgtm:monitor  [runs every 5 minutes]",
                  simple: "Every 5 minutes, the monitor checks all active containers. If any are not running, it tries to restart them automatically and logs the incident.",
                  tech: "SgtmMonitorCommand iterates active containers with docker_container_id set. Calls healthCheck(). If docker_status != 'running' → calls deploy() to redeploy.",
                },
                {
                  icon: AlertTriangle, color: "text-orange-400",
                  state: "Domain Update",
                  cmd: "php artisan sgtm:update-domain GTM-XXXX new.domain.com",
                  simple: "Updates the Nginx config and database record for a new domain without container downtime. Useful for client rebrands.",
                  tech: "Rewrites /etc/nginx/sites-enabled/GTM-XXXX.conf → nginx -s reload → updates domain column. Container keeps running on same port.",
                },
                {
                  icon: Lock, color: "text-red-400",
                  state: "Stop",
                  cmd: "php artisan sgtm:stop GTM-XXXX",
                  simple: "Prompts for confirmation, then stops and removes the Docker container. Does not delete the container's data or configuration from PixelMaster.",
                  tech: "docker stop container_GTM-XXXX → docker rm container_GTM-XXXX → updates docker_status = 'stopped'.",
                },
              ].map(({ icon: Icon, color, state, cmd, simple, tech }) => (
                <div key={state} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 mt-0.5">
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-white">{state}</span>
                    </div>
                    <code className="text-[10px] font-mono text-emerald-400 bg-black/30 px-2 py-0.5 rounded block mb-2">{cmd}</code>
                    <p className="text-xs text-slate-400 leading-relaxed mb-1">{simple}</p>
                    <p className="text-[11px] text-slate-500 italic">⚙️ {tech}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 7 — Data Retention */}
          <Section id="data-retention" icon={RefreshCcw} title="Log Retention Policy by Plan"
            subtitle="How long tracking events are kept, and why limits make business sense"
            color="bg-gradient-to-r from-rose-600/30 to-pink-500/20">

            <Callout color="blue" title="Why data retention limits?">
              Storing every event forever would cost enormous amounts of database storage. Retention policies mean each plan tier stores
              only what is needed — keeping costs predictable and GDPR-compliant.
            </Callout>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              {[
                { plan: "Starter", days: 3,  color: "border-slate-500/30 bg-slate-500/5",   badge: "bg-slate-500",  note: "Good for small stores testing the platform." },
                { plan: "Growth",  days: 10, color: "border-blue-500/30 bg-blue-500/5",     badge: "bg-blue-500",   note: "Keeps 10 days for trend analysis and retargeting windows." },
                { plan: "Pro",     days: 30, color: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500", note: "Full 30-day window for attribution and detailed analytics." },
              ].map(({ plan, days, color, badge, note }) => (
                <div key={plan} className={`rounded-xl border ${color} p-5 text-center`}>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${badge}`}>{plan}</span>
                  <p className="text-3xl font-black text-white my-3">{days}</p>
                  <p className="text-xs text-slate-500">days retention</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-white mb-2">Run a dry-run first to preview what would be deleted:</p>
              <CodeBlock lang="bash">{`php artisan sgtm:prune-logs --dry-run
# [tenant_acme_store] Would prune 14,823 logs (tier: starter, retention: 3d)
# [tenant_bigshop]    Would prune 2,100  logs (tier: growth,  retention: 10d)

php artisan sgtm:prune-logs
# Executes deletion — recommended to run at low-traffic hours (04:00 AM)`}</CodeBlock>
            </div>
          </Section>

          {/* 8 — Monitoring */}
          <Section id="monitoring" icon={Activity} title="Auto-Healing Container Monitor"
            subtitle="How PixelMaster detects and recovers from container failures without human intervention"
            color="bg-gradient-to-r from-teal-600/30 to-cyan-500/20">

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-bold text-white mb-3">What the monitor checks:</p>
                <div className="space-y-2">
                  {[
                    ["Docker status", "Is the container process running?"],
                    ["HTTP health endpoint", "Does /healthz return 200?"],
                    ["Port accessibility", "Is the assigned port accepting connections?"],
                    ["DB record sync", "Is docker_status in DB accurate?"],
                  ].map(([check, detail]) => (
                    <div key={check} className="flex items-start gap-2 rounded-lg border border-white/10 p-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-white">{check}</p>
                        <p className="text-[11px] text-slate-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-3">Auto-heal flow:</p>
                <div className="space-y-2">
                  {[
                    { num: "1", t: "Container found not running", c: "text-red-400" },
                    { num: "2", t: "Warning logged to audit trail", c: "text-amber-400" },
                    { num: "3", t: "Re-deploy triggered automatically", c: "text-blue-400" },
                    { num: "4", t: "Docker container restarted", c: "text-blue-400" },
                    { num: "5", t: "DB status updated → 'running'", c: "text-emerald-400" },
                    { num: "6", t: "Incident flagged in platform logs", c: "text-slate-400" },
                  ].map(({ num, t, c }) => (
                    <div key={num} className="flex items-center gap-2 text-xs">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold ${c}`}>{num}</span>
                      <span className="text-slate-400">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 9 — Checklist */}
          <Section id="checklist" icon={CheckCircle2} title="Production Deployment Checklist"
            badge="Go-Live" subtitle="Everything that must be configured before going live"
            color="bg-gradient-to-r from-emerald-600/30 to-green-500/20">

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "🏗️ Infrastructure", items: [
                    "Apache Kafka broker running and reachable",
                    "ClickHouse server running (CLICKHOUSE_ENABLED=true)",
                    "Redis server running and accessible",
                    "Docker daemon running on host",
                    "Nginx installed and configured",
                    "Certbot installed for SSL provisioning",
                  ]
                },
                {
                  title: "⚙️ Application", items: [
                    "php artisan tracking:clickhouse-migrate (run for all tenants)",
                    "Supervisor config installed and reloaded",
                    "kafka-consumer daemon status: RUNNING",
                    "queue:work daemon status: RUNNING",
                    "php artisan schedule:run in crontab (every minute)",
                    "QUEUE_CONNECTION=redis in .env",
                  ]
                },
                {
                  title: "🔒 Security", items: [
                    "EnforceContainerOrigin middleware active on API routes",
                    "Each container has domain whitelist configured",
                    "HTTPS enabled on all container endpoints",
                    "API keys rotated from defaults",
                    "SESSION_SECURE_COOKIE=true in production",
                    "GDPR consent purge schedule active",
                  ]
                },
                {
                  title: "📊 Monitoring", items: [
                    "sgtm:monitor scheduler active (every 5 min)",
                    "tracking:health-report scheduler active (every 15 min)",
                    "tracking:check-billing-alerts active (daily 08:30)",
                    "tracking:process-retry-queue active (every minute)",
                    "Alert email configured in GlobalSettings",
                    "Sentry or similar error tracking connected",
                  ]
                },
              ].map(({ title, items }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold text-white mb-3">{title}</p>
                  <div className="space-y-2">
                    {items.map(item => (
                      <label key={item} className="flex items-start gap-2 cursor-pointer group">
                        <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 10 — FAQ */}
          <Section id="faq" icon={BookOpen} title="Frequently Asked Questions"
            subtitle="Plain English + technical answers"
            color="bg-gradient-to-r from-slate-600/30 to-slate-500/20">
            <div className="space-y-2">
              {[
                {
                  q: "Do I need to run tracking:clickhouse-migrate for every new client?",
                  simple: "No. The command is designed to run once for ALL existing clients, and new clients are provisioned automatically on their first event. The command is idempotent — run it anytime and it will safely add any missing databases.",
                  technical: "ClickHouseService::getActiveDatabase() checks if the tenant DB exists before inserting. Kafka consumer handles on-demand provisioning for new tenants via CREATE DATABASE IF NOT EXISTS on first write.",
                },
                {
                  q: "What happens if the Kafka consumer crashes mid-event?",
                  simple: "Kafka remembers where the worker stopped. When Supervisor restarts the worker, it picks up from exactly where it left off. No event is lost or duplicated because of this.",
                  technical: "junges/laravel-kafka uses consumer group offset commits. The offset is committed only AFTER successful processEvent(). A crash before commit causes the message to be redelivered on restart.",
                },
                {
                  q: "How do I scale the system for 10x more clients?",
                  simple: "You add more Kafka partitions and more consumer daemon processes. The system is designed to scale horizontally — adding more workers is all that is needed.",
                  technical: "Increase Kafka topic partitions: kafka-topics --alter --partitions 8. Add consumer instances by increasing Supervisor numprocs. Queue workers scale via Redis cluster. ClickHouse is already distributed.",
                },
                {
                  q: "What if a client's ad platform API (Facebook, GA4) is down?",
                  simple: "Events are buffered in a drain queue and retried automatically. If the platform comes back online within a few minutes, all events are delivered with no loss.",
                  technical: "ForwardToDestinationJob writes failed events back to the drain queue (tracking:drain-meta-queue etc). The drain commands run on schedules matching each platform's rate limit. If the platform is down longer than the DLQ window (5 attempts, 4 hours), the event is marked failed and an alert is sent.",
                },
                {
                  q: "How does GDPR data erasure work with this architecture?",
                  simple: "When a user asks to be forgotten, their personal data (client_id, user_id, IP address) is nullified across MySQL, ClickHouse, and Redis. The tracking consent record is flagged as withdrawn.",
                  technical: "tracking:purge-consent command runs daily. It identifies withdrawn/expired consent records and executes DELETE/NULL updates across tenant MySQL, ClickHouse event_logs (ALTER TABLE UPDATE), and Redis (DEL tracking_dedup:{tenant}:{user}).",
                },
                {
                  q: "What is the difference between the Kafka consumer and the queue worker?",
                  simple: "The Kafka consumer reads raw events from the Kafka pipe and saves them to the database. The queue worker picks up jobs that were created during that process — like 'forward this event to Facebook' or 'send this billing alert email'.",
                  technical: "Kafka consumer: junges/laravel-kafka blocking loop → ConsumeTrackingEventsCommand. Queue worker: Redis-backed Laravel queue → ForwardToDestinationJob, SendBillingAlertJob, etc. Two separate daemon processes managed by Supervisor.",
                },
              ].map(item => <AccordionItem key={item.q} {...item} />)}
            </div>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="h-4 w-4 text-slate-600" />
          <p className="text-xs text-slate-500">PixelMaster Platform · Provisioning Docs · Laravel 12 + Docker + Kafka</p>
        </div>
        <a href="mailto:engineering@pixelmaster.io"
          className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4">
          engineering@pixelmaster.io
        </a>
      </div>
      </div>{/* end dark inner padding */}
      </div>{/* end dark canvas */}
    </PlatformLayout>
  );
}
