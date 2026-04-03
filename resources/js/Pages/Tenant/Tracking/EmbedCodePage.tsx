/**
 * EmbedCodePage — Complete Integration Hub
 * Plugins, Apps, SDKs, and Platform Integrations
 * Features: tabbed view, live dynamic snippets, step-by-step setup guides
 */
import React, { useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@Tenant/components/ui/button";
import { Badge } from "@Tenant/components/ui/badge";
import {
  Code, Copy, CheckCircle2, ExternalLink, Terminal,
  Puzzle, ShoppingBag, Blocks, Globe,
  Zap, Shield, BarChart3, Package, Smartphone, Box,
  ChevronDown, ChevronRight, BookOpen, Settings2,
} from "lucide-react";
import { toast } from "sonner";

const fetchContainers = async () => {
  try {
    const { data } = await axios.get("/api/tracking/dashboard/containers");
    return data.containers ?? [];
  } catch { return []; }
};

type TabId = "snippets" | "plugins" | "apps" | "sdk" | "api";

const EmbedCodePage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("snippets");
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const { data: containers = [] } = useQuery({
    queryKey: ["tracking-containers"],
    queryFn: fetchContainers,
  });

  const transportUrl = selectedContainer?.transport_url ?? "https://track.yoursite.com";
  const containerId = selectedContainer?.container_id ?? "GTM-XXXXX";
  const apiKey = selectedContainer?.api_key ?? "pm_live_XXXXXXXXXXXX";

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyText(text, id)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {copied === id ? (
        <><CheckCircle2 className="h-3.5 w-3.5 text-[hsl(160,84%,39%)]" /> Copied</>
      ) : (
        <><Copy className="h-3.5 w-3.5" /> Copy</>
      )}
    </button>
  );

  const CodeBlock = ({ code, id, lang = "html" }: { code: string; id: string; lang?: string }) => (
    <div className="relative rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between bg-[hsl(222,47%,10%)] border-b border-border/40 px-4 py-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{lang}</span>
        <CopyBtn text={code} id={id} />
      </div>
      <pre className="bg-[hsl(222,47%,8%)] p-4 overflow-x-auto">
        <code className="text-xs text-[hsl(160,84%,70%)] font-mono whitespace-pre leading-relaxed">{code}</code>
      </pre>
    </div>
  );

  // ── Tab Config ────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: typeof Code; badge?: string }[] = [
    { id: "snippets", label: "Embed Snippets", icon: Code },
    { id: "plugins", label: "CMS Plugins", icon: Puzzle, badge: "2" },
    { id: "apps", label: "Platform Apps", icon: ShoppingBag, badge: "3" },
    { id: "sdk", label: "JS / Node SDK", icon: Terminal },
    { id: "api", label: "REST API", icon: Globe },
  ];

  // ── Snippet Content ────────────────────────────────────────
  const snippetContent = () => (
    <div className="space-y-6">
      {/* Container Selector */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Container</label>
        <select
          value={selectedContainer?.id ?? ""}
          onChange={(e) => setSelectedContainer(containers.find((c: any) => c.id === Number(e.target.value)) || null)}
          className="w-full max-w-sm rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="">Choose a container...</option>
          {containers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* gtag.js */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-card-foreground">gtag.js (Recommended)</h3>
              <Badge className="bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[9px]">Most Popular</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Google Analytics 4 compatible — paste in &lt;head&gt;</p>
          </div>
        </div>
        <CodeBlock id="gtag" code={`<!-- PixelMaster sGTM — First-Party gtag.js -->
<script async src="${transportUrl}/gtag/js?id=${containerId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${containerId}', {
    transport_url: '${transportUrl}',
    first_party_collection: true
  });
</script>`} />
      </div>

      {/* GTM Container */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]">
            <Blocks className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">GTM Container Loader</h3>
            <p className="text-xs text-muted-foreground">Drop-in replacement for standard GTM loader — paste in &lt;head&gt;</p>
          </div>
        </div>
        <CodeBlock id="gtm-head" lang="html" code={`<!-- PixelMaster sGTM — Head Snippet -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
  j.src='${transportUrl}/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${containerId}');
</script>`} />
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Additionally, paste immediately after &lt;body&gt; tag:</p>
          <CodeBlock id="gtm-body" lang="html" code={`<!-- PixelMaster sGTM — Body Snippet -->
<noscript><iframe src="${transportUrl}/ns.html?id=${containerId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`} />
        </div>
      </div>

      {/* MP / S2S */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(280,68%,60%)]/10 text-[hsl(280,68%,60%)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Measurement Protocol (Server-to-Server)</h3>
            <p className="text-xs text-muted-foreground">Send events from your backend directly — no browser required</p>
          </div>
        </div>
        <CodeBlock id="mp" lang="bash" code={`curl -X POST '${transportUrl}/mp/collect' \\
  -H 'Content-Type: application/json' \\
  -H 'X-PM-Api-Key: ${apiKey}' \\
  -d '{
    "client_id": "USER_CLIENT_ID",
    "events": [{
      "name": "purchase",
      "params": {
        "transaction_id": "TXN_001",
        "value": 99.99,
        "currency": "USD"
      }
    }]
  }'`} />
      </div>
    </div>
  );

  // ── Plugins Content ────────────────────────────────────────
  const pluginsContent = () => {
    const plugins = [
      {
        id: "wordpress",
        name: "WordPress / WooCommerce",
        icon: Puzzle,
        version: "v2.4.1",
        status: "stable",
        color: "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5",
        textColor: "text-[hsl(210,70%,50%)]",
        desc: "Full server-side tracking for WordPress & WooCommerce. Auto-tracks purchases, add-to-cart, page views and more.",
        features: ["Auto Purchase Tracking", "WooCommerce Events", "GDPR Consent Mode", "Cookie-less Mode"],
        steps: [
          "Download and install PixelMaster plugin from wordpress.org",
          `Go to Settings > PixelMaster and enter your Container ID: ${containerId}`,
          `Enter your API Key: ${apiKey}`,
          "Enable WooCommerce integration and save",
          "Verify connection using the 'Test Connection' button",
        ],
      },
      {
        id: "prestashop",
        name: "PrestaShop",
        icon: Box,
        version: "v1.2.0",
        status: "stable",
        color: "from-[hsl(0,84%,60%)]/15 to-[hsl(0,84%,60%)]/5",
        textColor: "text-[hsl(0,84%,60%)]",
        desc: "Track orders, product views, and customer actions in your PrestaShop store with Server-Side events.",
        features: ["Order Tracking", "Product Views", "Cart Events", "Customer Data"],
        steps: [
          "Download PixelMaster PrestaShop module from your dashboard",
          "Upload to /modules/ folder and activate in Back Office",
          `Configure Container ID: ${containerId} and API Key`,
          "Map your store events to PixelMaster destinations",
        ],
      },
    ];

    return (
      <div className="space-y-6">
        {plugins.map((plugin) => {
          const Icon = plugin.icon;
          const isOpen = expandedGuide === plugin.id;
          return (
            <div key={plugin.id} className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${plugin.color} ${plugin.textColor} shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-card-foreground">{plugin.name}</h3>
                        <Badge className="bg-muted text-muted-foreground text-[9px]">{plugin.version}</Badge>
                        <Badge className="bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] text-[9px]">{plugin.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">{plugin.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {plugin.features.map(f => (
                          <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="h-2.5 w-2.5 text-primary" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs gap-1.5"
                      onClick={() => setExpandedGuide(isOpen ? null : plugin.id)}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {isOpen ? "Hide Guide" : "Setup Guide"}
                      {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" className="rounded-xl text-xs gap-1.5">
                      <Package className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Guide */}
              {isOpen && (
                <div className="border-t border-border/50 bg-muted/10 p-6 animate-in slide-in-from-top-2">
                  <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" /> Step-by-step Installation Guide
                  </h4>
                  <ol className="space-y-3">
                    {plugin.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Your API Key:</strong>{" "}
                      <code className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{apiKey}</code>
                      <button onClick={() => copyText(apiKey, `key-${plugin.id}`)} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        {copied === `key-${plugin.id}` ? <CheckCircle2 className="h-3.5 w-3.5 inline text-[hsl(160,84%,39%)]" /> : <Copy className="h-3.5 w-3.5 inline" />}
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Apps Content ────────────────────────────────────────────
  const appsContent = () => {
    const apps = [
      {
        id: "shopify",
        name: "Shopify",
        icon: ShoppingBag,
        status: "App Ready",
        color: "from-[hsl(160,84%,39%)]/15 to-[hsl(160,84%,39%)]/5",
        textColor: "text-[hsl(160,84%,39%)]",
        desc: "One-click Shopify app. Tracks all Shopify standard events (purchase, add_to_cart, checkout) via CAPI with deduplication.",
        features: ["Web Pixel API", "Server Events", "Order Deduplication", "Klaviyo Sync"],
        steps: [
          "Go to Shopify App Store and search for PixelMaster",
          "Click Install and authorize the app",
          `In the app settings, your Container ID (${containerId}) is pre-filled`,
          "Select the ad platforms you want to track (Facebook, GA4, TikTok, etc.)",
          "Enable 'Server-Side Deduplication' for accurate conversion tracking",
        ],
      },
      {
        id: "woocommerce",
        name: "WooCommerce (Direct App)",
        icon: Package,
        status: "Plugin Ready",
        color: "from-[hsl(280,68%,60%)]/15 to-[hsl(280,68%,60%)]/5",
        textColor: "text-[hsl(280,68%,60%)]",
        desc: "Native WooCommerce app for complete ecommerce event tracking with cart abandonment and customer lifetime value.",
        features: ["Cart Abandonment", "CLV tracking", "Refund Events", "Subscription Events"],
        steps: [
          "Download from PixelMaster dashboard under Integrations > Apps",
          "Upload to WordPress via Plugins > Add New > Upload",
          `Activate and go to WooCommerce > PixelMaster > Settings`,
          `Enter Container ID ${containerId} and save`,
          "Test a purchase to verify event data flows correctly",
        ],
      },
      {
        id: "magento",
        name: "Adobe Commerce (Magento)",
        icon: Box,
        status: "Beta",
        color: "from-[hsl(38,92%,50%)]/15 to-[hsl(38,92%,50%)]/5",
        textColor: "text-[hsl(38,92%,50%)]",
        desc: "Enterprise-grade Magento 2 extension for large-scale ecommerce tracking. Supports multi-store configurations.",
        features: ["Multi-Store", "B2B Events", "Quote Tracking", "SKU-Level Data"],
        steps: [
          "Install via Composer: `composer require pixelmaster/magento2-tracking`",
          "Run `php bin/magento module:enable PixelMaster_Tracking`",
          "Run `php bin/magento setup:upgrade && php bin/magento cache:flush`",
          `Configure API Key and Container ID in Stores > Configuration > PixelMaster`,
        ],
      },
    ];

    return (
      <div className="space-y-6">
        {apps.map(app => {
          const Icon = app.icon;
          const isOpen = expandedGuide === app.id;
          return (
            <div key={app.id} className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} ${app.textColor} shrink-0`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-card-foreground">{app.name}</h3>
                        <Badge className={`text-[9px] ${app.status === 'Beta' ? 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]' : 'bg-primary/10 text-primary'}`}>{app.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">{app.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {app.features.map(f => (
                          <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                            <CheckCircle2 className="h-2.5 w-2.5 text-primary" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5" onClick={() => setExpandedGuide(isOpen ? null : app.id)}>
                      <BookOpen className="h-3.5 w-3.5" />
                      {isOpen ? "Hide Guide" : "Setup Guide"}
                      {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" className="rounded-xl text-xs gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" /> Install
                    </Button>
                  </div>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border/50 bg-muted/10 p-6 animate-in slide-in-from-top-2">
                  <h4 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" /> Installation Steps
                  </h4>
                  <ol className="space-y-3">
                    {app.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── SDK Content ────────────────────────────────────────────
  const sdkContent = () => (
    <div className="space-y-6">
      {/* JS Browser SDK */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Browser JS SDK</h3>
              <Badge className="bg-primary/10 text-primary text-[9px]">v2.1.0</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Universal JavaScript tracker — works on any website</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">1. Load SDK via CDN</p>
            <CodeBlock id="sdk-cdn" lang="html" code={`<script src="https://cdn.pixelmaster.io/sdk/v2/pm.min.js" async></script>`} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">2. Initialize the SDK</p>
            <CodeBlock id="sdk-init" lang="javascript" code={`PixelMaster.init({
  containerId: '${containerId}',
  transportUrl: '${transportUrl}',
  apiKey: '${apiKey}',
  autoTrack: true,       // Auto page_view tracking
  ecommerce: true,       // Auto ecommerce event tracking
  cookieConsent: true,   // Respect user consent settings
  debug: false,          // Set true in development
});`} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">3. Track Custom Events</p>
            <CodeBlock id="sdk-events" lang="javascript" code={`// Track a custom event
PixelMaster.track('purchase', {
  transaction_id: 'TXN_12345',
  value: 99.99,
  currency: 'USD',
  items: [{ id: 'SKU_001', name: 'Product Name', price: 99.99, quantity: 1 }]
});

// Identify a user
PixelMaster.identify({
  email: 'user@example.com',
  phone: '+8801700000000',
  external_id: 'USER_12345',
});`} />
          </div>
        </div>
      </div>

      {/* Node.js SDK */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Node.js / TypeScript SDK</h3>
              <Badge className="bg-primary/10 text-primary text-[9px]">v1.8.0</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Server-side SDK for Node.js, TypeScript, Next.js backends</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Install via npm</p>
            <CodeBlock id="node-install" lang="bash" code={`npm install @pixelmaster/node-sdk`} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Initialize and Track</p>
            <CodeBlock id="node-track" lang="typescript" code={`import { PixelMaster } from '@pixelmaster/node-sdk';

const pm = new PixelMaster({
  containerId: '${containerId}',
  apiKey: '${apiKey}',
  transportUrl: '${transportUrl}',
});

// Server-side purchase event
await pm.track({
  clientId: req.cookies['_pm_cid'],
  userId: user.id,
  events: [{
    name: 'purchase',
    params: {
      transaction_id: order.id,
      value: order.total,
      currency: 'USD',
      items: order.items.map(i => ({
        id: i.sku,
        name: i.name,
        price: i.price,
        quantity: i.qty,
      })),
    }
  }]
});`} />
          </div>
        </div>
      </div>

      {/* Mobile SDK */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm opacity-80">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Mobile SDK (iOS & Android)</h3>
              <Badge className="bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] text-[9px]">Coming Soon</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Native iOS (Swift) and Android (Kotlin) tracking SDKs</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── REST API Content ────────────────────────────────────────
  const apiContent = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">REST API Reference</h3>
            <p className="text-xs text-muted-foreground">Direct HTTP API for any language or platform</p>
          </div>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
            <span className="font-mono text-[10px] font-bold text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10 px-2 py-0.5 rounded">BASE URL</span>
            <code className="text-xs font-mono text-foreground">{transportUrl}</code>
            <CopyBtn text={transportUrl} id="base-url" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
            <span className="font-mono text-[10px] font-bold text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 px-2 py-0.5 rounded">API KEY</span>
            <code className="text-xs font-mono text-foreground">{apiKey}</code>
            <CopyBtn text={apiKey} id="api-key-rest" />
          </div>
        </div>

        {[
          {
            method: "POST", endpoint: "/mp/collect", desc: "Ingest browser or server events",
            body: `{
  "client_id": "string",        // Required: Browser client ID
  "user_id": "string",          // Optional: Authenticated user ID
  "events": [
    {
      "name": "purchase",
      "params": { "transaction_id": "TXN_001", "value": 99.99, "currency": "USD" }
    }
  ]
}`,
          },
          {
            method: "GET", endpoint: "/tracking/snippet", desc: "Get your dynamic embed snippets",
            body: `// Response
{
  "gtm_snippet": "<script>...</script>",
  "gtm_noscript": "<noscript>...</noscript>",
  "transport_url": "${transportUrl}",
  "container_id": "${containerId}"
}`,
          },
        ].map(ep => (
          <div key={ep.endpoint} className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]'}`}>
                  {ep.method}
                </span>
                <code className="text-xs font-mono text-foreground">{ep.endpoint}</code>
              </div>
              <span className="text-[10px] text-muted-foreground">{ep.desc}</span>
            </div>
            <pre className="bg-[hsl(222,47%,8%)] p-4 overflow-x-auto">
              <code className="text-xs text-[hsl(160,84%,70%)] font-mono whitespace-pre leading-relaxed">{ep.body}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );

  const tabContent: Record<TabId, () => React.ReactElement> = {
    snippets: snippetContent,
    plugins: pluginsContent,
    apps: appsContent,
    sdk: sdkContent,
    api: apiContent,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Integration Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plugins, Apps, SDKs and APIs to connect PixelMaster to any platform
            </p>
          </div>
          <a
            href="https://docs.pixelmaster.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" /> Full Docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {tabContent[activeTab]()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmbedCodePage;
