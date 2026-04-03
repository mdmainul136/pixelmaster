<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\DockerNode;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Actions\ContainerLifecycleAction;
use App\Modules\Tracking\Contracts\OrchestratorInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\File;

/**
 * Hybrid sGTM Docker Orchestrator.
 *
 * Deploys TWO containers per tenant:
 *  1. Google Official sGTM (gtm-cloud-image:stable) — tag processing engine
 *  2. Power-Ups Sidecar (node:20-alpine) — Custom Loader, Click ID, Debug UI
 *
 * Architecture:
 * ┌────────────────────────────────────────────────────────┐
 * │  NGINX Proxy (shared)                                  │
 * │  track.tenant.com → Power-Ups Sidecar → Google sGTM   │
 * │                                                        │
 * │  Routing:                                              │
 * │   /g/collect, /gtm.js  → Google sGTM (:sgtmPort)     │
 * │   /cdn/*.js, /debug    → Power-Ups   (:sidecarPort)  │
 * │   /healthz             → 200 OK                       │
 * └────────────────────────────────────────────────────────┘
 *
 * Tenant Flow:
 *  1. Tenant pastes Config String (base64 from GTM Admin)
 *  2. We parse it → extract GTM ID, env, auth
 *  3. Deploy Google sGTM with CONTAINER_CONFIG env
 *  4. Deploy Power-Ups sidecar alongside
 *  5. Generate NGINX config + SSL
 *  6. Return transport URL
 */
class DockerOrchestratorService implements OrchestratorInterface
{
    private string $sgtmImage;
    private string $sidecarImage;
    private string $networkName;
    private string $nginxConfigPath;
    private string $baseDomain;
    private int $portRangeStart;

    public function __construct(
        private ContainerLifecycleAction $lifecycle,
        private RemoteDockerClient $remoteDocker,
        private DockerNodeManager $nodeManager,
    ) {
        $this->sgtmImage      = config('tracking.docker.sgtm_image', config('tracking.docker.image', 'gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable'));
        $this->sidecarImage   = config('tracking.docker.sidecar_image', 'sgtm-powerups:latest');
        $this->networkName    = config('tracking.docker.network', 'tracking_network');
        $this->nginxConfigPath = config('tracking.docker.nginx_config_path', '/etc/nginx/sites-enabled');
        $this->baseDomain     = config('tracking.docker.base_domain', 'track.yourdomain.com');
        $this->portRangeStart = config('tracking.docker.port_range_start', 9000);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  1. DEPLOY FROM CONFIG STRING — PixelMaster-Style One-Step Deploy
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Deploy from a GTM Config String (base64).
     *
     * This is the primary deployment method (PixelMaster-style).
     * Tenant pastes the base64 config from GTM Admin → Container Settings.
     *
     * Example config: aWQ9R1RNLTVROThGTFJKJmVudj0xJmF1dGg9eVZVLUlWQ2Vhd01wakZ1eTEyY1RZZw==
     * Decoded: id=GTM-5Q98FLRJ&env=1&auth=yVU-IVCeawMpjFuy12cTYg
     */
    public function deployFromConfig(
        string $configString,
        string $name,
        ?string $customDomain = null
    ): array {
        // Step 1: Parse & validate config string
        $parsed = $this->parseConfigString($configString);

        if (!$parsed || empty($parsed['id'])) {
            throw new \InvalidArgumentException('Invalid GTM Config String. Expected base64-encoded string containing id, env, auth.');
        }

        // Step 2: Create or find container record
        $container = TrackingContainer::updateOrCreate(
            ['container_id' => $parsed['id']],
            [
                'name'             => $name,
                'container_config' => $configString,
                'is_active'        => true,
            ]
        );

        // Step 3: Deploy
        return $this->deploy($container, $customDomain);
    }

    /**
     * Parse a base64-encoded GTM Config String.
     *
     * @return array{id: string, env: string, auth: string}|null
     */
    public function parseConfigString(string $configString): ?array
    {
        $decoded = base64_decode($configString, true);

        if ($decoded === false) {
            return null;
        }

        parse_str($decoded, $params);

        if (empty($params['id'])) {
            return null;
        }

        return [
            'id'   => $params['id'],    // GTM-XXXXXX
            'env'  => $params['env'] ?? '1',
            'auth' => $params['auth'] ?? '',
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  2. DEPLOY — Full Hybrid Provisioning Pipeline
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Full deploy pipeline:
     *  1. Allocate ports (sGTM + sidecar)
     *  2. Run Google sGTM container (CONTAINER_CONFIG env)
     *  3. Run Power-Ups sidecar container
     *  4. Generate NGINX config with hybrid routing
     *  5. Reload NGINX
     *  6. (Optional) Request SSL
     */
    public function deploy(TrackingContainer $container, ?string $customDomain = null, ?string $preferredRegion = null): array
    {
        $sgtmName    = $this->makeContainerName($container, 'engine');
        $sidecarName = $this->makeContainerName($container, 'powerups');

        // ── Multi-Node: Select a node for this container ──
        $node = $this->resolveNode($container, $preferredRegion);

        $sgtmPort    = $this->allocatePort($container, $node);
        $sidecarPort = $sgtmPort + 1; // Sidecar always gets next port

        // Resolve the tracking domain
        $trackingDomain = $customDomain ?? $this->generateSubdomain($container);

        // ── Hybrid Scaling Strategy: Shared vs Dedicated ──
        if ($this->isSharedInfra($container)) {
            return $this->deployShared($container, $trackingDomain);
        }

        // Step 1: Deploy Google Official sGTM container
        $sgtmDockerId = $this->runSgtmContainer($sgtmName, $container, $sgtmPort);

        // Step 2: Deploy Power-Ups sidecar
        $sidecarDockerId = $this->runSidecarContainer($sidecarName, $container, $sidecarPort, $sgtmPort);

        // Step 3: Save domain, ports, and node assignment
        $container->update([
            'domain'         => $trackingDomain,
            'docker_port'    => $sgtmPort,
            'sidecar_port'   => $sidecarPort,
            'docker_node_id' => $node?->id,
        ]);

        // Step 4: Record lifecycle
        $this->lifecycle->provision($container, $sgtmDockerId, $sgtmPort);

        // Step 5: Generate NGINX reverse proxy config (hybrid routing)
        $this->generateNginxConfig($container, $trackingDomain, $sgtmPort, $sidecarPort);

        // Step 6: Reload NGINX
        $this->reloadNginx($container);

        // Step 7: Sync container count on node
        if ($node) {
            $this->nodeManager->syncContainerCount($node);
        }

        Log::info("[sGTM Hybrid] Deployed for {$container->container_id}", [
            'sgtm_id'      => $sgtmDockerId,
            'sidecar_id'   => $sidecarDockerId,
            'sgtm_port'    => $sgtmPort,
            'sidecar_port' => $sidecarPort,
            'domain'       => $trackingDomain,
            'node'         => $node?->name ?? 'self_hosted',
        ]);

        // Dispatch SSL issuance in the background
        \App\Modules\Tracking\Jobs\RequestSslJob::dispatch($container->id, $trackingDomain);

        return [
            'status'        => 'deployed',
            'deployment'    => 'dedicated',
            'sgtm_id'       => $sgtmDockerId,
            'sidecar_id'    => $sidecarDockerId,
            'sgtm_port'     => $sgtmPort,
            'sidecar_port'  => $sidecarPort,
            'domain'        => $trackingDomain,
            'node'          => $node?->name ?? 'self_hosted',
            'transport_url' => "https://{$trackingDomain}",
            'snippet'       => $this->generateSnippet($container, $trackingDomain),
        ];
    }

    /**
     * Deploy to Shared Infrastructure (Multi-tenant Sidecar)
     * No dedicated containers launched. Cost = $0.
     */
    private function deployShared(TrackingContainer $container, string $domain): array
    {
        $sharedSidecarPort = config('tracking.docker.shared_sidecar_port', 8100);

        // Update global mappings file so the shared sidecar knows this host
        $this->updateSharedMappings($container, $domain);

        $container->update([
            'domain'          => $domain,
            'deployment_type' => 'shared',
            'docker_status'   => 'active',
            'docker_port'     => null,
            'sidecar_port'    => $sharedSidecarPort,
        ]);

        // Generate NGINX config pointing to the shared cluster
        $this->generateNginxConfig($container, $domain, null, $sharedSidecarPort, true);
        $this->reloadNginx($container);

        // Dispatch SSL issuance in the background (DNS might take time)
        \App\Modules\Tracking\Jobs\RequestSslJob::dispatch($container->id, $domain);

        return [
            'status'        => 'deployed',
            'deployment'    => 'shared',
            'domain'        => $domain,
            'transport_url' => "https://{$domain}",
            'snippet'       => $this->generateSnippet($container, $domain),
        ];
    }

    /**
     * Update/etc/sgtm/mappings.json for the shared sidecar cluster.
     */
    private function updateSharedMappings(TrackingContainer $container, string $domain): void
    {
        $path = config('tracking.docker.mappings_path', '/etc/sgtm/mappings.json');

        // Ensure directory exists
        if (!File::exists(dirname($path))) {
            File::makeDirectory(dirname($path), 0755, true);
        }

        $mappings = [];
        if (File::exists($path)) {
            $mappings = json_decode(File::get($path), true) ?? [];
        }

        $mappings[$domain] = [
            'tenant_id'    => (int) $container->tenant_id,
            'container_id' => $container->container_id,
            'secret_key'   => $container->secret_key,
        ];

        File::put($path, json_encode($mappings, JSON_PRETTY_PRINT));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  3. STOP — Teardown Both Containers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public function stop(TrackingContainer $container): array
    {
        $domain = $container->domain;

        if ($container->deployment_type === 'shared') {
            $this->removeSharedMapping($domain);
        } else {
            $sgtmName    = $this->makeContainerName($container, 'engine');
            $sidecarName = $this->makeContainerName($container, 'powerups');
            // Stop both containers (remote or local)
            $this->executeDockerCommand("docker stop {$sgtmName} {$sidecarName} 2>/dev/null; docker rm {$sgtmName} {$sidecarName} 2>/dev/null", $container->node);
        }

        // Remove NGINX config
        $this->removeNginxConfig($container);
        $this->reloadNginx($container);

        // Sync container count on node
        if ($container->node) {
            $this->nodeManager->syncContainerCount($container->node);
        }

        // Update lifecycle
        $this->lifecycle->deprovision($container);

        Log::info("[sGTM Hybrid] Stopped containers for {$container->container_id}");

        return ['status' => 'stopped', 'container_id' => $container->container_id];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  4. HEALTH — Check Both Containers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public function healthCheck(TrackingContainer $container): array
    {
        if ($this->isSharedInfra($container)) {
            return $this->checkSharedInfraHealth();
        }

        $node = $container->node;
        if (!$node) {
            return ['status' => 'offline', 'error' => 'No node assigned'];
        }

        $sgtmName = $this->makeContainerName($container, 'engine');
        $res = $this->executeDockerCommand("docker inspect -f '{{.State.Status}}' {$sgtmName}", $node);

        if ($res['success']) {
            $status = trim($res['output']);
            return [
                'status' => $status === 'running' ? 'running' : 'degraded',
                'docker_status' => $status,
                'last_check' => $this->now(),
            ];
        }

        return ['status' => 'offline', 'error' => $res['error']];
    }

    /**
     * Monitoring: Check shared sidecar status and mapping sync.
     */
    public function checkSharedInfraHealth(): array
    {
        $sidecarName = config('tracking.docker.sidecar_container', 'sgtm_sidecar');
        $mappingPath = config('tracking.docker.mappings_path', '/etc/sgtm/mappings.json');
        
        // 1. Check if sidecar is running
        $res = $this->executeDockerCommand("docker inspect -f '{{.State.Status}}' {$sidecarName}");
        $isRunning = ($res['success'] && trim($res['output']) === 'running');

        // 2. Check mapping file existence & count
        $mappingsExist = File::exists($mappingPath);
        $mappingCount = 0;
        if ($mappingsExist) {
            $data = json_decode(File::get($mappingPath), true);
            $mappingCount = is_array($data) ? count($data) : 0;
        }

        // 3. Match against DB count
        $dbCount = TrackingContainer::where('is_active', true)
            ->whereIn('deployment_type', ['shared', 'docker_vps'])
            ->count();

        return [
            'status'         => ($isRunning && $mappingsExist) ? 'healthy' : 'degraded',
            'sidecar'        => $isRunning ? 'running' : 'stopped',
            'mappings_file'  => $mappingsExist ? 'exists' : 'missing',
            'mapping_count'  => $mappingCount,
            'db_active_sync' => ($mappingCount >= $dbCount) ? 'synced' : 'out_of_sync',
            'last_check'     => $this->now(),
        ];
    }

    /**
     * Temporarily suspend a container (billing/quota).
     * 
     * Stops the instance but keeps configurations/data intact.
     */
    public function suspend(TrackingContainer $container): array
    {
        Log::warning("[sGTM Orchestrator] Suspending container due to usage: {$container->container_id}");

        $domain = $container->domain;

        if ($this->isSharedInfra($container)) {
            $this->removeSharedMapping($domain);
        } else {
            $sgtmName    = $this->makeContainerName($container, 'engine');
            $sidecarName = $this->makeContainerName($container, 'powerups');
            
            // Stop but don't remove (remote or local)
            $this->executeDockerCommand("docker stop {$sgtmName} {$sidecarName} 2>/dev/null", $container->node);
        }

        // Disable NGINX proxying for this container
        $this->removeNginxConfig($container);
        $this->reloadNginx($container);

        $container->update([
            'is_active' => false,
            'docker_status' => 'suspended'
        ]);

        return ['status' => 'suspended', 'container_id' => $container->container_id];
    }

    /**
     * Resume a suspended container.
     */
    public function resume(TrackingContainer $container): array
    {
        Log::info("[sGTM Orchestrator] Resuming container: {$container->container_id}");
        
        // Deployment logic is idempotent and handles re-starting/re-mapping
        return $this->deploy($container);
    }

    /**
     * Remove a domain from mappings.json
     */
    private function removeSharedMapping(?string $domain): void
    {
        if (!$domain) return;
        $path = config('tracking.docker.mappings_path', '/etc/sgtm/mappings.json');
        if (File::exists($path)) {
            $mappings = json_decode(File::get($path), true) ?? [];
            if (isset($mappings[$domain])) {
                unset($mappings[$domain]);
                File::put($path, json_encode($mappings, JSON_PRETTY_PRINT));
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  5. UPDATE DOMAIN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public function updateDomain(TrackingContainer $container, string $newDomain): array
    {
        $oldDomain  = $container->domain;
        $isShared   = ($container->deployment_type === 'shared');
        $sgtmPort   = $container->docker_port;
        $sidecarPort = $container->sidecar_port ?? ($sgtmPort + 1);

        $this->removeNginxConfig($container);
        
        if ($isShared) {
            $this->removeSharedMapping($oldDomain);
            $this->updateSharedMappings($container, $newDomain);
        }

        $container->update(['domain' => $newDomain]);
        $this->generateNginxConfig($container, $newDomain, $sgtmPort, $sidecarPort, $isShared);
        $this->reloadNginx($container);
        $this->requestSsl($newDomain);

        Log::info("[sGTM Hybrid] Domain updated: {$oldDomain} → {$newDomain} (Shared: " . ($isShared ? 'Yes' : 'No') . ")");

        return [
            'old_domain'    => $oldDomain,
            'new_domain'    => $newDomain,
            'transport_url' => "https://{$newDomain}",
        ];
    }

    /**
     * Add an extra tracking domain to an existing container.
     * NGINX server_name will include all domains → same sGTM container.
     */
    public function addTrackingDomain(TrackingContainer $container, string $newDomain): array
    {
        $isShared   = ($container->deployment_type === 'shared');
        $extras     = $container->extra_domains ?? [];
        $extras[]   = $newDomain;
        $container->update(['extra_domains' => array_unique($extras)]);

        if ($isShared) {
            $this->updateSharedMappings($container, $newDomain);
        }

        // Regenerate NGINX with all domains
        $sgtmPort    = $container->docker_port;
        $sidecarPort = $container->sidecar_port ?? ($sgtmPort + 1);
        
        $this->removeNginxConfig($container);
        $this->generateNginxConfig($container, $container->domain, $sgtmPort, $sidecarPort, $isShared);
        $this->reloadNginx($container);

        // Request SSL for new domain (Background Job)
        \App\Modules\Tracking\Jobs\RequestSslJob::dispatch($container->id, $newDomain);

        $allDomains = array_merge([$container->domain], $container->extra_domains ?? []);

        Log::info("[sGTM Hybrid] Added tracking domain: {$newDomain}", [
            'container_id' => $container->container_id,
            'is_shared'    => $isShared,
            'all_domains'  => $allDomains,
        ]);

        return [
            'added_domain'  => $newDomain,
            'all_domains'   => $allDomains,
            'transport_url' => "https://{$newDomain}",
        ];
    }

    /**
     * Remove an extra tracking domain from a container.
     */
    public function removeTrackingDomain(TrackingContainer $container, string $domain): array
    {
        $isShared = ($container->deployment_type === 'shared');
        $extras   = $container->extra_domains ?? [];
        $extras   = array_values(array_filter($extras, fn($d) => $d !== $domain));
        $container->update(['extra_domains' => $extras]);

        if ($isShared) {
            $this->removeSharedMapping($domain);
        }

        // Regenerate NGINX without removed domain
        $sgtmPort    = $container->docker_port;
        $sidecarPort = $container->sidecar_port ?? ($sgtmPort + 1);
        
        $this->removeNginxConfig($container);
        $this->generateNginxConfig($container, $container->domain, $sgtmPort, $sidecarPort, $isShared);
        $this->reloadNginx($container);

        return [
            'removed_domain' => $domain,
            'all_domains'    => array_merge([$container->domain], $extras),
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  6. SSL — Let's Encrypt via Certbot
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public function requestSsl(string $domain): array
    {
        $command = "certbot --nginx -d {$domain} --non-interactive --agree-tos --email admin@{$this->baseDomain}";
        $result = $this->executeDockerCommand($command);

        Log::info("[sGTM Hybrid] SSL requested for {$domain}");

        return ['domain' => $domain, 'ssl' => $result['success'] ? 'issued' : 'failed'];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  7. SNIPPET GENERATOR — Embed Code for Tenant
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Generate the HTML snippet the tenant embeds on their website.
     */
    public function generateSnippet(TrackingContainer $container, ?string $domain = null): string
    {
        $domain       = $domain ?? $container->domain;
        $containerId  = $container->container_id;
        $measurementId = $container->settings['measurement_id'] ?? 'G-XXXXXXXXXX';
        $loaderPath   = $this->generateLoaderPath($container);
        $cdnEnabled   = \App\Models\GlobalSetting::get('cdn_tracking_enabled', false);
        $cdnProvider  = \App\Models\GlobalSetting::get('cdn_provider', 'none');
        $cdnHostname  = \App\Models\GlobalSetting::get('cdn_hostname', '');
        $cdnCustomUrl = \App\Models\GlobalSetting::get('cdn_tracking_url', '');
        
        $scriptDomain = "https://{$domain}";
        
        if ($cdnEnabled) {
            if (in_array($cdnProvider, ['cloudflare', 'bunny']) && !empty($cdnHostname)) {
                $scriptDomain = "https://" . rtrim($cdnHostname, '/');
            } elseif ($cdnProvider === 'custom' && !empty($cdnCustomUrl)) {
                $scriptDomain = rtrim($cdnCustomUrl, '/');
            }
        }

        return <<<HTML
<!-- sGTM Hybrid Tracking — {$containerId} -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
});
</script>
<script async src="{$scriptDomain}{$loaderPath}"></script>
<script>
gtag('js', new Date());
gtag('config', '{$measurementId}', {
    'transport_url': 'https://{$domain}',
    'first_party_collection': true
});
</script>
HTML;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  PRIVATE: Docker Container Runners
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Run Google Official sGTM container.
     * Uses CONTAINER_CONFIG env var — exactly like PixelMaster.
     */
    private function runSgtmContainer(string $name, TrackingContainer $container, int $port): string
    {
        $configString = $container->container_config;

        if (!$configString) {
            throw new \RuntimeException("No container_config set for {$container->container_id}. Paste the base64 config from GTM Admin.");
        }

        $envVars = [
            'CONTAINER_CONFIG'       => $configString,
            'ACCOUNT_SECRET'         => $container->secret_key,
            'RUN_AS_PREVIEW_SERVER'  => 'true',
            'POLICY_SCRIPT_URL'      => '',
        ];

        $envFlags = collect($envVars)
            ->map(fn ($val, $key) => "-e {$key}='{$val}'")
            ->implode(' ');

        $command = implode(' ', [
            'docker run -d',
            "--name {$name}",
            "--network {$this->networkName}",
            '--restart unless-stopped',
            '--memory 512m',
            '--cpus 1.0',
            "-p 127.0.0.1:{$port}:8080",
            $envFlags,
            $this->sgtmImage,
        ]);

        $result = $this->executeDockerCommand($command, $container->node);

        return trim($result['output'] ?? $name);
    }

    /**
     * Run Power-Ups sidecar container.
     * Provides: Custom Loader, Click ID Restorer, First-party Cookies, Debug UI.
     */
    private function runSidecarContainer(string $name, TrackingContainer $container, int $sidecarPort, int $sgtmPort): string
    {
        $laravelApi = config('app.url') . '/api/tracking';

        $envVars = [
            'SGTM_UPSTREAM'     => "http://127.0.0.1:{$sgtmPort}",
            'LARAVEL_API'       => $laravelApi,
            'API_SECRET'        => $container->secret_key,
            'PORT'              => $sidecarPort,
            'COOKIE_NAME'       => $container->settings['cookie_name'] ?? '_fp_id',
            'CUSTOM_SCRIPT'     => $container->settings['custom_script'] ?? '',
            'LOADER_PATH'       => $this->generateLoaderPath($container),
            'CLICK_ID_RESTORE'  => in_array('click_id_restorer', $container->power_ups ?? []) ? 'true' : 'false',
            'COOKIE_KEEPER'     => in_array('cookie_keeper',     $container->power_ups ?? []) ? 'true' : 'false',
            'XML_TO_JSON'       => in_array('xml_to_json',       $container->power_ups ?? []) ? 'true' : 'false',
            'MULTI_DOMAINS'     => in_array('multi_domains',     $container->power_ups ?? []) ? 'true' : 'false',
            'FILE_PROXY'        => in_array('file_proxy',        $container->power_ups ?? []) ? 'true' : 'false',
            'SCHEDULE_REQUESTS' => in_array('schedule_requests', $container->power_ups ?? []) ? 'true' : 'false',
            'POAS_DATA_FEED'    => in_array('poas_data_feed',    $container->power_ups ?? []) ? 'true' : 'false',
            'AD_BLOCKER_INFO'   => in_array('ad_blocker_info',   $container->power_ups ?? []) ? 'true' : 'false',
            'GLOBAL_CDN'        => in_array('global_cdn',        $container->power_ups ?? []) ? 'true' : 'false',
            'CONTAINER_ID'      => $container->container_id,
            'TENANT_ID'         => $container->tenant_id,
            
            // ── ClickHouse Hybrid Logic ──
            'CLICKHOUSE_TYPE'     => $type = ($container->clickhouse_type ?? 'self_hosted'),
            'CLICKHOUSE_HOST'     => \App\Models\GlobalSetting::get("{$type}_host", config('tracking.clickhouse.host')),
            'CLICKHOUSE_PORT'     => \App\Models\GlobalSetting::get("{$type}_port", ($type === 'cloud' ? '8443' : '8123')),
            'CLICKHOUSE_USER'     => \App\Models\GlobalSetting::get("{$type}_user", config('tracking.clickhouse.username')),
            'CLICKHOUSE_PASSWORD' => \App\Models\GlobalSetting::get("{$type}_password", config('tracking.clickhouse.password')),
            'CLICKHOUSE_DB'       => \App\Models\GlobalSetting::get("{$type}_database", config('tracking.clickhouse.database')),

            // ── Ingestion Pipeline Strategy ──
            'INGESTION_MODE'      => \App\Models\GlobalSetting::get('pipeline_ingestion_mode', 'direct'),
            'KAFKA_BROKERS'       => \App\Models\GlobalSetting::get('pipeline_kafka_brokers', env('KAFKA_BROKERS', 'localhost:9092')),
            'KAFKA_TOPIC'         => \App\Models\GlobalSetting::get('pipeline_kafka_topic', env('KAFKA_TOPIC_EVENTS', 'tracking-events')),
        ];

        $envFlags = collect($envVars)
            ->map(fn ($val, $key) => "-e {$key}='{$val}'")
            ->implode(' ');

        $command = implode(' ', [
            'docker run -d',
            "--name {$name}",
            "--network {$this->networkName}",
            '--restart unless-stopped',
            '--memory 128m',
            '--cpus 0.25',
            "-p 127.0.0.1:{$sidecarPort}:8081",
            $envFlags,
            $this->sidecarImage,
        ]);

        $result = $this->executeDockerCommand($command, $container->node);

        return trim($result['output'] ?? $name);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  PRIVATE: NGINX Config
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Generate NGINX server block with HYBRID routing:
     *   /g/collect, /gtm.js, /gtag/js  → Google sGTM (:sgtmPort)
     *   /cdn/*.js, /debug, /__debug    → Power-Ups Sidecar (:sidecarPort)
     *   /healthz                        → 200 OK
     */
    private function generateNginxConfig(
        TrackingContainer $container, 
        string $domain, 
        ?int $sgtmPort, 
        int $sidecarPort,
        bool $isShared = false
    ): void
    {
        $configName = $this->makeNginxConfigName($container);
        $configPath = "{$this->nginxConfigPath}/{$configName}";

        // 1. Build Upstreams
        $upstreams = "upstream powerups_{$container->id} { server 127.0.0.1:{$sidecarPort}; }\n";
        if (!$isShared && $sgtmPort) {
            $upstreams .= "upstream sgtm_{$container->id} { server 127.0.0.1:{$sgtmPort}; }\n";
        }

        // Feature: Geo-IP Headers Mapping
        $geoHeaders = "";
        if (in_array('geo_headers', $container->power_ups ?? [])) {
            $geoHeaders = "
        proxy_set_header X-Geo-Country \$geoip2_data_country_code;
        proxy_set_header X-Geo-City \$geoip2_data_city_name;
        proxy_set_header X-Geo-Region \$geoip2_data_region_code;";
        }

        // 2. Build Specific Locations for Dedicated sGTM
        $sgtmLocations = "";
        if (!$isShared && $sgtmPort) {
            $sgtmLocations = "
    location ~ ^/(g/collect|gtm\.js|gtag/js) {
        proxy_pass http://sgtm_{$container->id};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection \"\";
        {$geoHeaders}
    }";
        }

        $config = <<<NGINX
# Hybrid sGTM: {$container->container_id}
# Mode: {$container->deployment_type} (Shared: {$isShared})

{$upstreams}

server {
    listen 80;
    listen [::]:80;
    server_name {$this->buildServerName($container, $domain)};

    limit_req zone=tracking burst=100 nodelay;

    location /healthz {
        access_log off;
        return 200 'ok';
    }

    {$sgtmLocations}

    location / {
        proxy_pass http://powerups_{$container->id};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection \"\";
        {$geoHeaders}
        
        # CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
NGINX;

        $node = $container->node;
        if ($node && config('tracking.docker.mode') !== 'self_hosted') {
            // Write NGINX config to remote node via SSH
            $this->remoteDocker->writeFile($node, $configPath, $config);
        } else {
            File::put($configPath, $config);
        }

        Log::info("[sGTM Hybrid] NGINX config written: {$configPath}");
    }

    private function removeNginxConfig(TrackingContainer $container): void
    {
        $configName = $this->makeNginxConfigName($container);
        $configPath = "{$this->nginxConfigPath}/{$configName}";

        $node = $container->node;
        if ($node && config('tracking.docker.mode') !== 'self_hosted') {
            $this->remoteDocker->deleteFile($node, $configPath);
        } elseif (File::exists($configPath)) {
            File::delete($configPath);
        }

        Log::info("[sGTM Hybrid] NGINX config removed: {$configPath}");
    }

    private function reloadNginx(?TrackingContainer $container = null): void
    {
        $node = $container?->node;
        if ($node && config('tracking.docker.mode') !== 'self_hosted') {
            $this->remoteDocker->executeCommand($node, 'nginx -t && nginx -s reload');
        } else {
            $this->executeDockerCommand('nginx -t && nginx -s reload');
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  PRIVATE: Helpers
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private function makeContainerName(TrackingContainer $container, string $role = 'engine'): string
    {
        $slug = str_replace('-', '_', strtolower($container->container_id));
        return "sgtm_{$slug}_{$role}";
    }

    private function generateSubdomain(TrackingContainer $container): string
    {
        $slug = strtolower(str_replace(['GTM-', 'gtm-'], '', $container->container_id));
        return "track-{$slug}.{$this->baseDomain}";
    }

    public function isSharedInfra(TrackingContainer $container): bool
    {
        $tenant = $container->tenant;
        if (!$tenant) return true; // Default to shared if no tenant found

        // 1. Check direct override from Tenant record
        if ($tenant->plan === 'starter' || empty($tenant->plan)) {
            return true;
        }

        // 2. Check Plan table for price or metadata
        try {
            $planModel = \App\Models\SubscriptionPlan::where('plan_key', $tenant->plan)->first();
            if ($planModel) {
                // If price is 0, it's a free tier -> use shared infra
                if ((float) $planModel->price_monthly === 0.0) {
                    return true;
                }
                // Also check explicit quota flag if exists
                if (isset($planModel->quotas['shared_infra']) && $planModel->quotas['shared_infra'] === true) {
                    return true;
                }
            }
        } catch (\Exception $e) {
            Log::error("[sGTM Orchestrator] Failed to resolve plan shared status", ['error' => $e->getMessage()]);
        }

        return false;
    }

    private function allocatePort(TrackingContainer $container, ?DockerNode $node = null): int
    {
        if ($container->docker_port) {
            return $container->docker_port;
        }

        // Multi-node: allocate port on the assigned node
        if ($node) {
            return $this->nodeManager->allocatePortOnNode($node);
        }

        // Local fallback: allocate in pairs (sGTM=even, sidecar=odd)
        $usedPorts = TrackingContainer::whereNotNull('docker_port')
            ->pluck('docker_port')
            ->toArray();

        $port = $this->portRangeStart;
        while (in_array($port, $usedPorts) || in_array($port + 1, $usedPorts)) {
            $port += 2; // Skip in pairs
        }

        return $port;
    }

    /**
     * Resolve/assign a Docker node for a container.
     * In self_hosted mode, returns null. In remote mode, selects the least-loaded node.
     */
    private function resolveNode(TrackingContainer $container, ?string $preferredRegion = null): ?DockerNode
    {
        $mode = config('tracking.docker.mode', 'self_hosted');

        if ($mode === 'self_hosted') {
            return null;
        }

        // Reuse existing node if container is already assigned
        if ($container->docker_node_id) {
            return $container->node;
        }

        // Select the best available node
        $node = $this->nodeManager->selectNode($preferredRegion);

        if (!$node) {
            throw new \RuntimeException('No Docker nodes with available capacity. Register more nodes or increase limits.');
        }

        return $node;
    }

    private function makeNginxConfigName(TrackingContainer $container): string
    {
        return 'sgtm_' . str_replace('-', '_', strtolower($container->container_id)) . '.conf';
    }

    /**
     * Execute Docker command — delegates to RemoteDockerClient in remote mode.
     */
    private function executeDockerCommand(string $command, ?DockerNode $node = null): array
    {
        try {
            // Remote mode: delegate to RemoteDockerClient
            if ($node && config('tracking.docker.mode') !== 'self_hosted') {
                return $this->remoteDocker->execute($node, $command);
            }

            // Local mode: run directly
            $result = Process::run($command);
            return [
                'success' => $result->successful(),
                'output'  => $result->output(),
                'error'   => $result->errorOutput(),
            ];
        } catch (\Exception $e) {
            Log::error("[sGTM Hybrid] Command failed: {$command}", ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'output'  => '',
                'error'   => $e->getMessage(),
            ];
        }
    }

    private function now(): string
    {
        return now()->toDateTimeString();
    }

    /**
     * Generate an obfuscated loader path for ad-blocker bypass.
     */
    private function generateLoaderPath(TrackingContainer $container): string
    {
        if (!empty($container->settings['loader_path'])) {
            return $container->settings['loader_path'];
        }

        $segments = ['cdn', 'assets', 'lib', 'static', 'res', 'pkg'];
        $segment = $segments[array_rand($segments)];
        $hash = substr(md5($container->container_id . $container->id), 0, 6);
        $path = "/{$segment}/{$hash}.js";

        $settings = $container->settings ?? [];
        $settings['loader_path'] = $path;
        $container->update(['settings' => $settings]);

        return $path;
    }

    /**
     * Build server_name with primary domain + extra_domains.
     * Used in NGINX config: server_name track.tenant.saas.com track.custom.com;
     */
    private function buildServerName(TrackingContainer $container, string $primaryDomain): string
    {
        $domains = [$primaryDomain];
        $extraDomains = $container->extra_domains ?? [];

        if (!empty($extraDomains)) {
            $domains = array_merge($domains, $extraDomains);
        }

        return implode(' ', array_unique($domains));
    }
}
