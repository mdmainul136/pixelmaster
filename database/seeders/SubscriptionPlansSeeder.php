<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

/**
 * SubscriptionPlansSeeder
 *
 * Adds all features one by one, phase by phase, across 5 plan tiers:
 *   Free → Pro → Business → Enterprise → Custom
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  Phase 1 — Core Features (19 features)                                  │
 * │  Phase 2 — Advanced Infrastructure (11 features)                        │
 * │  Phase 3 — Account Management (6 features)                              │
 * │  Phase 4 — Connections (4 features)                                     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
class SubscriptionPlansSeeder extends Seeder
{
    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 1 — CORE FEATURES
    // ──────────────────────────────────────────────────────────────────────────
    private const PHASE_1_CORE = [

        // #1
        [
            'key'         => 'custom_domain',
            'label'       => 'Custom Domain',
            'description' => 'Connect and serve your sGTM container from your own branded domain.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #2
        [
            'key'         => 'custom_loader',
            'label'       => 'Custom Loader',
            'description' => 'Serve the GTM loader script from your own domain to bypass ad blockers.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #3
        [
            'key'         => 'pixelmaster_analytics',
            'label'       => 'PixelMaster Analytics',
            'description' => 'Built-in analytics dashboard to monitor container hits, traffic, and event performance.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #4
        [
            'key'         => 'anonymizer',
            'label'       => 'Anonymizer',
            'description' => 'Automatically anonymize IP addresses and PII before sending data to third parties.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #5
        [
            'key'         => 'http_header_config',
            'label'       => 'HTTP Header Config',
            'description' => 'Configure custom HTTP headers for requests passing through your sGTM container.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #6
        [
            'key'         => 'global_cdn',
            'label'       => 'Global CDN',
            'description' => 'Route traffic through a worldwide CDN for low-latency, high-availability container delivery.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #7
        [
            'key'         => 'geo_headers',
            'label'       => 'GEO Headers',
            'description' => 'Inject geo-location headers (country, city, region) into every server-side request.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #8
        [
            'key'         => 'user_agent_info',
            'label'       => 'User Agent Info',
            'description' => 'Parse and enrich requests with full user-agent data (browser, OS, device type).',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #9
        [
            'key'         => 'pixelmaster_api',
            'label'       => 'PixelMaster API',
            'description' => 'Programmatic access to manage containers, settings, and quotas via REST API.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #10
        [
            'key'         => 'user_id',
            'label'       => 'User ID',
            'description' => 'Assign and persist a consistent User ID across sessions for cross-device tracking.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #11
        [
            'key'         => 'open_container_bot_index',
            'label'       => 'Open Container for Bot Index',
            'description' => 'Allow search engine bots to access your container for SEO-safe tag delivery.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #12
        [
            'key'         => 'click_id_restorer',
            'label'       => 'Click ID Restorer',
            'description' => 'Restore and pass click IDs (gclid, fbclid, etc.) lost due to browser privacy restrictions.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #13
        [
            'key'         => 'service_account',
            'label'       => 'Service Account',
            'description' => 'Create dedicated service accounts for API authentication and container management.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #14  ── Pro+ only ────────────────────────────────────────────────────
        [
            'key'         => 'logs',
            'label'       => 'Logs',
            'description' => 'Access detailed request and event logs to debug and audit your data pipeline.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #15
        [
            'key'         => 'cookie_keeper',
            'label'       => 'Cookie Keeper',
            'description' => 'Extend first-party cookie lifetimes server-side to preserve attribution across sessions.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #16
        [
            'key'         => 'bot_detection',
            'label'       => 'Bot Detection',
            'description' => 'Automatically identify and filter bot traffic before it reaches your analytics.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #17
        [
            'key'         => 'ad_blocker_info',
            'label'       => 'Ad Blocker Info',
            'description' => 'Detect whether a visitor is using an ad blocker and enrich events with this signal.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #18
        [
            'key'         => 'poas_data_feed',
            'label'       => 'POAS Data Feed',
            'description' => 'Feed Profit-on-Ad-Spend (POAS) data directly into your ad platforms for smart bidding.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #19
        [
            'key'         => 'pixelmaster_store',
            'label'       => 'PixelMaster Store',
            'description' => 'Access the PixelMaster add-on marketplace: install custom templates, connectors, and extensions.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 2 — ADVANCED INFRASTRUCTURE
    // ──────────────────────────────────────────────────────────────────────────
    private const PHASE_2_INFRA = [

        // #1  ── Business+ only ────────────────────────────────────────────────
        [
            'key'         => 'multi_zone_infrastructure',
            'label'       => 'Multi-zone Infrastructure',
            'description' => 'Deploy your container across multiple availability zones for maximum uptime and resilience.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #2
        [
            'key'         => 'multi_domains',
            'label'       => 'Multi Domains',
            'description' => 'Attach multiple custom domains to a single container (up to 20 on Business, 50 on Enterprise, unlimited on Custom).',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #3
        [
            'key'         => 'monitoring',
            'label'       => 'Monitoring',
            'description' => 'Real-time uptime monitoring and alerting for your sGTM containers.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #4
        [
            'key'         => 'file_proxy',
            'label'       => 'File Proxy',
            'description' => 'Proxy third-party JavaScript files (analytics.js, fbevents.js, etc.) through your own domain.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #5
        [
            'key'         => 'xml_to_json',
            'label'       => 'XML to JSON',
            'description' => 'Automatically convert XML data feeds and payloads to JSON in your server-side pipeline.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #6
        [
            'key'         => 'block_request_by_ip',
            'label'       => 'Block Request by IP',
            'description' => 'Block or allowlist specific IP ranges from hitting your sGTM container.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #7
        [
            'key'         => 'schedule_requests',
            'label'       => 'Schedule Requests',
            'description' => 'Schedule and defer outbound requests to third-party endpoints at specific times.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #8
        [
            'key'         => 'request_delay',
            'label'       => 'Request Delay',
            'description' => 'Introduce configurable delays to outbound requests for rate-limit compliance.',
            'plans'       => ['business', 'enterprise', 'custom'],
        ],

        // #9  ── Custom only ─────────────────────────────────────────────────
        [
            'key'         => 'custom_logs_retention',
            'label'       => 'Custom Logs Retention',
            'description' => 'Define a bespoke log retention period beyond the standard plan limits.',
            'plans'       => ['custom'],
        ],

        // #10
        [
            'key'         => 'dedicated_ip',
            'label'       => 'Dedicated IP',
            'description' => 'Get a static, dedicated IP address for your sGTM container for IP whitelisting workflows.',
            'plans'       => ['custom'],
        ],

        // #11
        [
            'key'         => 'private_cluster',
            'label'       => 'Private Cluster',
            'description' => 'Run your sGTM container on a fully isolated, private infrastructure cluster.',
            'plans'       => ['custom'],
        ],
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 3 — ACCOUNT MANAGEMENT
    // ──────────────────────────────────────────────────────────────────────────
    private const PHASE_3_ACCOUNT = [

        // #1  ── All plans ─────────────────────────────────────────────────────
        [
            'key'         => 'transfer_ownership',
            'label'       => 'Transfer Ownership',
            'description' => 'Transfer full account ownership to another user or organisation.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #2
        [
            'key'         => 'consolidated_invoice',
            'label'       => 'Consolidated Invoice',
            'description' => 'Receive a single consolidated invoice for all containers and add-ons on your account.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #3
        [
            'key'         => 'share_access',
            'label'       => 'Share Access to Account',
            'description' => 'Grant team members role-based access to your containers and settings.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #4
        [
            'key'         => 'two_factor_auth',
            'label'       => '2FA',
            'description' => 'Protect your account with Time-based One-Time Password (TOTP) two-factor authentication.',
            'plans'       => ['free', 'pro', 'business', 'enterprise', 'custom'],
        ],

        // #5  ── Pro+ ───────────────────────────────────────────────────────────
        [
            'key'         => 'google_sheets_connection',
            'label'       => 'Google Sheets Connection',
            'description' => 'Sync tracking data and event reports directly to Google Sheets.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #6  ── Custom only ────────────────────────────────────────────────────
        [
            'key'         => 'single_sign_on',
            'label'       => 'Single Sign-On (SSO)',
            'description' => 'Integrate with your corporate identity provider (SAML / OIDC) for centralised login.',
            'plans'       => ['custom'],
        ],
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 4 — CONNECTIONS
    // ──────────────────────────────────────────────────────────────────────────
    private const PHASE_4_CONNECTIONS = [

        // #1  ── Pro+ ───────────────────────────────────────────────────────────
        [
            'key'         => 'data_manager_api',
            'label'       => 'Data Manager API',
            'description' => 'Programmatically manage and push first-party data directly into your sGTM data layer.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #2
        [
            'key'         => 'google_ads_connection',
            'label'       => 'Google Ads Connection',
            'description' => 'Send enhanced conversion data directly to Google Ads via server-side API.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #3
        [
            'key'         => 'microsoft_ads_connection',
            'label'       => 'Microsoft Ads Connection',
            'description' => 'Send conversion events to Microsoft Advertising (Bing Ads) via Conversion API.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],

        // #4
        [
            'key'         => 'meta_custom_audiences',
            'label'       => 'Meta Custom Audiences',
            'description' => 'Build and sync Meta (Facebook) Custom Audiences using server-side first-party data.',
            'plans'       => ['pro', 'business', 'enterprise', 'custom'],
        ],
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // PLAN DEFINITIONS — quotas & pricing per tier
    // ──────────────────────────────────────────────────────────────────────────
    private const PLAN_META = [
        'free' => [
            'name'          => 'Free',
            'description'   => 'Get started with server-side tracking at no cost.',
            'price_monthly' => 0,
            'price_yearly'  => 0,
            'request_limit' => 10_000,
            'log_retention' => 0,
            'multi_domains' => 1,
        ],
        'pro' => [
            'name'          => 'Pro',
            'description'   => 'Advanced tracking features for growing businesses.',
            'price_monthly' => 17,
            'price_yearly'  => 200,
            'request_limit' => 500_000,
            'log_retention' => 3,
            'multi_domains' => 1,
        ],
        'business' => [
            'name'          => 'Business',
            'description'   => 'High-volume infrastructure with multi-zone resilience.',
            'price_monthly' => 83,
            'price_yearly'  => 1_000,
            'request_limit' => 5_000_000,
            'log_retention' => 10,
            'multi_domains' => 20,
        ],
        'enterprise' => [
            'name'          => 'Enterprise',
            'description'   => 'Enterprise-grade tracking with sales-negotiated pricing.',
            'price_monthly' => 0,
            'price_yearly'  => 0,
            'request_limit' => 50_000_000,
            'log_retention' => 30,
            'multi_domains' => 50,
        ],
        'custom' => [
            'name'          => 'Custom',
            'description'   => 'Fully bespoke infrastructure, features, and pricing by arrangement.',
            'price_monthly' => 0,
            'price_yearly'  => 0,
            'request_limit' => -1,
            'log_retention' => -1,
            'multi_domains' => -1,
        ],
    ];

    // ──────────────────────────────────────────────────────────────────────────
    // SEEDER ENTRY POINT
    // ──────────────────────────────────────────────────────────────────────────

    public function run(): void
    {
        // Merge all phases into one flat feature registry
        $allFeatures = array_merge(
            self::PHASE_1_CORE,
            self::PHASE_2_INFRA,
            self::PHASE_3_ACCOUNT,
            self::PHASE_4_CONNECTIONS,
        );

        // Build per-plan feature arrays from the registry
        $planFeatures     = $this->buildPlanFeatureArrays($allFeatures);
        $planFeaturesJson = $this->buildPlanFeaturesJson($allFeatures);

        $this->command->line('');
        $this->command->line('  <fg=cyan>PixelMaster sGTM — Subscription Plans Seeder</>');
        $this->command->line('  ─────────────────────────────────────────────');
        $this->command->line('  Phase 1 Core Features       : <fg=green>' . count(self::PHASE_1_CORE) . ' features</>');
        $this->command->line('  Phase 2 Advanced Infra      : <fg=green>' . count(self::PHASE_2_INFRA) . ' features</>');
        $this->command->line('  Phase 3 Account Management  : <fg=green>' . count(self::PHASE_3_ACCOUNT) . ' features</>');
        $this->command->line('  Phase 4 Connections         : <fg=green>' . count(self::PHASE_4_CONNECTIONS) . ' features</>');
        $this->command->line('  Total features registered   : <fg=yellow>' . count($allFeatures) . '</>');
        $this->command->line('');

        foreach (self::PLAN_META as $planKey => $meta) {
            SubscriptionPlan::updateOrCreate(
                ['plan_key' => $planKey],
                [
                    'name'          => $meta['name'],
                    'description'   => $meta['description'],
                    'price_monthly' => $meta['price_monthly'],
                    'price_yearly'  => $meta['price_yearly'],
                    'currency'      => 'USD',
                    'is_active'     => true,

                    // Raw feature keys array — used for gate checks
                    'features'      => $planFeatures[$planKey],

                    // Labelled feature map — used for display / API responses
                    'features_json' => $planFeaturesJson[$planKey],

                    // Quotas
                    'quotas'        => [
                        'events'        => $meta['request_limit'],
                        'log_retention' => $meta['log_retention'],
                        'multi_domains' => $meta['multi_domains'],
                    ],
                ]
            );

            $count = count($planFeatures[$planKey]);
            $this->command->line("  ✅  <fg=white>{$meta['name']}</> plan seeded — <fg=green>{$count} features</>");
        }

        $this->command->line('');
        $this->command->info('  All 5 subscription plans seeded successfully.');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Build a flat list of feature keys per plan.
     *
     * @param  array  $features  All phase features combined
     * @return array<string, string[]>  e.g. ['free' => ['custom_domain', ...], ...]
     */
    private function buildPlanFeatureArrays(array $features): array
    {
        $map = array_fill_keys(array_keys(self::PLAN_META), []);

        foreach ($features as $feature) {
            foreach ($feature['plans'] as $plan) {
                $map[$plan][] = $feature['key'];
            }
        }

        return $map;
    }

    /**
     * Build a labelled feature map per plan for display / API consumption.
     *
     * @param  array  $features  All phase features combined
     * @return array<string, array<string, array>>
     *   e.g. ['free' => ['custom_domain' => ['label' => '...', 'description' => '...'], ...], ...]
     */
    private function buildPlanFeaturesJson(array $features): array
    {
        $map = array_fill_keys(array_keys(self::PLAN_META), []);

        foreach ($features as $feature) {
            foreach ($feature['plans'] as $plan) {
                $map[$plan][$feature['key']] = [
                    'label'       => $feature['label'],
                    'description' => $feature['description'],
                ];
            }
        }

        return $map;
    }

    /**
     * Check whether a specific plan includes a given feature key.
     * Useful in unit tests and policy guards.
     */
    public static function planHasFeature(string $planKey, string $featureKey): bool
    {
        $allFeatures = array_merge(
            self::PHASE_1_CORE,
            self::PHASE_2_INFRA,
            self::PHASE_3_ACCOUNT,
            self::PHASE_4_CONNECTIONS,
        );

        foreach ($allFeatures as $feature) {
            if ($feature['key'] === $featureKey) {
                return in_array($planKey, $feature['plans'], true);
            }
        }

        return false;
    }
}
