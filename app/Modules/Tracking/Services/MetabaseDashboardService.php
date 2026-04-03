<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MetabaseDashboardService
 *
 * Auto-provisions a Metabase dashboard for a tenant container when it goes live.
 *
 * Flow:
 *   1. GET  /api/session            → acquire admin token
 *   2. POST /api/database           → register ClickHouse as data source (once per tenant)
 *   3. POST /api/dashboard          → clone the sGTM template dashboard
 *   4. POST /api/dashboard/{id}/cards → pin cards with container_id filter
 *   5. POST /api/public/dashboard/{uuid} → get signed embed URL
 *   6. Save dashboard_id + embed_token on container.settings
 *
 * ENV:
 *   METABASE_URL=https://metabase.yourdomain.com
 *   METABASE_ADMIN_EMAIL=admin@yourdomain.com
 *   METABASE_ADMIN_PASSWORD=secret
 *   METABASE_TEMPLATE_DASHBOARD_ID=1   (the master template to clone)
 *   METABASE_EMBED_SECRET=<32-char secret set in Metabase Admin → Embed>
 */
class MetabaseDashboardService
{
    private string $baseUrl;
    private string $adminEmail;
    private string $adminPassword;
    private string $embedSecret;
    private ?string $token = null;
    private string $type = 'self_hosted';

    public function __construct()
    {
        $this->configureFor('self_hosted'); // Default init
    }

    public function configureFor(string $type = 'self_hosted'): self
    {
        $this->type = ($type === 'cloud') ? 'cloud' : 'self_hosted';
        $prefix = strtoupper($this->type); // SELF_HOSTED or CLOUD
        $db     = \App\Models\GlobalSetting::getByGroup('metabase');
        
        $this->baseUrl       = rtrim($db["{$this->type}_url"] ?? $db['url'] ?? config("tracking.metabase.{$this->type}.url", env("METABASE_{$prefix}_URL", env('METABASE_URL', ''))), '/');
        $this->adminEmail    = $db["{$this->type}_admin_email"] ?? $db['admin_email'] ?? config("tracking.metabase.{$this->type}.email", env("METABASE_{$prefix}_ADMIN_EMAIL", env('METABASE_ADMIN_EMAIL', '')));
        $this->adminPassword = $db["{$this->type}_admin_password"] ?? $db['admin_password'] ?? config("tracking.metabase.{$this->type}.password", env("METABASE_{$prefix}_ADMIN_PASSWORD", env('METABASE_ADMIN_PASSWORD', '')));
        $this->embedSecret   = $db["{$this->type}_embed_secret"] ?? $db['embed_secret'] ?? config("tracking.metabase.{$this->type}.embed_secret", env("METABASE_{$prefix}_EMBED_SECRET", env('METABASE_EMBED_SECRET', '')));
        
        $this->token = null; // Clear token for the new instance
        
        return $this;
    }

    public function provision(TrackingContainer $container): bool
    {
        // Switch to the container's preferred Metabase instance
        $this->configureFor($container->metabase_type ?? 'self_hosted');

        if (!$this->isConfigured()) {
            Log::info('[Metabase] Not configured — skipping dashboard provisioning', [
                'container_id' => $container->id,
                'type'         => $container->metabase_type,
            ]);
            return false;
        }

        try {
            $token = $this->getToken();
            $databaseId = $this->ensureClickHouseDatabase($token, $container->tenant_id ?? 0);
            
            $globalSettings = \App\Models\GlobalSetting::getByGroup('metabase');
            $containerSettings = $container->settings ?? [];

            // 1. Overview Dashboard (Primary)
            $typeKey = $container->metabase_type === 'cloud' ? 'cloud_' : '';
            $templateId = (int) ($globalSettings["{$typeKey}template_id"] ?? config("tracking.metabase.{$container->metabase_type}.template_dashboard_id", 1));
            
            $dashboardId = $this->cloneDashboard($token, $templateId, $container);
            
            if ($dashboardId) {
                $this->applyContainerFilter($token, $dashboardId, $container->id, $databaseId);
                $containerSettings['dashboard_id'] = $dashboardId;
                $containerSettings['dashboard_url'] = "{$this->baseUrl}/public/dashboard/{$dashboardId}";
                $containerSettings['embed_token'] = $this->generateEmbedToken($dashboardId, $container->id);
                $containerSettings['metabase_type'] = $container->metabase_type;
            }

            // 2. Real-time Dashboard (Secondary)
            $realtimeTemplateId = (int) ($globalSettings['realtime_template_id'] ?? 0);
            if ($realtimeTemplateId > 0) {
                $realtimeId = $this->cloneDashboard($token, $realtimeTemplateId, $container);
                if ($realtimeId) {
                    $this->applyContainerFilter($token, $realtimeId, $container->id, $databaseId);
                    $containerSettings['realtime_dashboard_id'] = $realtimeId;
                    $containerSettings['realtime_embed_token'] = $this->generateEmbedToken($realtimeId, $container->id);
                }
            }

            // 3. Persist
            $container->settings = $containerSettings;
            $container->save();

            Log::info('[Metabase] Dashboard(s) provisioned', [
                'container_id' => $container->id,
                'overview_id'  => $dashboardId,
                'realtime_id'  => $realtimeId ?? null,
            ]);

            return true;

        } catch (\Throwable $e) {
            Log::error('[Metabase] Provisioning failed', [
                'container_id' => $container->id,
                'error'        => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Generate an administrative (global) embed token for the platform admin.
     * This token does NOT include a container_id filter, allowing cross-tenant BI.
     */
    public function generateAdminEmbedToken(int $dashboardId): array
    {
        if (!$this->isConfigured()) {
            return ['error' => 'Metabase not configured'];
        }

        $embedToken = $this->generateEmbedToken($dashboardId, null);
        $dashboardUrl = $this->baseUrl . "/public/dashboard/{$dashboardId}";

        return [
            'url'         => $dashboardUrl,
            'embed_token' => $embedToken,
            'full_embed'  => "{$dashboardUrl}#token={$embedToken}",
        ];
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->adminEmail) && !empty($this->adminPassword);
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function getToken(): string
    {
        if ($this->token) {
            return $this->token;
        }

        $response = Http::post("{$this->baseUrl}/api/session", [
            'username' => $this->adminEmail,
            'password' => $this->adminPassword,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Metabase auth failed: ' . $response->body());
        }

        $this->token = $response->json('id');
        return $this->token;
    }

    private function ensureClickHouseDatabase(string $token, int $tenantId): int
    {
        // Fetch ClickHouse details from GlobalSetting (matching what the tracker uses)
        // Note: For now we use the 'self_hosted' as default for Metabase internal source 
        // unless we want to support per-tenant DBs later.
        $type = 'self_hosted'; 
        $host = \App\Models\GlobalSetting::get("{$type}_host", config('tracking.clickhouse.host', 'localhost'));
        $port = (int) \App\Models\GlobalSetting::get("{$type}_port", config('tracking.clickhouse.port', 8123));
        $db   = \App\Models\GlobalSetting::get("{$type}_database", config('tracking.clickhouse.database', 'sgtm_tracking'));
        $user = \App\Models\GlobalSetting::get("{$type}_user", config('tracking.clickhouse.username', 'default'));
        $pass = \App\Models\GlobalSetting::get("{$type}_password", config('tracking.clickhouse.password', ''));

        // Check if already exists
        $list = Http::withHeaders(['X-Metabase-Session' => $token])
            ->get("{$this->baseUrl}/api/database");

        foreach ($list->json('data') ?? [] as $database) {
            if (($database['details']['host'] ?? '') === $host
                && ($database['details']['dbname'] ?? '') === $db) {
                return $database['id'];
            }
        }

        // Create new ClickHouse connection
        $create = Http::withHeaders(['X-Metabase-Session' => $token])
            ->post("{$this->baseUrl}/api/database", [
                'name'   => 'sGTM ClickHouse (' . ucfirst($type) . ')',
                'engine' => 'clickhouse',
                'details' => [
                    'host'    => $host,
                    'port'    => $port,
                    'dbname'  => $db,
                    'user'    => $user,
                    'password'=> $pass,
                    'ssl'     => ($port === 8443),
                ],
            ]);

        return (int) $create->json('id');
    }

    private function cloneDashboard(string $token, int $templateId, TrackingContainer $container): ?int
    {
        $response = Http::withHeaders(['X-Metabase-Session' => $token])
            ->post("{$this->baseUrl}/api/dashboard/{$templateId}/copy", [
                'name'        => "sGTM — {$container->name} (Container #{$container->id})",
                'description' => "Auto-generated for container {$container->container_id}",
                'is_deep_copy'=> true,
            ]);

        return $response->successful() ? (int) $response->json('id') : null;
    }

    private function applyContainerFilter(string $token, int $dashboardId, int $containerId, int $databaseId): void
    {
        // Get current dashboard cards
        $dashboard = Http::withHeaders(['X-Metabase-Session' => $token])
            ->get("{$this->baseUrl}/api/dashboard/{$dashboardId}");

        $cards = $dashboard->json('ordered_cards') ?? [];

        // Add a sticky container_id parameter filter
        Http::withHeaders(['X-Metabase-Session' => $token])
            ->put("{$this->baseUrl}/api/dashboard/{$dashboardId}", [
                'parameters' => [[
                    'id'     => 'container_filter',
                    'name'   => 'Container ID',
                    'type'   => 'id',
                    'slug'   => 'container_id',
                    'default' => $containerId,
                ]],
            ]);
    }

    public function generateEmbedToken(int $dashboardId, ?int $containerId = null): string
    {
        $secret = $this->embedSecret;
        if (!$secret) {
            Log::error('[Metabase] Missing METABASE_EMBED_SECRET for JWT signing');
            return '';
        }

        $params = [];
        if ($containerId) {
            // Metabase expects parameter name to match the slug in dashboard settings
            $params['container_id'] = (string) $containerId;
        }

        $payload = [
            'resource' => ['dashboard' => $dashboardId],
            'params'   => (object) $params,
            'exp'      => time() + (3600 * 24), // 24-hour expiration for safety
            'iat'      => time(),
        ];

        try {
            // Manual HS256 JWT implementation
            $header    = $this->base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
            $body      = $this->base64UrlEncode(json_encode($payload));
            $signature = hash_hmac('sha256', "{$header}.{$body}", $secret, true);
            $sig       = $this->base64UrlEncode($signature);

            return "{$header}.{$body}.{$sig}";
        } catch (\Throwable $e) {
            Log::error('[Metabase] JWT Signing failed: ' . $e->getMessage());
            return '';
        }
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
