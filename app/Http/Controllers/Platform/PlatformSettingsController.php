<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use App\Services\CDN\CdnManagerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformSettingsController extends Controller
{
    /**
     * Display Metabase Configuration Page.
     */
    public function metabaseIndex()
    {
        $mbSettings = GlobalSetting::getByGroup('metabase');
        
        $data = [
            'self_hosted' => [
                'url'            => $mbSettings['self_hosted_url'] ?? $mbSettings['url'] ?? config('tracking.metabase.local.url', env('METABASE_URL', '')),
                'admin_email'    => $mbSettings['self_hosted_admin_email'] ?? $mbSettings['admin_email'] ?? config('tracking.metabase.local.email', env('METABASE_ADMIN_EMAIL', '')),
                'admin_password' => $mbSettings['self_hosted_admin_password'] ?? $mbSettings['admin_password'] ?? config('tracking.metabase.local.password', env('METABASE_ADMIN_PASSWORD', '')),
                'embed_secret'   => $mbSettings['self_hosted_embed_secret'] ?? $mbSettings['embed_secret'] ?? config('tracking.metabase.local.embed_secret', env('METABASE_EMBED_SECRET', '')),
                'template_id'    => $mbSettings['self_hosted_template_id'] ?? $mbSettings['template_id'] ?? config('tracking.metabase.local.template_dashboard_id', 1),
            ],
            'cloud' => [
                'url'            => $mbSettings['cloud_url'] ?? config('tracking.metabase.cloud.url', ''),
                'admin_email'    => $mbSettings['cloud_admin_email'] ?? config('tracking.metabase.cloud.email', ''),
                'admin_password' => $mbSettings['cloud_admin_password'] ?? config('tracking.metabase.cloud.password', ''),
                'embed_secret'   => $mbSettings['cloud_embed_secret'] ?? config('tracking.metabase.cloud.embed_secret', ''),
                'template_id'    => $mbSettings['cloud_template_id'] ?? config('tracking.metabase.cloud.template_dashboard_id', 1),
            ],
            'admin_dashboard_id' => $mbSettings['admin_dashboard_id'] ?? env('METABASE_ADMIN_DASHBOARD_ID', 2),
        ];

        return Inertia::render('Platform/Settings/MetabaseSettingsPage', [
            'settings' => $data,
        ]);
    }

    /**
     * Display ClickHouse Configuration Page.
     */
    public function clickhouseIndex()
    {
        return Inertia::render('Platform/Settings/ClickHouseSettingsPage', [
            'settings' => GlobalSetting::getByGroup('clickhouse')
        ]);
    }

    public function pipelineIndex()
    {
        return Inertia::render('Platform/Settings/PipelineSettingsPage', [
            'settings' => GlobalSetting::getByGroup('pipeline')
        ]);
    }

    /**
     * Display Infrastructure (CDN) Configuration Page.
     */
    public function infrastructureIndex()
    {
        $data = [
            'enabled'   => (bool) GlobalSetting::get('cdn_tracking_enabled', false),
            'url'       => GlobalSetting::get('cdn_tracking_url', ''),
            'provider'  => GlobalSetting::get('cdn_provider', 'none'),
            'hostname'  => GlobalSetting::get('cdn_hostname', ''),
            'cf_token'  => GlobalSetting::get('cdn_cloudflare_api_token', ''),
            'cf_zone'   => GlobalSetting::get('cdn_cloudflare_zone_id', ''),
            'bunny_key' => GlobalSetting::get('cdn_bunny_api_key', ''),
            'bunny_zone'=> GlobalSetting::get('cdn_bunny_pull_zone_id', ''),
        ];

        return Inertia::render('Platform/Settings/InfrastructureSettingsPage', [
            'settings' => $data,
        ]);
    }

    /**
     * Display Global Billing & Gateway Settings.
     */
    public function billingIndex()
    {
        $settings = GlobalSetting::getByGroup('billing');

        $defaults = [
            'stripe_key'           => $settings['stripe_key'] ?? config('services.stripe.key'),
            'stripe_secret'        => $settings['stripe_secret'] ?? config('services.stripe.secret'),
            'stripe_webhook_secret'=> $settings['stripe_webhook_secret'] ?? config('services.stripe.webhook.secret'),
            'sslcommerz_store_id'  => $settings['sslcommerz_store_id'] ?? config('services.sslcommerz.store_id'),
            'sslcommerz_store_password' => $settings['sslcommerz_store_password'] ?? config('services.sslcommerz.store_password'),
            'default_trial_days'   => $settings['default_trial_days'] ?? 7,
            'quota_alert_percent'  => $settings['quota_alert_percent'] ?? 80,
            'is_stripe_enabled'    => (bool)($settings['is_stripe_enabled'] ?? true),
            'is_sslcommerz_enabled'=> (bool)($settings['is_sslcommerz_enabled'] ?? true),
        ];

        return Inertia::render('Platform/Settings/BillingSettingsPage', [
            'settings' => $defaults,
        ]);
    }

    /**
     * Update Global Billing Settings.
     */
    public function updateBilling(Request $request)
    {
        $validated = $request->validate([
            'stripe_key'           => 'nullable|string',
            'stripe_secret'        => 'nullable|string',
            'stripe_webhook_secret'=> 'nullable|string',
            'sslcommerz_store_id'  => 'nullable|string',
            'sslcommerz_store_password' => 'nullable|string',
            'default_trial_days'   => 'required|integer|min:0',
            'quota_alert_percent'  => 'required|integer|min:50|max:100',
            'is_stripe_enabled'    => 'required|boolean',
            'is_sslcommerz_enabled'=> 'required|boolean',
        ]);

        foreach ($validated as $key => $value) {
            GlobalSetting::set($key, $value, 'billing');
        }

        return back()->with('success', 'Global billing configurations updated successfully.');
    }

    /**
     * Update Infrastructure Configurations (Metabase, ClickHouse, CDN).
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Metabase Self-hosted
            'self_hosted_url'            => 'nullable|url',
            'self_hosted_admin_email'    => 'nullable|email',
            'self_hosted_admin_password' => 'nullable|string',
            'self_hosted_embed_secret'   => 'nullable|string',
            'self_hosted_template_id'    => 'nullable|integer',
            
            // Metabase Cloud
            'cloud_url'            => 'nullable|url',
            'cloud_admin_email'    => 'nullable|email',
            'cloud_admin_password' => 'nullable|string',
            'cloud_embed_secret'   => 'nullable|string',
            'cloud_template_id'    => 'nullable|integer',

            // ClickHouse Self-hosted
            'ch_self_hosted_host'        => 'nullable|string',
            'ch_self_hosted_port'        => 'nullable|integer',
            'ch_self_hosted_database'    => 'nullable|string',
            'ch_self_hosted_user'        => 'nullable|string',
            'ch_self_hosted_password'    => 'nullable|string',

            // ClickHouse Cloud
            'ch_cloud_host'        => 'nullable|string',
            'ch_cloud_port'        => 'nullable|integer',
            'ch_cloud_database'    => 'nullable|string',
            'ch_cloud_user'        => 'nullable|string',
            'ch_cloud_password'    => 'nullable|string',

            'admin_dashboard_id'   => 'nullable|integer',
            'cdn_tracking_enabled'    => 'nullable|boolean',
            'cdn_tracking_url'        => 'nullable|url',
            'cdn_provider'            => 'nullable|string|in:none,cloudflare,bunny,custom',
            'cdn_hostname'            => 'nullable|string',
            'cdn_cloudflare_api_token'=> 'nullable|string',
            'cdn_cloudflare_zone_id'  => 'nullable|string',
            'cdn_bunny_api_key'       => 'nullable|string',
            'cdn_bunny_pull_zone_id'  => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                // Determine Group
                $group = 'metabase';
                $cleanKey = $key;
 
                if (str_starts_with($key, 'ch_')) {
                    $group = 'clickhouse';
                    $cleanKey = str_replace('ch_', '', $key);
                } elseif (str_starts_with($key, 'cdn_')) {
                    $group = 'infrastructure';
                    // We keep the cdn_ prefix for clarity in the key itself
                }
 
                GlobalSetting::set($cleanKey, $value, $group);
            }
        }

        return back()->with('success', 'Hybrid Infrastructure configurations updated successfully.');
    }

    public function testConnection(Request $request, 
        \App\Modules\Tracking\Services\MetabaseDashboardService $metabase,
        \App\Modules\Tracking\Services\ClickHouseEventLogService $clickhouse,
        \App\Services\CDN\CdnManagerService $cdnService
    ) {
        $type   = $request->input('type', 'self_hosted');
        $target = $request->input('target', 'metabase'); // metabase | clickhouse | cdn
        
        try {
            if ($target === 'cdn') {
                $result = $cdnService->purgeCache();
                return response()->json($result);
            }

            if ($target === 'metabase') {
                $metabase->configureFor($type);
                $result = $metabase->getToken();
            } else {
                $clickhouse->configureFor($type);
                // Simple version check for ClickHouse test
                $result = $clickhouse->queryRaw("SELECT version()");
            }
            
            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => "Successfully connected to " . ucfirst($target) . " " . ucfirst($type),
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Connection failed for {$target} {$type}: " . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => false,
            'message' => 'Could not acquire session or connection.',
        ], 500);
    }

    /**
     * Purge CDN Cache manually.
     */
    public function purgeCache(\App\Services\CDN\CdnManagerService $cdnService)
    {
        $result = $cdnService->purgeCache();
        
        if ($result['success']) {
            return back()->with('success', $result['message']);
        }
        
        return back()->with('error', $result['message']);
    }
}
