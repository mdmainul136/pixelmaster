import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import {
  Layers, Zap, Shield, Database, GitBranch, Server,
  Activity, Lock, RefreshCcw, Globe, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronRight, BarChart3,
  Radio, ArrowRight, Info, BookOpen, Cpu, Users,
  TrendingUp, Clock, Eye, Code2, Lightbulb,
} from "lucide-react";

/* ─── Reusable UI Components ─────────────────────────────── */

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
  const colors = {
    blue:   "bg-blue-500/10 border-blue-500/20 text-blue-400",
    amber:  "bg-amber-500/10 border-amber-500/20 text-amber-400",
    green:  "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${colors[color]}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div>
        {title && <p className="text-xs font-bold text-white mb-1">{title}</p>}
        <p className="text-xs text-slate-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
};

const FlowStep = ({ num, icon: Icon, title, simple, technical, highlight }) => (
  <div className={`flex gap-4 rounded-xl p-4 border transition-colors ${highlight ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/3"}`}>
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${highlight ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300"}`}>
      {Icon ? <Icon className="h-4 w-4" /> : num}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-white mb-1">{title}</p>
      <p className="text-xs text-slate-400 leading-relaxed mb-1.5">{simple}</p>
      {technical && (
        <code className="text-[10px] text-emerald-400 bg-black/30 rounded px-2 py-0.5 block">{technical}</code>
      )}
    </div>
  </div>
);

const CodeBlock = ({ children, lang = "sql" }) => (
  <div className="rounded-xl bg-[hsl(222,47%,6%)] border border-white/10 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/3">
      <span className="text-[10px] font-mono text-slate-500 uppercase">{lang}</span>
      <Code2 className="h-3.5 w-3.5 text-slate-600" />
    </div>
    <pre className="px-5 py-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">{children}</pre>
  </div>
);

const CompareCard = ({ icon: Icon, color, title, pro, con }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
    <Icon className={`h-5 w-5 mb-3 ${color}`} />
    <p className="text-sm font-bold text-white mb-3">{title}</p>
    <p className="text-xs text-emerald-400 mb-1">✓ {pro}</p>
    <p className="text-xs text-slate-500">– {con}</p>
  </div>
);

const Stat = ({ value, label, color = "text-emerald-400" }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</p>
  </div>
);

const AccordionItem = ({ q, simple, technical }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-white hover:bg-white/5 transition-colors"
      >
        <span>{q}</span>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-white/10 pt-4 space-y-3">
          <div className="flex gap-2 items-start">
            <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 uppercase shrink-0 mt-0.5">Plain English</span>
            <p className="text-xs text-slate-400 leading-relaxed">{simple}</p>
          </div>
          {technical && (
            <div className="flex gap-2 items-start">
              <span className="rounded px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase shrink-0 mt-0.5">Technical</span>
              <p className="text-xs text-slate-400 leading-relaxed">{technical}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────── */

export default function InfrastructureDocsPage() {
  const toc = [
    { id: "overview",     label: "🏗️ Overview",           },
    { id: "pipeline",     label: "🔄 Data Pipeline",       },
    { id: "multitenancy", label: "🔒 Multi-Tenant Safety", },
    { id: "kafka",        label: "📡 Kafka Event Bus",     },
    { id: "clickhouse",   label: "📊 ClickHouse Analytics",},
    { id: "redis",        label: "⚡ Redis Cache Layer",   },
    { id: "security",     label: "🛡️ Origin Security",     },
    { id: "dlq",          label: "♻️ Dead Letter Queue",   },
    { id: "billing",      label: "📈 Billing Metering",    },
    { id: "faq",          label: "❓ FAQ",                 },
  ];

  return (
    <PlatformLayout>
      <Head title="Infrastructure Docs | PixelMaster Platform" />
      {/* ── Dark canvas — keeps glassmorphism styles correct inside white layout ── */}
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-full" style={{ background: 'hsl(222,47%,8%)' }}>
      <div className="p-4 sm:p-6 lg:p-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(222,47%,11%)] to-slate-900 border border-white/10 p-10 mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(210,70%,50%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(160,84%,39%) 0%, transparent 40%)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 mb-5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Platform Engineering Docs · v2.0</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            How PixelMaster Tracking<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Works — From Click to Dashboard
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-6">
            Written for everyone — business owners, product managers, and engineers alike.
            Plain-English explanations sit alongside real code. No jargon without a definition.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            <Stat value="<5ms"  label="API response time" color="text-emerald-400" />
            <Stat value="100x"  label="Faster analytics vs MySQL" color="text-yellow-400" />
            <Stat value="100%"  label="Tenant data isolation" color="text-blue-400" />
            <Stat value="0"     label="Data loss guarantee (DLQ)" color="text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[230px_1fr] gap-8">

        {/* ── Sticky ToC ── */}
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
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Each section has a 🟦 <span className="text-blue-400">Plain English</span> explanation and a 🟩 <span className="text-emerald-400">Technical</span> deep-dive.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="space-y-6 min-w-0">

          {/* 1 — Overview */}
          <Section id="overview" icon={Layers} title="Architecture Overview" badge="Start Here"
            subtitle="What PixelMaster is, and why it is built this way"
            color="bg-gradient-to-r from-blue-600/30 to-cyan-600/20">

            <Callout icon={Lightbulb} color="blue" title="Simple Analogy">
              Think of PixelMaster as a <strong className="text-white">postal sorting facility</strong>.
              Your website sends letters (events). The facility receives them, stamps them, sorts them by customer,
              stores copies in the right filing cabinets, and forwards them to Facebook, Google, etc. — all without
              the letter-sender waiting.
            </Callout>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Radio,    label: "Apache Kafka",   sub: "The conveyor belt",     color: "text-orange-400" },
                { icon: Database, label: "ClickHouse",     sub: "Analytics warehouse",   color: "text-yellow-400" },
                { icon: Zap,      label: "Redis",          sub: "Fast memory cache",      color: "text-red-400" },
                { icon: Server,   label: "MySQL + Tenancy",sub: "Per-client databases",   color: "text-cyan-400" },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center hover:bg-white/10 transition-colors">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            <p className="text-sm leading-relaxed mt-5 text-slate-300">
              Every piece of this system answers one core question: <strong className="text-white">how do we track millions of events per day without ever slowing down a user's website, losing data, or mixing up one client's data with another's?</strong>
            </p>
          </Section>

          {/* 2 — Pipeline */}
          <Section id="pipeline" icon={GitBranch} title="Data Pipeline Flow" badge="How It Works"
            subtitle="Step-by-step: what happens when a user clicks 'Buy Now' on your website"
            color="bg-gradient-to-r from-emerald-600/30 to-teal-600/20">

            <div className="space-y-3 mb-6">
              <FlowStep num={1} icon={Globe}
                title="User takes an action on your website"
                simple="Someone clicks 'Add to Cart', completes a purchase, or lands on a page. Your PixelMaster snippet notices this instantly."
                technical="GTM DataLayer.push() or JS snippet fires — event payload captured in the browser."
                highlight />
              <FlowStep num={2} icon={ArrowRight}
                title="Event travels to your own server (first-party)"
                simple="Instead of going directly to Facebook or Google (which ad-blockers block), the event goes through YOUR website's server first. Ad-blockers trust first-party servers."
                technical="POST /api/tracking/plugin/events → PluginApiController. Origin header validated by EnforceContainerOrigin middleware." />
              <FlowStep num={3} icon={Radio}
                title="Placed on the Kafka conveyor belt"
                simple="Your server drops the event onto a super-fast queue (Kafka). The queue can hold millions of events and never gets overwhelmed."
                technical="KafkaProducerService::publish('tracking-events', $payload). Returns 200 OK in <5ms — the browser is done." />
              <FlowStep num={4} icon={Cpu}
                title="Background worker picks it up"
                simple="A background process (running 24/7) grabs events from the queue one by one, figures out which client the event belongs to, and switches into their 'zone'."
                technical="ConsumeTrackingEventsCommand daemon. Calls tenancy()->initialize($tenantId) — switches MySQL + ClickHouse DB context."
                highlight />
              <FlowStep num={5} icon={Database}
                title="Saved in two places at once"
                simple="The event is filed in TWO places: a regular database (for operations) and a super-fast analytics database (for reports). Your billing counter ticks up by one."
                technical="Parallel write: MySQL tracking_event_logs + ClickHouse tracking_{tenant_id}.event_logs. Redis INCR billing counter." />
              <FlowStep num={6} icon={TrendingUp}
                title="Forwarded to ad platforms"
                simple="A job is queued to relay the event to Facebook (CAPI), Google Analytics 4, TikTok, Snapchat, LinkedIn — securely, from your server."
                technical="ForwardToDestinationJob → DestinationChannelService → CAPI/GA4/TikTok EA endpoints via Bearer token auth." />
              <FlowStep num={7} icon={CheckCircle2}
                title="Context cleared — ready for next event"
                simple="The worker cleans up so one client's data never accidentally contaminates the next event's processing."
                technical="finally { tenancy()->end(); } — ensures stateless worker regardless of success or exception."
                highlight />
            </div>

            <Callout color="green" title="Why this design matters">
              Traditional tracking writes to the database <em>during</em> the user's page load, adding 50–200ms of latency.
              PixelMaster's pipeline <strong className="text-white">acknowledges the event in under 5ms</strong> and does all the heavy work in the background.
              Your website stays fast. Your data stays safe.
            </Callout>
          </Section>

          {/* 3 — Multi-Tenancy */}
          <Section id="multitenancy" icon={Users} title="Multi-Tenant Data Isolation" badge="Client Privacy"
            subtitle="How we guarantee that Client A can never see Client B's data"
            color="bg-gradient-to-r from-violet-600/30 to-purple-600/20">

            <Callout icon={Lightbulb} color="purple" title="Analogy">
              Imagine a building with 100 offices. Each company has their own locked office (database). Even the building security
              (PixelMaster's server) uses different keys — they never have a master key that opens everything at once.
            </Callout>

            <div className="mt-5 space-y-4">
              {[
                {
                  num: "Layer 1",
                  title: "MySQL — Separate databases per client",
                  simple: "Every client gets their own MySQL database (like a separate filing cabinet). When we process their data, we physically switch to their cabinet and lock it.",
                  code: "tenancy()->initialize('tenant_iphonebd'); // switches DB connection\n// All queries now hit: mysql://tenant_iphonebd.*",
                  color: "border-cyan-500/30",
                },
                {
                  num: "Layer 2",
                  title: "ClickHouse — Separate analytics databases",
                  simple: "Analytics reports (charts, graphs) are stored in a completely separate high-speed system. Each client has their own analytics database — their reports can never mix.",
                  code: "// Database: tracking_iphonebd\nSELECT count() FROM tracking_iphonebd.event_logs\nWHERE event_type = 'purchase'",
                  color: "border-yellow-500/30",
                },
                {
                  num: "Layer 3",
                  title: "Redis — Namespaced cache keys",
                  simple: "The fast memory cache labels every piece of data with the client's ID. It is impossible to accidentally read another client's cached data.",
                  code: "tracking_dedup:iphonebd:evt_abc123   // dedup key\ntracking_usage:iphonebd:2026-03-30   // billing counter",
                  color: "border-red-500/30",
                },
              ].map(({ num, title, simple, code, color }) => (
                <div key={num} className={`rounded-xl border ${color} bg-white/5 p-5`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-white/10 rounded px-2 py-0.5 text-slate-400 uppercase">{num}</span>
                    <p className="text-sm font-bold text-white">{title}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{simple}</p>
                  <CodeBlock lang="code">{code}</CodeBlock>
                </div>
              ))}
            </div>
          </Section>

          {/* 4 — Kafka */}
          <Section id="kafka" icon={Radio} title="Apache Kafka — The Event Bus" badge="Core Infrastructure"
            subtitle="Why we use a message queue instead of writing directly to the database"
            color="bg-gradient-to-r from-orange-600/30 to-amber-600/20">

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <CompareCard icon={Database} color="text-slate-400" title="Old approach: Direct DB write"
                pro="Simple to understand"
                con="Adds 50-200ms to every page load. Crashes under traffic spikes." />
              <CompareCard icon={Radio} color="text-orange-400" title="PixelMaster: Kafka queue"
                pro="Returns 200 OK in <5ms. Handles millions of events/second."
                con="Slightly more complex setup — but invisible to end users." />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "📤 Producer", body: "When an event arrives at the API, KafkaProducerService writes it to the tracking-events topic instantly. The API does NOT wait for the database — it just confirms receipt and moves on." },
                { title: "📥 Consumer (Daemon)", body: "A background process (Supervisor daemon) reads from the topic 24/7. It processes each event: validate → initialize tenant → write to DB → forward to ad platforms → commit offset." },
                { title: "🗂️ Topic & Partitions", body: "The tracking-events topic has configurable partitions. More partitions = more parallel consumers = more throughput. Each partition is an ordered, fault-tolerant log of events." },
                { title: "💻 Local Dev Fallback", body: "On Windows (where the rdkafka PHP extension is not available), the producer uses an in-memory mock. Development works without Apache Kafka installed locally." },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold text-white mb-2">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 5 — ClickHouse */}
          <Section id="clickhouse" icon={BarChart3} title="ClickHouse — Analytics Database" badge="Speed"
            subtitle="Why we have a second database just for analytics"
            color="bg-gradient-to-r from-yellow-600/30 to-amber-500/20">

            <Callout icon={Lightbulb} color="amber" title="Analogy">
              MySQL is like a filing cabinet — great for finding one specific file. ClickHouse is like a spreadsheet optimised for
              summing entire columns — <strong className="text-white">100× faster</strong> for "give me total revenue for the last 30 days across 10 million rows."
            </Callout>

            <div className="mt-5">
              <CodeBlock lang="sql">{`-- Each tenant gets their own database: tracking_{tenant_id}
CREATE TABLE IF NOT EXISTS event_logs (
    id             UUID          DEFAULT generateUUIDv4(),
    container_id   UInt64,
    event_type     LowCardinality(String),  -- stored compressed
    event_data     String,                  -- JSON payload
    ip_address     String,
    created_at     DateTime      DEFAULT now()
) ENGINE = MergeTree()
  ORDER BY  (container_id, created_at, event_type)   -- query optimisation
  PARTITION BY toYYYYMM(created_at);                 -- auto-archives old data`}</CodeBlock>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {[
                { title: "MergeTree Engine", body: "ClickHouse's default engine. Merges small writes into large compressed blocks — perfect for append-only event data." },
                { title: "Partition by Month", body: "Old months are stored separately. Querying 'last 7 days' never touches data from 6 months ago — dramatically faster." },
                { title: "LowCardinality", body: "event_type has only ~20 values (purchase, pageview, etc). This compression hint reduces storage and speeds up GROUP BY." },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold text-white mb-1.5">{title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Callout color="green" title="Provisioning command">
                Run <code className="bg-white/10 px-1.5 rounded text-white mx-1">php artisan tracking:clickhouse-migrate</code> to create isolated
                analytical databases for all active tenants. The command is idempotent — safe to run multiple times.
              </Callout>
            </div>
          </Section>

          {/* 6 — Redis */}
          <Section id="redis" icon={Zap} title="Redis — Speed & Deduplication Layer" badge="Memory Cache"
            subtitle="Two jobs: prevent duplicate events, and count usage without slowing the database"
            color="bg-gradient-to-r from-red-600/30 to-rose-600/20">

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400" /> Job 1 — Event Deduplication
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  <strong className="text-white">Problem:</strong> A user refreshes the page after a purchase — should that count as two purchases? No.
                  Each event carries a unique ID. Redis remembers it for 24 hours. If the same ID arrives again, it is silently discarded.
                </p>
                <CodeBlock lang="redis">{`-- Before processing any event:
EXISTS tracking_dedup:iphonebd:evt_abc123
→ 1  (already seen)  → skip
→ 0  (new event)     → process + SET with TTL 86400`}</CodeBlock>
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-red-400" /> Job 2 — Billing Counter
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  <strong className="text-white">Problem:</strong> Every processed event must increment a usage counter. Writing to MySQL for every event would be too slow.
                  Redis can increment a counter in <strong className="text-white">0.1 milliseconds</strong>, then a scheduler syncs to MySQL hourly.
                </p>
                <CodeBlock lang="redis">{`-- Each processed event:
INCR tracking_usage:iphonebd:2026-03-30:events_received
-- ~0.1ms. No DB hit.

-- Hourly scheduler syncs to MySQL:
UPDATE tenant_usage_quotas SET used_count = [redis_value]`}</CodeBlock>
              </div>
            </div>
          </Section>

          {/* 7 — Security */}
          <Section id="security" icon={Shield} title="Origin Enforcement & Snippet Security" badge="Anti-Theft"
            subtitle="What stops a competitor from stealing your GTM snippet and using it on their website?"
            color="bg-gradient-to-r from-blue-600/30 to-indigo-600/20">

            <Callout icon={AlertTriangle} color="amber" title="Real Threat Scenario">
              A bad actor visits your website, copies your GTM container ID (e.g. GTM-ABC123), and pastes it into their
              own website. Without protection, they could send fake events to your account, consume your quota, or poison your analytics.
            </Callout>

            <div className="mt-5 space-y-2 mb-5">
              {[
                { n: "1", t: "Request arrives with Origin or Referer header", d: "Every browser automatically sends where the request is coming from. The middleware reads this." },
                { n: "2", t: "Host is normalised", d: "www.example.com → example.com. Lowercased. Port stripped. Consistent format for comparison." },
                { n: "3", t: "Container is looked up by API key or GTM ID", d: "The snippet's identifier maps to a specific container record in the database." },
                { n: "4", t: "Host checked against the whitelist", d: "The container has a primary domain and optional extra_domains. If the request origin matches — allowed. If not — rejected." },
                { n: "5", t: "Rejected: 403 + threat logged", d: "The unauthorised attempt is logged to the audit system. The requester receives a 403 with a JS-friendly error." },
                { n: "6", t: "Special cases always allowed", d: "localhost / 127.0.0.1 (for your own developers). Server-to-server API calls (authenticated via Bearer token, no browser Origin header)." },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5 transition-colors">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">{n}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{t}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            <CodeBlock lang="php">{`// EnforceContainerOrigin middleware (simplified)
$origin     = $request->header('Origin') ?? $request->header('Referer');
$host       = strtolower(parse_url($origin, PHP_URL_HOST));
$container  = Container::where('api_key', $apiKey)->first();
$whitelist  = array_merge([$container->domain], $container->extra_domains ?? []);

if (!in_array($host, $whitelist)) {
    Log::warning('Unauthorised origin', ['host' => $host, 'container' => $container->id]);
    abort(403, 'Origin not authorised.');
}`}</CodeBlock>
          </Section>

          {/* 8 — DLQ */}
          <Section id="dlq" icon={RefreshCcw} title="Dead Letter Queue — Zero Data Loss" badge="Reliability"
            subtitle="What happens if the database goes down while processing events?"
            color="bg-gradient-to-r from-purple-600/30 to-fuchsia-600/20">

            <Callout icon={Lightbulb} color="purple" title="Analogy">
              Imagine a delivery courier. If no one is home, instead of throwing the parcel away, they leave a card and try again — first in 1 minute,
              then 5 minutes, then an hour. PixelMaster's DLQ does the same for failed event writes.
            </Callout>

            <div className="grid md:grid-cols-2 gap-5 mt-5">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" /> Retry Schedule (Exponential Backoff)
                </p>
                <div className="space-y-2">
                  {[["Attempt 1", "1 minute",  "First quick retry"],
                    ["Attempt 2", "5 minutes", "Short wait"],
                    ["Attempt 3", "15 minutes","Medium wait"],
                    ["Attempt 4", "60 minutes","Long wait"],
                    ["Attempt 5", "4 hours",   "Final attempt before marking failed"],
                  ].map(([a, d, note]) => (
                    <div key={a} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{a}</span>
                      <span className="font-mono text-emerald-400">{d}</span>
                      <span className="text-slate-600 text-[10px] hidden md:block">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-sm font-bold text-white mb-4">DLQ Entry Lifecycle</p>
                <div className="space-y-2">
                  {[
                    ["pending",   "text-yellow-400",  "Waiting for next retry window"],
                    ["retrying",  "text-blue-400",    "Currently being retried by worker"],
                    ["succeeded", "text-emerald-400", "Recovered — event written successfully"],
                    ["failed",    "text-red-400",     "All 5 attempts exhausted — alert sent"],
                    ["expired",   "text-slate-500",   "Purged after 7 days (configurable)"],
                  ].map(([status, color, desc]) => (
                    <div key={status} className="flex items-start gap-2 text-xs">
                      <span className={`font-mono w-20 shrink-0 ${color}`}>{status}</span>
                      <span className="text-slate-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Callout color="green" title="Artisan commands">
                <code className="text-white">tracking:process-retry-queue</code> — runs every minute via scheduler.{" "}
                <code className="text-white">tracking:expire-dlq --days=7</code> — runs daily at 02:30 AM.
              </Callout>
            </div>
          </Section>

          {/* 9 — Billing */}
          <Section id="billing" icon={TrendingUp} title="Billing Quota & Usage Metering" badge="Business Logic"
            subtitle="How we count events per client and send usage warnings without slowing anything down"
            color="bg-gradient-to-r from-teal-600/30 to-cyan-600/20">

            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
              {["Event received", "Redis INCR (0.1ms)", "Hourly scheduler", "MySQL sync", "Usage dashboard"].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center text-center shrink-0">
                    <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold text-teal-400">{i + 1}</div>
                    <p className="text-[10px] text-slate-500 mt-1.5 max-w-[64px] leading-tight">{step}</p>
                  </div>
                  {i < arr.length - 1 && <div className="flex-1 h-px bg-white/10 min-w-[20px] shrink-0" />}
                </React.Fragment>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-white mb-2">Quota Alert Thresholds</p>
                <div className="space-y-2">
                  {[
                    { pct: "80%", color: "bg-amber-500", msg: "Warning email + in-app notification" },
                    { pct: "100%", color: "bg-red-500", msg: "Ingestion paused + urgent alert" },
                  ].map(({ pct, color, msg }) => (
                    <div key={pct} className="flex items-center gap-3 rounded-lg border border-white/10 p-3">
                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${color}`}>{pct}</span>
                      <p className="text-xs text-slate-400">{msg}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-2">Monthly Reset</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Alert flags are stored in Redis with a key expiring on the 1st of each month.
                  When the month rolls over, counters reset automatically — no cron job needed for the reset itself.
                </p>
                <CodeBlock lang="redis">{`Key: billing_alert:iphonebd:80pct:2026-03
TTL: expires on 2026-04-01 00:00:00`}</CodeBlock>
              </div>
            </div>
          </Section>

          {/* 10 — FAQ */}
          <Section id="faq" icon={BookOpen} title="Frequently Asked Questions"
            subtitle="Two answers for every question: plain English + technical detail"
            color="bg-gradient-to-r from-slate-600/30 to-slate-500/20">

            <div className="space-y-2">
              {[
                {
                  q: "Why use Kafka instead of writing directly to the database?",
                  simple: "Saving to a database takes time. If we do it while the user's page is loading, their website feels slow. Kafka is like a super-fast inbox — we drop the event in instantly and a background worker saves it later. The user never waits.",
                  technical: "Synchronous DB writes in the request lifecycle add 50-200ms of perceived latency per event. Kafka's async model keeps API p99 latency under 10ms regardless of DB load. Consumer lag is an accepted trade-off for horizontal scalability.",
                },
                {
                  q: "Why use ClickHouse in addition to MySQL?",
                  simple: "MySQL is great for finding one specific record (like looking up a customer). It is slow when you need to add up millions of numbers (like total sales last month). ClickHouse is built exactly for that — it is 10-100× faster for analytics reports.",
                  technical: "MySQL is row-oriented (reads entire rows). ClickHouse is columnar — a SUM(revenue) query only reads the revenue column, not the whole row. Combined with vectorised execution and LZ4 compression, analytical queries on 100M rows take milliseconds.",
                },
                {
                  q: "What happens if Kafka goes down?",
                  simple: "Kafka is designed to be extremely reliable. It keeps multiple copies of every message. If a worker crashes mid-process, Kafka replays that message when the worker restarts — nothing is lost.",
                  technical: "Kafka's offset-commit model guarantees at-least-once delivery. Consumers only commit offsets after successful processing. Partition replication (replication.factor ≥ 2) handles broker failures. The DLQ layer handles downstream-db failures independently.",
                },
                {
                  q: "Can one client ever see another client's data?",
                  simple: "No — and we have three independent locks preventing it, not just one. Even if a software bug broke one lock, the other two would still protect the data. This is called 'defence in depth'.",
                  technical: "Three isolation layers: (1) Stancl/Tenancy switches MySQL connections per tenant, (2) ClickHouse uses separate databases (tracking_{id}), (3) Redis keys are namespaced with tenant_id. Breach of all three simultaneously is architecturally impossible in the current design.",
                },
                {
                  q: "What is a Dead Letter Queue and why do we need it?",
                  simple: "Imagine a postal worker who cannot deliver a letter because no one is home. Instead of throwing it away, they try again later. The DLQ does the same — if saving an event fails, it retries up to 5 times over 4 hours before giving up and alerting the team.",
                  technical: "The DLQ (tracking_dlq MySQL table) stores failed payloads with attempt_count and next_retry_at. RetryQueueService reads eligible rows every minute, replays them through the full processing pipeline, and uses exponential backoff to avoid thundering-herd on a recovering DB.",
                },
                {
                  q: "How do I add ClickHouse support for a new tenant?",
                  simple: "Run one command and it handles everything automatically. The command is smart enough to skip tenants that already have it set up.",
                  technical: "php artisan tracking:clickhouse-migrate iterates all active Tenant records, opens a ClickHouseService connection, and executes CREATE DATABASE IF NOT EXISTS + CREATE TABLE IF NOT EXISTS for the MergeTree schema. Fully idempotent.",
                },
                {
                  q: "How does the GTM snippet domain restriction protect my quota?",
                  simple: "Your GTM snippet ID is like a key to your account. If someone else copies that key and puts it on their website, our system checks 'is this request coming from an approved website?' If not, it is immediately rejected.",
                  technical: "EnforceContainerOrigin middleware extracts and normalises the HTTP Origin (or Referer) header. It fetches the container by API key, checks the host against domain + extra_domains whitelist (case-insensitive, www-stripped). Server-side requests with no Origin header are always allowed since they use Bearer token auth.",
                },
              ].map((item) => (
                <AccordionItem key={item.q} {...item} />
              ))}
            </div>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4 text-slate-600" />
          <p className="text-xs text-slate-500">
            PixelMaster Platform Engineering Docs · Laravel 12 + React + Inertia.js
          </p>
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
