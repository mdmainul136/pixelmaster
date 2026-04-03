<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;

/**
 * Central Power-Ups service.
 * Checks which power-ups are enabled for a container and applies them.
 *
 * Power-Up Registry:
 *   dedupe        - Event deduplication (Free)
 *   pii_hash      - Automatic PII hashing (Free)
 *   consent_mode  - Consent-based filtering (Free)
 *   cookie_extend - First-party cookie extension (Pro)
 *   geo_enrich    - Geo-IP enrichment (Pro)
 *   bot_filter    - Advanced bot filtering (Pro)
 */
class PowerUpService
{
    public function __construct(
        private readonly \App\Services\PlanManager $planManager
    ) {}

    /**
     * Check if a specific power-up is enabled for a container AND allowed by the plan.
     */
    public function isEnabled(TrackingContainer $container, string $powerUp): bool
    {
        // --- USAGE BASED PRICING SHIFT ---
        // 1. Check if allowed by current subscription plan (Entitlement) [DISABLED]
        // if (!$this->planManager->isFeatureEnabled($powerUp)) {
        //     return false;
        // }

        // 2. Check if the user has toggled it on
        $enabled = $container->power_ups ?? [];
        return in_array($powerUp, $enabled, true);
    }

    /**
     * Get all enabled power-ups for a container, filtered by plan permissions.
     */
    public function getEnabled(TrackingContainer $container): array
    {
        $enabled = $container->power_ups ?? [];
        
        // --- USAGE BASED PRICING SHIFT ---
        // Return all enabled power ups since the plan manager check is disabled
        return $enabled;
    }

    /**
     * Get the full registry of available power-ups.
     */
    public function registry(): array
    {
        return [
            // --- Tracking & Core Enhancement ---
            ['id' => 'custom_domain', 'name' => 'Custom Domain', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'globe', 'description' => 'Route tracking through your own first-party domain to bypass ITP restrictions.'],
            ['id' => 'custom_loader', 'name' => 'Custom Loader', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'zap', 'description' => 'Disguise GTM loader scripts with randomized filenames to avoid ad-blocker detection.'],
            ['id' => 'pixelmaster_analytics', 'name' => 'Analytics', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'bar-chart-3', 'description' => 'Real-time event visualization and performance monitoring for your server-side containers.'],
            ['id' => 'anonymizer', 'name' => 'Anonymizer', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'fingerprint', 'description' => 'Remove PII and sensitive user data from outgoing hits before they reach third-party vendors.'],
            ['id' => 'global_cdn', 'name' => 'Global CDN', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'globe', 'description' => 'Accelerate tracking delivery using our Global Cloudflare-backed edge network.'],
            ['id' => 'logs', 'name' => 'Enhanced Logs', 'category' => 'tracking', 'tier' => 'pro', 'icon' => 'file-text', 'description' => 'Store and query deep event logs in ClickHouse for high-performance debugging.'],
            ['id' => 'cookie_keeper', 'name' => 'Cookie Keeper', 'category' => 'tracking', 'tier' => 'pro', 'icon' => 'shield', 'description' => 'Restore and extend cookie lifetimes using server-side Set-Cookie headers.'],
            ['id' => 'click_id_restorer', 'name' => 'Click ID Restorer', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'mouse-pointer', 'description' => 'Automatically recover FBCLID and GCLID from incoming URLs to prevent attribution loss.'],
            ['id' => 'bot_detection', 'name' => 'Bot Detection', 'category' => 'tracking', 'tier' => 'pro', 'icon' => 'bug', 'description' => 'Filter out automated traffic and bot hits to maintain data cleanliness.'],
            ['id' => 'ad_blocker_info', 'name' => 'Ad Blocker Info', 'category' => 'tracking', 'tier' => 'pro', 'icon' => 'layers', 'description' => 'Detect if the source visitor is using an active ad-blocker and tag events accordingly.'],
            ['id' => 'poas_data_feed', 'name' => 'POAS Data Feed', 'category' => 'tracking', 'tier' => 'pro', 'icon' => 'activity', 'description' => 'Sync Profit on Ad Spend data directly into your tracking destinations.'],
            ['id' => 'geo_headers', 'name' => 'Geo-IP Headers', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'globe', 'description' => 'Enrich incoming requests with high-accuracy geographical data (City, Region, Lat/Long).'],
            ['id' => 'http_header_config', 'name' => 'HTTP Headers', 'category' => 'tracking', 'tier' => 'free', 'icon' => 'list', 'description' => 'Fully customize outgoing HTTP headers for fine-grained vendor integration control.'],

            // --- Connectivity & Data Sync ---
            ['id' => 'google_sheets_connection', 'name' => 'Google Sheets Sync', 'category' => 'connectivity', 'tier' => 'pro', 'icon' => 'table', 'description' => 'Automatically push filtered event data into Google Sheets rows for easy reporting.'],
            ['id' => 'data_manager_api', 'name' => 'Data Manager API', 'category' => 'connectivity', 'tier' => 'pro', 'icon' => 'code', 'description' => 'A programmatic endpoint to ingest and export raw event data from your sGTM instance.'],
            ['id' => 'google_ads_connection', 'name' => 'Google Ads Connection', 'category' => 'connectivity', 'tier' => 'pro', 'icon' => 'target', 'description' => 'Bypass limitations by sending Enhanced Conversions directly via sGTM-to-Google Ads API.'],
            ['id' => 'meta_custom_audiences', 'name' => 'Meta Audiences Sync', 'category' => 'connectivity', 'tier' => 'pro', 'icon' => 'users', 'description' => 'Keep your Meta Custom Audiences in sync using server-side event hashing.'],
            ['id' => 'microsoft_ads_connection', 'name' => 'Microsoft Ads Sync', 'category' => 'connectivity', 'tier' => 'pro', 'icon' => 'target', 'description' => 'Real-time conversion sync with Microsoft Advertising server-side endpoints.'],

            // --- Infrastructure & Advanced ---
            ['id' => 'multi_zone_infrastructure', 'name' => 'Multi-zone Infrastructure', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'cloud', 'description' => 'Deploy tracking pods across multiple cloud regions for maximum redundancy.'],
            ['id' => 'monitoring', 'name' => 'Real-time Monitoring', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'activity', 'description' => 'Deep infrastructure health checks and real-time pod resource observability.'],
            ['id' => 'file_proxy', 'name' => 'File Proxy', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'layers', 'description' => 'Proxy third-party scripts through your domain to ensure full first-party loading.'],
            ['id' => 'block_request_by_ip', 'name' => 'IP Blocking', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'shield-off', 'description' => 'Block malicious or internal IP ranges from firing tracking events at the edge.'],
            ['id' => 'schedule_requests', 'name' => 'Schedule Requests', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'calendar', 'description' => 'Delay or batch process tracking requests to manage downstream API rate limits.'],
            ['id' => 'request_delay', 'name' => 'Request Delay', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'clock', 'description' => 'Add synthetic jitter to incoming requests to mimic natural user behavior patterns.'],
            ['id' => 'xml_to_json', 'name' => 'XML to JSON', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'code', 'description' => 'Automatically transform legacy XML tracking payloads into modern JSON for easier processing.'],
            ['id' => 'multi_domains', 'name' => 'Multi Domains', 'category' => 'infrastructure', 'tier' => 'business', 'icon' => 'globe', 'description' => 'Map an unlimited number of custom domains to a single tracking container.'],
            ['id' => 'custom_logs_retention', 'name' => 'Custom Logs Retention', 'category' => 'infrastructure', 'tier' => 'custom', 'icon' => 'database', 'description' => 'Configure custom TTL policies for your event logs to meet data privacy compliance.'],

            // --- Platform Integrations ---
            ['id' => 'shopify_app', 'name' => 'Shopify Integration', 'category' => 'integration', 'tier' => 'free', 'icon' => 'shopping-cart', 'description' => 'Native Shopify app integration for automated web pixel deployment and sync.'],
            ['id' => 'wordpress_plugin', 'name' => 'WordPress Integration', 'category' => 'integration', 'tier' => 'free', 'icon' => 'zap', 'description' => 'One-click WordPress plugin deployment for full sGTM tracking compatibility.'],
            ['id' => 'magento_extension', 'name' => 'Magento Integration', 'category' => 'integration', 'tier' => 'free', 'icon' => 'shopping-bag', 'description' => 'High-performance Magento 2 extension for robust server-side event streaming.'],
            ['id' => 'wix_app', 'name' => 'Wix Integration', 'category' => 'integration', 'tier' => 'free', 'icon' => 'layers', 'description' => 'Seamless Wix application for quick first-party tracking domain configuration.'],
            ['id' => 'hubspot_app', 'name' => 'HubSpot CRM Sync', 'category' => 'integration', 'tier' => 'free', 'icon' => 'users', 'description' => 'Sync sGTM behavioral events directly to HubSpot contact timelines.'],
        ];
    }
}
