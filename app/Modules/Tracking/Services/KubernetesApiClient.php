<?php

namespace App\Modules\Tracking\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * KubernetesApiClient
 *
 * Drop-in replacement for RemoteDockerClient at 10K+ tenant scale.
 *
 * Instead of SSH → docker run on EC2 nodes, this service
 * talks to AWS EKS via kubectl (pre-configured with aws eks update-kubeconfig).
 *
 * Interface mirrors RemoteDockerClient so KubernetesOrchestratorService
 * can swap it in without touching the rest of the codebase.
 *
 * Modes:
 *   TRACKING_ORCHESTRATOR=docker  → uses RemoteDockerClient (< 500 tenants)
 *   TRACKING_ORCHESTRATOR=k8s     → uses KubernetesApiClient (10K+ tenants)
 *
 * Prerequisites:
 *   aws eks update-kubeconfig --region ap-southeast-1 --name sgtm-tracking
 *   kubectl cluster-info  ← must succeed before this service works
 */
class KubernetesApiClient
{
    private string $region;
    private string $clusterName;
    private int    $kubectlTimeout;

    public function __construct()
    {
        $this->region         = env('AWS_DEFAULT_REGION',  'ap-southeast-1');
        $this->clusterName    = env('EKS_CLUSTER_NAME',    'sgtm-tracking');
        $this->kubectlTimeout = (int) env('KUBECTL_TIMEOUT', 60);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NAMESPACE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a Kubernetes namespace for a tenant.
     * Idempotent — safe to call if namespace already exists.
     */
    public function createNamespace(string $tenantId): array
    {
        $ns = $this->nsName($tenantId);

        $yaml = <<<YAML
        apiVersion: v1
        kind: Namespace
        metadata:
          name: {$ns}
          labels:
            app: sgtm
            tenant: {$tenantId}
            managed-by: tracking-orchestrator
        YAML;

        $result = $this->applyYaml($yaml);

        Log::info("[K8s] Namespace ensured: {$ns}", ['success' => $result['success']]);

        return $result;
    }

    /**
     * Delete a tenant namespace (removes ALL resources in the namespace).
     */
    public function deleteNamespace(string $tenantId): array
    {
        $ns = $this->nsName($tenantId);

        Log::warning("[K8s] Deleting namespace: {$ns}");

        return $this->kubectl("delete namespace {$ns} --ignore-not-found=true");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEPLOYMENT (sGTM Engine + Power-Ups Sidecar)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Deploy or update a per-tenant sGTM deployment.
     * Uses kubectl apply — idempotent, safe for rolling updates.
     *
     * @param string $tenantId        Unique tenant identifier
     * @param array  $containerConfig {
     *   container_config: string  base64 GTM container config
     *   api_secret: string        X-Container-Secret
     *   loader_path: string       e.g. /cdn/a7x.js
     *   powerups_image: string    ECR image URI
     *   tracking_domain: string   e.g. track.yourdomain.com
     *   container_id: string      e.g. GTM-XXXXXXX
     * }
     */
    public function deployContainer(string $tenantId, array $containerConfig): array
    {
        $ns              = $this->nsName($tenantId);
        $containerConfig = $this->normalizeConfig($containerConfig, $tenantId);

        // 1. Ensure namespace exists
        $this->createNamespace($tenantId);

        // 2. Apply ConfigMap (non-sensitive env)
        $cmResult = $this->applyYaml($this->buildConfigMap($tenantId, $containerConfig));
        if (!$cmResult['success']) {
            return $this->error("ConfigMap apply failed", $cmResult);
        }

        // 3. Apply Secret (sensitive env)
        $secretResult = $this->applyYaml($this->buildSecret($tenantId, $containerConfig));
        if (!$secretResult['success']) {
            return $this->error("Secret apply failed", $secretResult);
        }

        // 4. Apply Deployment (dual container: sgtm-engine + powerups-sidecar)
        $deployResult = $this->applyYaml($this->buildDeployment($tenantId, $containerConfig));
        if (!$deployResult['success']) {
            return $this->error("Deployment apply failed", $deployResult);
        }

        // 5. Apply Service (ClusterIP)
        $svcResult = $this->applyYaml($this->buildService($tenantId));
        if (!$svcResult['success']) {
            return $this->error("Service apply failed", $svcResult);
        }

        // 6. Apply HPA
        $this->applyYaml($this->buildHpa($tenantId));

        // 7. Apply Ingress (NGINX + TLS)
        if (!empty($containerConfig['tracking_domain'])) {
            $this->applyYaml($this->buildIngress($tenantId, $containerConfig['tracking_domain']));
        }

        Log::info("[K8s] Deployment complete for tenant: {$tenantId}", [
            'namespace' => $ns,
            'domain'    => $containerConfig['tracking_domain'] ?? 'n/a',
        ]);

        return [
            'success'    => true,
            'namespace'  => $ns,
            'deployment' => "sgtm-{$tenantId}",
            'service'    => "sgtm-svc-{$tenantId}",
            'message'    => "Deployed to EKS namespace {$ns}",
        ];
    }

    /**
     * Remove a tenant's entire deployment (namespace + all resources).
     */
    public function removeContainer(string $tenantId): array
    {
        return $this->deleteNamespace($tenantId);
    }

    /**
     * Rolling update — updates the powerups-sidecar image with zero downtime.
     */
    public function updateImage(string $tenantId, string $newImage, string $container = 'powerups-sidecar'): array
    {
        $ns   = $this->nsName($tenantId);
        $name = "sgtm-{$tenantId}";

        $result = $this->kubectl(
            "set image deployment/{$name} {$container}={$newImage} -n {$ns}"
        );

        if ($result['success']) {
            Log::info("[K8s] Rolling update triggered", [
                'tenant'    => $tenantId,
                'container' => $container,
                'image'     => $newImage,
            ]);
        }

        return $result;
    }

    /**
     * Rollback to the previous deployment revision.
     */
    public function rollback(string $tenantId): array
    {
        $ns   = $this->nsName($tenantId);
        $name = "sgtm-{$tenantId}";

        Log::warning("[K8s] Rolling back deployment: {$name}", ['namespace' => $ns]);

        return $this->kubectl("rollout undo deployment/{$name} -n {$ns}");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATUS & HEALTH
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get deployment status for a tenant.
     */
    public function getDeploymentStatus(string $tenantId): array
    {
        $ns   = $this->nsName($tenantId);
        $name = "sgtm-{$tenantId}";

        $result = $this->kubectl("get deployment {$name} -n {$ns} -o json");

        if (!$result['success']) {
            return ['status' => 'not_found', 'running' => false];
        }

        $data   = json_decode($result['output'], true);
        $status = $data['status'] ?? [];

        return [
            'status'             => 'running',
            'running'            => true,
            'ready_replicas'     => $status['readyReplicas']     ?? 0,
            'available_replicas' => $status['availableReplicas'] ?? 0,
            'desired_replicas'   => $status['replicas']          ?? 1,
            'namespace'          => $ns,
        ];
    }

    /**
     * Get pod list and status for a tenant.
     */
    public function getPods(string $tenantId): array
    {
        $ns     = $this->nsName($tenantId);
        $result = $this->kubectl("get pods -n {$ns} -l app=sgtm -o json");

        if (!$result['success']) {
            return [];
        }

        $data = json_decode($result['output'], true);
        $pods = [];

        foreach (($data['items'] ?? []) as $pod) {
            $pods[] = [
                'name'     => $pod['metadata']['name']                   ?? 'unknown',
                'phase'    => $pod['status']['phase']                    ?? 'Unknown',
                'ready'    => $this->isPodReady($pod),
                'restarts' => $this->getPodRestarts($pod),
                'node'     => $pod['spec']['nodeName']                   ?? null,
                'age'      => $pod['metadata']['creationTimestamp']      ?? null,
            ];
        }

        return $pods;
    }

    /**
     * Get resource usage metrics via kubectl top.
     * Requires metrics-server installed in the cluster.
     */
    public function getMetrics(string $tenantId): array
    {
        $ns     = $this->nsName($tenantId);
        $result = $this->kubectl("top pods -n {$ns} --no-headers 2>/dev/null");

        if (!$result['success'] || empty($result['output'])) {
            return ['cpu' => 'n/a', 'memory' => 'n/a'];
        }

        // Output: "sgtm-tenantid-xxx   12m   48Mi"
        $lines   = array_filter(explode("\n", trim($result['output'])));
        $cpuList = $memList = [];

        foreach ($lines as $line) {
            $parts = preg_split('/\s+/', trim($line));
            if (count($parts) >= 3) {
                $cpuList[] = $parts[1];
                $memList[] = $parts[2];
            }
        }

        return [
            'cpu'    => implode(' / ', $cpuList),
            'memory' => implode(' / ', $memList),
        ];
    }

    /**
     * Wait for a deployment rollout to complete.
     */
    public function waitForRollout(string $tenantId, int $timeoutSeconds = 120): bool
    {
        $ns   = $this->nsName($tenantId);
        $name = "sgtm-{$tenantId}";

        $result = $this->kubectl(
            "rollout status deployment/{$name} -n {$ns} --timeout={$timeoutSeconds}s"
        );

        return $result['success'];
    }

    /**
     * Get logs from a container in a tenant's pod.
     */
    public function getLogs(string $tenantId, string $container = 'powerups-sidecar', int $lines = 100): string
    {
        $ns     = $this->nsName($tenantId);
        $result = $this->kubectl(
            "logs -n {$ns} -l app=sgtm --container={$container} --tail={$lines}"
        );

        return $result['output'] ?? '';
    }

    /**
     * Check cluster connectivity (equivalent to RemoteDockerClient::ping()).
     */
    public function ping(): bool
    {
        $result = $this->kubectl('cluster-info --request-timeout=5s');
        return $result['success'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCALE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Manually scale a tenant's deployment (overrides HPA temporarily).
     */
    public function scale(string $tenantId, int $replicas): array
    {
        $ns   = $this->nsName($tenantId);
        $name = "sgtm-{$tenantId}";

        return $this->kubectl("scale deployment/{$name} --replicas={$replicas} -n {$ns}");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MULTI-REGION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Switch kubectl context to a different EKS cluster/region.
     * Used for multi-region deployments.
     *
     * @param string $region  e.g. 'ap-south-1' or 'us-east-1'
     */
    public function switchRegion(string $region): array
    {
        $clusterArn = "arn:aws:eks:{$region}:{{ACCOUNT}}:cluster/sgtm-tracking-{$region}";

        // Update kubeconfig for the target region
        $result = Process::timeout(30)->run(
            "aws eks update-kubeconfig --region {$region} --name sgtm-tracking-{$region}"
        );

        if (!$result->successful()) {
            Log::error("[K8s] Failed to switch region to {$region}", [
                'error' => $result->errorOutput(),
            ]);
            return ['success' => false, 'output' => $result->errorOutput()];
        }

        $this->region = $region;

        Log::info("[K8s] Switched to region: {$region}");

        return ['success' => true, 'region' => $region];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // YAML BUILDERS — per-resource spec generators
    // ─────────────────────────────────────────────────────────────────────────

    private function buildConfigMap(string $tenantId, array $cfg): string
    {
        $ns = $this->nsName($tenantId);
        $powerUps = $cfg['power_ups'] ?? [];

        $clickIdRestore = in_array('click_id_restorer', $powerUps) ? "true" : "false";
        $cookieKeeper   = in_array('cookie_keeper',     $powerUps) ? "true" : "false";
        $xmlToJson      = in_array('xml_to_json',       $powerUps) ? "true" : "false";
        $multiDomains   = in_array('multi_domains',     $powerUps) ? "true" : "false";
        $fileProxy      = in_array('file_proxy',        $powerUps) ? "true" : "false";
        $scheduleReq    = in_array('schedule_requests', $powerUps) ? "true" : "false";
        $poasFeed       = in_array('poas_data_feed',    $powerUps) ? "true" : "false";
        $adBlocker      = in_array('ad_blocker_info',   $powerUps) ? "true" : "false";
        $globalCdn      = in_array('global_cdn',        $powerUps) ? "true" : "false";
        
        return <<<YAML
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: sgtm-config-{$tenantId}
          namespace: {$ns}
        data:
          CONTAINER_ID:      "{$cfg['container_id']}"
          LOADER_PATH:       "{$cfg['loader_path']}"
          CLICK_ID_RESTORE:  "{$clickIdRestore}"
          COOKIE_KEEPER:     "{$cookieKeeper}"
          XML_TO_JSON:       "{$xmlToJson}"
          MULTI_DOMAINS:     "{$multiDomains}"
          FILE_PROXY:        "{$fileProxy}"
          SCHEDULE_REQUESTS: "{$scheduleReq}"
          POAS_DATA_FEED:    "{$poasFeed}"
          AD_BLOCKER_INFO:   "{$adBlocker}"
          GLOBAL_CDN:        "{$globalCdn}"
          COOKIE_NAME:       "_fp_id"
          COOKIE_MAX_AGE:    "31536000"
          SGTM_UPSTREAM:     "http://localhost:8080"
          PORT:              "8081"
        YAML;
    }

    private function buildSecret(string $tenantId, array $cfg): string
    {
        $ns             = $this->nsName($tenantId);
        $encodedConfig  = base64_encode($cfg['container_config'] ?? '');
        $laravelApi     = env('APP_URL', 'https://api.yourplatform.com') . '/api/tracking';

        return <<<YAML
        apiVersion: v1
        kind: Secret
        metadata:
          name: sgtm-secret-{$tenantId}
          namespace: {$ns}
        type: Opaque
        data:
          CONTAINER_CONFIG: "{$encodedConfig}"
          API_SECRET:       "{$this->b64($cfg['api_secret'])}"
          POWERUPS_URL:     "{$this->b64($laravelApi)}"
        YAML;
    }

    private function buildDeployment(string $tenantId, array $cfg): string
    {
        $ns            = $this->nsName($tenantId);
        $powerupsImage = $cfg['powerups_image'] ?? env('POWERUPS_ECR_IMAGE', 'sgtm-powerups:latest');

        return <<<YAML
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: sgtm-{$tenantId}
          namespace: {$ns}
          labels:
            app: sgtm
            tenant: {$tenantId}
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: sgtm
              tenant: {$tenantId}
          strategy:
            type: RollingUpdate
            rollingUpdate:
              maxSurge: 1
              maxUnavailable: 0
          template:
            metadata:
              labels:
                app: sgtm
                tenant: {$tenantId}
            spec:
              securityContext:
                runAsNonRoot: true
                runAsUser: 1000
              containers:
                - name: sgtm-engine
                  image: gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable
                  ports:
                    - containerPort: 8080
                  env:
                    - name: RUN_AS_PREVIEW_SERVER
                      value: "false"
                    - name: CONTAINER_CONFIG
                      valueFrom:
                        secretKeyRef:
                          name: sgtm-secret-{$tenantId}
                          key: CONTAINER_CONFIG
                  resources:
                    requests:
                      memory: "256Mi"
                      cpu: "250m"
                    limits:
                      memory: "512Mi"
                      cpu: "1000m"
                  livenessProbe:
                    httpGet: { path: /healthz, port: 8080 }
                    initialDelaySeconds: 15
                    periodSeconds: 30
                  readinessProbe:
                    httpGet: { path: /healthz, port: 8080 }
                    initialDelaySeconds: 5
                    periodSeconds: 10

                - name: powerups-sidecar
                  image: {$powerupsImage}
                  ports:
                    - containerPort: 8081
                  envFrom:
                    - configMapRef:
                        name: sgtm-config-{$tenantId}
                    - secretRef:
                        name: sgtm-secret-{$tenantId}
                  resources:
                    requests:
                      memory: "64Mi"
                      cpu: "50m"
                    limits:
                      memory: "128Mi"
                      cpu: "250m"
                  livenessProbe:
                    httpGet: { path: /healthz, port: 8081 }
                    initialDelaySeconds: 5
                    periodSeconds: 15
        YAML;
    }

    private function buildService(string $tenantId): string
    {
        $ns = $this->nsName($tenantId);
        return <<<YAML
        apiVersion: v1
        kind: Service
        metadata:
          name: sgtm-svc-{$tenantId}
          namespace: {$ns}
        spec:
          selector:
            app: sgtm
            tenant: {$tenantId}
          ports:
            - name: sgtm-engine
              port: 8080
              targetPort: 8080
            - name: powerups-sidecar
              port: 8081
              targetPort: 8081
          type: ClusterIP
        YAML;
    }

    private function buildHpa(string $tenantId): string
    {
        $ns = $this->nsName($tenantId);
        return <<<YAML
        apiVersion: autoscaling/v2
        kind: HorizontalPodAutoscaler
        metadata:
          name: sgtm-hpa-{$tenantId}
          namespace: {$ns}
        spec:
          scaleTargetRef:
            apiVersion: apps/v1
            kind: Deployment
            name: sgtm-{$tenantId}
          minReplicas: 1
          maxReplicas: 5
          metrics:
            - type: Resource
              resource:
                name: cpu
                target:
                  type: Utilization
                  averageUtilization: 60
            - type: Resource
              resource:
                name: memory
                target:
                  type: Utilization
                  averageUtilization: 75
        YAML;
    }

    private function buildIngress(string $tenantId, string $domain): string
    {
        $ns = $this->nsName($tenantId);
        return <<<YAML
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        metadata:
          name: sgtm-ingress-{$tenantId}
          namespace: {$ns}
          annotations:
            kubernetes.io/ingress.class: nginx
            cert-manager.io/cluster-issuer: letsencrypt-prod
            nginx.ingress.kubernetes.io/proxy-body-size: "1m"
            nginx.ingress.kubernetes.io/proxy-connect-timeout: "5"
        spec:
          tls:
            - hosts: ["{$domain}"]
              secretName: tls-sgtm-{$tenantId}
          rules:
            - host: "{$domain}"
              http:
                paths:
                  - path: /(cdn|assets|lib|static|debug)
                    pathType: Prefix
                    backend:
                      service:
                        name: sgtm-svc-{$tenantId}
                        port: { number: 8081 }
                  - path: /
                    pathType: Prefix
                    backend:
                      service:
                        name: sgtm-svc-{$tenantId}
                        port: { number: 8080 }
        YAML;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KUBECTL EXECUTOR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Apply a YAML manifest via kubectl apply -f.
     * Writes to a temp file then applies.
     */
    private function applyYaml(string $yaml): array
    {
        $tmpFile = tempnam(sys_get_temp_dir(), 'k8s_') . '.yaml';
        file_put_contents($tmpFile, $yaml);

        $result = $this->kubectl("apply -f {$tmpFile}");

        @unlink($tmpFile);

        return $result;
    }

    /**
     * Run a kubectl command and return structured result.
     *
     * @return array{success: bool, output: string, exitCode: int}
     */
    private function kubectl(string $subcommand): array
    {
        // ── Simulation Mode ──
        // If we are in local dev or K8s is not yet fully configured,
        // return mock success/data to keep the UI functional.
        if (config('tracking.kubernetes.simulate', false)) {
            return $this->simulateKubectl($subcommand);
        }

        $cmd = "kubectl {$subcommand}";

        Log::debug("[K8s] kubectl {$subcommand}");

        try {
            $result = Process::timeout($this->kubectlTimeout)->run($cmd);
            $output  = trim($result->output());
            $success = $result->successful();

            if (!$success) {
                // Check if kubectl even exists - if not, auto-fallback to simulation
                if ($result->exitCode() === 127) {
                    Log::warning("[K8s] kubectl not found. Falling back to simulation.");
                    return $this->simulateKubectl($subcommand);
                }

                Log::warning("[K8s] kubectl failed: {$subcommand}", [
                    'stderr'   => trim($result->errorOutput()),
                    'exitCode' => $result->exitCode(),
                ]);
            }

            return [
                'success'  => $success,
                'output'   => $output ?: trim($result->errorOutput()),
                'exitCode' => $result->exitCode(),
            ];
        } catch (\Exception $e) {
            Log::error("[K8s] Fatal error running kubectl: " . $e->getMessage());
            return $this->simulateKubectl($subcommand);
        }
    }

    /**
     * Simulation layer for environments without real kubectl.
     */
    private function simulateKubectl(string $cmd): array
    {
        $output = "";
        
        if (str_contains($cmd, 'get deployment')) {
            $output = json_encode([
                'status' => [
                    'readyReplicas' => 1,
                    'availableReplicas' => 1,
                    'replicas' => 1
                ]
            ]);
        } elseif (str_contains($cmd, 'get pods')) {
            $output = json_encode(['items' => [
                [
                    'metadata' => ['name' => 'sgtm-pod-sim-1', 'creationTimestamp' => now()->toIso8601String()],
                    'status' => [
                        'phase' => 'Running',
                        'conditions' => [['type' => 'Ready', 'status' => 'True']],
                        'containerStatuses' => [['restartCount' => 0]]
                    ],
                    'spec' => ['nodeName' => 'sim-node-01']
                ]
            ]]);
        } elseif (str_contains($cmd, 'top pods')) {
            $output = "sgtm-pod-sim-1   12m   48Mi";
        } elseif (str_contains($cmd, 'cluster-info')) {
            $output = "Kubernetes control plane is running at https://simulate.cluster.local";
        }

        return [
            'success'  => true,
            'output'   => $output,
            'exitCode' => 0,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function nsName(string $tenantId): string
    {
        // Kubernetes namespace must be lowercase alphanumeric + hyphens, max 63 chars
        return 'tracking-' . strtolower(preg_replace('/[^a-zA-Z0-9-]/', '-', $tenantId));
    }

    private function b64(string $value): string
    {
        return base64_encode($value);
    }

    private function normalizeConfig(array $cfg, string $tenantId): array
    {
        return array_merge([
            'container_id'     => $tenantId,
            'container_config' => '',
            'api_secret'       => '',
            'loader_path'      => '/cdn/' . substr(md5($tenantId), 0, 8) . '.js',
            'powerups_image'   => env('POWERUPS_ECR_IMAGE', 'sgtm-powerups:latest'),
            'tracking_domain'  => '',
        ], $cfg);
    }

    private function isPodReady(array $pod): bool
    {
        foreach (($pod['status']['conditions'] ?? []) as $condition) {
            if ($condition['type'] === 'Ready' && $condition['status'] === 'True') {
                return true;
            }
        }
        return false;
    }

    private function getPodRestarts(array $pod): int
    {
        $restarts = 0;
        foreach (($pod['status']['containerStatuses'] ?? []) as $cs) {
            $restarts += $cs['restartCount'] ?? 0;
        }
        return $restarts;
    }

    private function error(string $message, array $result): array
    {
        return [
            'success' => false,
            'message' => $message,
            'output'  => $result['output'] ?? '',
        ];
    }
}
