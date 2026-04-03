<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Tracking\Controllers\TrackingController;
use App\Modules\Tracking\Controllers\ProxyController;
use App\Modules\Tracking\Controllers\GatewayController;
use App\Modules\Tracking\Controllers\SignalsController;
use App\Modules\Tracking\Controllers\DiagnosticsController;
use App\Modules\Tracking\Controllers\InfrastructureController;
use App\Modules\Tracking\Controllers\NodeController;
use App\Modules\Tracking\Controllers\DashboardController;
use App\Modules\Tracking\Controllers\AnalyticsController;
use App\Modules\Tracking\Controllers\AttributionController;
use App\Modules\Tracking\Controllers\AiAdvisorController;
use App\Modules\Tracking\Controllers\MonitorController;
use App\Modules\Tracking\PoasFeed\Controllers\PoasFeedController;
use App\Modules\Tracking\CatalogueManager\Controllers\ProductSyncController;
use App\Modules\Tracking\Integrations\Shopify\Controllers\ShopifyAppController;
use App\Modules\Tracking\Integrations\Shopify\Controllers\ShopifyWebhookController;
use App\Modules\Tracking\Integrations\WooCommerce\Controllers\WooCommerceWebhookController;
use App\Modules\Tracking\Integrations\Generic\Controllers\EventIngestionController;
use App\Http\Middleware\IdentifyTenant;

// ── sGTM Public Proxy Routes (No Auth — served to browser JS) ──────────────────
Route::middleware([IdentifyTenant::class, \App\Http\Middleware\EnforceContainerOrigin::class, 'tracking.quota'])->prefix('tracking')->group(function () {
    Route::get('/gtm.js',       [TrackingController::class, 'proxyGtmJs']);        // Proxy gtm.js
    Route::get('/gtag/js',      [TrackingController::class, 'proxyGtagJs']);       // Proxy gtag.js
    Route::post('/mp/collect',  [TrackingController::class, 'collectMeasurementProtocol']); // MP endpoint
    Route::get('/sdk/v1/pixelmaster.min.js', [TrackingController::class, 'proxySdk']);       // SDK serving
});

// ── Public Tracking Feeds (POAS / Product Margin Feeds) ────────────────────────
Route::middleware([IdentifyTenant::class])->prefix('tracking/feeds')->group(function () {
    Route::get('/poas/{containerId}', [PoasFeedController::class, 'generate']);
});

// ── sGTM Internal Proxy Route (No Auth, identified by Container ID + API Secret) ──
Route::middleware([IdentifyTenant::class])->prefix('tracking/proxy')->group(function () {
    Route::post('/{containerId}', [ProxyController::class, 'handle']);
});

// ── Integration Webhook Routes (Public — HMAC/API-Key verified internally) ──────
Route::middleware([IdentifyTenant::class, 'tracking.quota'])->prefix('tracking')->group(function () {
    // Shopify webhooks (dedicated controller with HMAC verification)
    Route::post('/shopify/webhooks', [ShopifyWebhookController::class, 'handle']);

    // Shopify OAuth callback (public)
    Route::get('/shopify/callback', [ShopifyAppController::class, 'callback']);

    // WooCommerce webhooks
    Route::post('/woocommerce/webhooks', [WooCommerceWebhookController::class, 'handle']);

    // Generic event ingestion (API key in header)
    Route::post('/events/ingest', [EventIngestionController::class, 'ingest']);

    // Integration config endpoint (for plugins to fetch their config)
    Route::get('/config/{apiKey}', [EventIngestionController::class, 'getConfig']);

    // Universal Product Sync (For Plugins)
    Route::post('/products/sync', [ProductSyncController::class, 'sync']);
});

// ── Admin Management Routes ──────────────────────────────────────────────────────
$trackingAdminRoutes = function () {
    // Container CRUD
    Route::get('/containers',                    [TrackingController::class, 'index']);
    Route::post('/containers',                   [TrackingController::class, 'store'])->middleware('enforce.quota:sgtm_containers');
    Route::get('/containers/{id}/stats',         [TrackingController::class, 'stats']);
    Route::get('/containers/{id}/logs',          [TrackingController::class, 'logs']);
    
    // Destinations
    Route::get('/containers/{id}/destinations',  [TrackingController::class, 'getDestinations']);
    Route::post('/containers/{id}/destinations', [TrackingController::class, 'addDestination']);
    
    // Usage Metering (Billing)
    Route::get('/containers/{id}/usage',         [TrackingController::class, 'usage']);
    Route::get('/containers/{id}/usage/daily',   [TrackingController::class, 'usageDaily']);
    
    // Analytics (PixelMaster Analytics Equivalent)
    Route::get('/containers/{id}/analytics',     [TrackingController::class, 'analytics']);
    
    // Power-Ups
    Route::get('/power-ups',                     [TrackingController::class, 'powerUps']);
    Route::put('/containers/{id}/power-ups',     [TrackingController::class, 'updatePowerUps']);
    
    // Container Settings (custom_script, event_mappings, etc.)
    Route::put('/containers/{id}',               [TrackingController::class, 'update']);
    
    // Docker Control Plane (Orchestrator)
    Route::post('/containers/{id}/deploy',       [TrackingController::class, 'deploy']);
    Route::post('/containers/{id}/provision',    [TrackingController::class, 'provision']);
    Route::post('/containers/{id}/provision-analytics', [TrackingController::class, 'provisionAnalytics']);
    Route::post('/containers/{id}/deprovision',  [TrackingController::class, 'deprovision']);
    Route::get('/containers/{id}/health',        [TrackingController::class, 'health']);
    Route::put('/containers/{id}/domain',        [TrackingController::class, 'updateDomain']);

    // Tracking Domain Management (3-Case Architecture)
    Route::post('/containers/{id}/setup-domain',   [TrackingController::class, 'setupDomain']);
    Route::get('/suggest-domain',                  [TrackingController::class, 'suggestDomain']);
    Route::get('/containers/{id}/dns-instructions', [TrackingController::class, 'getDnsInstructions']);
    Route::post('/containers/{id}/add-domain',     [TrackingController::class, 'addTrackingDomain']);

    // Embed Snippet
    Route::get('/snippet',                           [TrackingController::class, 'getSnippet']);


    // Dedicated Gateways (Lightweight single-destination endpoints)
    Route::get('/gateways',                      [GatewayController::class, 'index']);
    Route::post('/gateways',                     [GatewayController::class, 'store']);
    Route::delete('/gateways/{id}',              [GatewayController::class, 'destroy']);

    // Signals Gateway (PixelMaster Signals Gateway Equivalent)
    Route::post('/signals/send',                 [SignalsController::class, 'send']);
    Route::get('/signals/pipelines/{id}',        [SignalsController::class, 'getPipelines']);
    Route::put('/signals/pipelines/{id}',        [SignalsController::class, 'updatePipelines']);
    Route::post('/signals/validate',             [SignalsController::class, 'validateEvent']);
    Route::get('/signals/emq/{id}',              [SignalsController::class, 'getEMQ']);

    // CAPI Diagnostics & Dataset Quality (Meta Direct Integration)
    Route::get('/diagnostics/{id}/quality',       [DiagnosticsController::class, 'quality']);
    Route::get('/diagnostics/{id}/match-keys',    [DiagnosticsController::class, 'matchKeys']);
    Route::get('/diagnostics/{id}/acr',           [DiagnosticsController::class, 'additionalConversions']);
    Route::get('/diagnostics/{id}/integration-kit', [DiagnosticsController::class, 'integrationKit']);
    Route::post('/diagnostics/test-event',        [DiagnosticsController::class, 'testEvent']);
    Route::post('/diagnostics/emq-preview',       [DiagnosticsController::class, 'emqPreview']);
    Route::get('/diagnostics/{id}/trends',        [DiagnosticsController::class, 'trends']);

    // ── Phase 27: Infrastructure APIs ────────────────────────────────────────────

    // DLQ / Retry Queue
    Route::get('/dlq/{id}/stats',                 [InfrastructureController::class, 'dlqStats']);
    Route::post('/dlq/{id}/retry',                [InfrastructureController::class, 'dlqRetry']);
    Route::delete('/dlq/purge',                   [InfrastructureController::class, 'dlqPurge']);

    // Consent Management
    Route::post('/consent/{id}',                  [InfrastructureController::class, 'recordConsent']);
    Route::get('/consent/{id}/{visitorId}',       [InfrastructureController::class, 'getConsent']);
    Route::get('/consent/{id}/stats',             [InfrastructureController::class, 'consentStats']);
    Route::get('/consent/{id}/banner',            [InfrastructureController::class, 'consentBanner']);
    Route::delete('/consent/{id}/revoke',         [InfrastructureController::class, 'revokeConsent']);

    // Channel Health Dashboard
    Route::get('/health/{id}/dashboard',          [InfrastructureController::class, 'channelHealth']);
    Route::get('/health/{id}/alerts',             [InfrastructureController::class, 'channelAlerts']);

    // Attribution
    Route::get('/attribution/{id}',               [InfrastructureController::class, 'attribution']);
    Route::get('/attribution/{id}/paths',         [InfrastructureController::class, 'conversionPaths']);

    // Tag Management
    Route::get('/tags/{id}',                      [InfrastructureController::class, 'listTags']);
    Route::post('/tags/{id}',                     [InfrastructureController::class, 'createTag']);
    Route::put('/tags/items/{tagId}',             [InfrastructureController::class, 'updateTag']);
    Route::delete('/tags/items/{tagId}',          [InfrastructureController::class, 'deleteTag']);

    // Supported Destinations Registry
    Route::get('/destinations/supported',         [InfrastructureController::class, 'destinations']);

    // ── Dashboard API (8 endpoints) ──────────────────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('/overview',          [DashboardController::class, 'overview']);
        Route::get('/events/live',       [DashboardController::class, 'liveStream']);
        Route::get('/events/feed',       [DashboardController::class, 'eventFeed']);
        Route::get('/platforms',         [DashboardController::class, 'platforms']);
        Route::get('/customers',         [DashboardController::class, 'customers']);
        Route::get('/customers/{id}',    [DashboardController::class, 'customerDetail']);
        Route::get('/containers',        [DashboardController::class, 'containers']);
        Route::get('/analytics',         [DashboardController::class, 'analytics']);
        Route::get('/hub',               [AnalyticsController::class, 'index']);
        Route::get('/attribution',       [AttributionController::class, 'index']);
        Route::get('/ai/insights',       [AiAdvisorController::class, 'insights']);

        // Monitoring & Infrastructure Sync
        Route::get('/health/shared',     [MonitorController::class, 'sharedInfraHealth']);
        Route::post('/health/sync',      [MonitorController::class, 'rebuildMappings']);
    });

    // Identity Resolution Webhook (from frontend: when user provides email/phone)
    Route::post('/identity/merge',           [DashboardController::class, 'mergeIdentity']);

    Route::prefix('shopify')->group(function () {
        Route::get('/install',               [ShopifyAppController::class, 'install']);
        Route::get('/shops',                 [ShopifyAppController::class, 'listShops']);
        Route::put('/shops/{id}/link',       [ShopifyAppController::class, 'linkContainer']);
        Route::put('/shops/{id}',            [ShopifyAppController::class, 'updateShop']);
        Route::post('/shops/{id}/reinstall', [ShopifyAppController::class, 'reinstall']);
        Route::get('/shops/{id}/status',     [ShopifyAppController::class, 'status']);
        Route::post('/shops/{id}/setup',     [ShopifyAppController::class, 'setup']);
        Route::post('/shops/{id}/sync-products', [ShopifyAppController::class, 'syncProducts']);
        Route::delete('/shops/{id}',         [ShopifyAppController::class, 'disconnect']);
    });
};

// 1. Standard Tracking Admin Routes
Route::middleware([
    IdentifyTenant::class,
    'tenant.auth',
    'quota.enforce'
])->prefix('tracking')->group($trackingAdminRoutes);


// ── Public Infrastructure Callbacks (Provisioning Only) ────────────────────────
Route::post('tracking/nodes/{node_id}/callback', [NodeController::class, 'provisionCallback'])->name('api.nodes.callback');

// ── Platform Admin: Node & Infrastructure Management ───────────────────────────
// These routes are for sass-dashboard (SaaS admin panel) only.
// Auth via Sanctum with admin middleware — NOT tenant-scoped.
Route::middleware(['tenant.auth'])->prefix('tracking/admin')->group(function () {

    // Node Pool CRUD
    Route::get('/nodes',                  [NodeController::class, 'index']);
    Route::post('/nodes',                 [NodeController::class, 'store']);
    Route::get('/nodes/{id}',             [NodeController::class, 'show']);
    Route::put('/nodes/{id}',             [NodeController::class, 'update']);
    Route::delete('/nodes/{id}',          [NodeController::class, 'destroy']);
    Route::get('/nodes/{id}/stats',       [NodeController::class, 'stats']);
    Route::post('/nodes/{id}/drain',      [NodeController::class, 'drain']);
    Route::post('/nodes/scale-up',        [NodeController::class, 'manualScaleUp']);
    Route::get('/cluster-status',         [NodeController::class, 'clusterStatus']);

    // Global Operations
    Route::post('/health-check',          [NodeController::class, 'healthCheck']);
    Route::get('/overview',               [NodeController::class, 'overview']);
    Route::get('/containers',             [NodeController::class, 'allContainers']);
    Route::get('/usage',                  [NodeController::class, 'usageOverview']);
});
