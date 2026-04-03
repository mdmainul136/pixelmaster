<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Tracking\DockerNode;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\DockerNodeManager;
use App\Modules\Tracking\Services\KubernetesApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Node Controller — Admin-only management of the Docker node pool.
 *
 * Endpoints at /api/tracking/admin/nodes
 * Used by sass-dashboard for infrastructure management.
 */
class NodeController extends Controller
{
    public function __construct(
        private DockerNodeManager $nodeManager
    ) {}

    /**
     * GET /api/tracking/admin/nodes — List all Docker nodes.
     */
    public function index(): JsonResponse
    {
        $nodes = DockerNode::withCount('containers')
            ->orderBy('name')
            ->get()
            ->map(function (\App\Models\Tracking\DockerNode $node) {
                return [
                    'id'               => $node->id,
                    'name'             => $node->name,
                    'host'             => $node->host,
                    'region'           => $node->region,
                    'status'           => $node->status,
                    'ssh_port'         => $node->ssh_port,
                    'containers'       => $node->current_containers,
                    'max_containers'   => $node->max_containers,
                    'capacity_percent' => $node->capacityPercent(),
                    'cpu_percent'      => $node->cpu_usage_percent,
                    'memory_percent'   => $node->memory_usage_percent,
                    'disk_percent'     => $node->disk_usage_percent,
                    'healthy'          => $node->isHealthy(),
                    'last_health'      => $node->last_health_check?->toISOString(),
                    'created_at'       => $node->created_at->toISOString(),
                ];
            });

        return response()->json(['nodes' => $nodes]);
    }

    /**
     * POST /api/tracking/admin/nodes — Register a new EC2 node.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|unique:docker_nodes,name',
            'host'             => 'required|string',
            'region'           => 'nullable|string',
            'ssh_port'         => 'nullable|integer',
            'max_containers'   => 'nullable|integer|min:1|max:200',
            'cpu_cores'        => 'nullable|integer',
            'memory_gb'        => 'nullable|integer',
            'port_range_start' => 'nullable|integer',
            'port_range_end'   => 'nullable|integer',
            'metadata'         => 'nullable|array',
        ]);

        $node = $this->nodeManager->registerNode(
            $validated['name'],
            $validated['host'],
            array_filter($validated, fn ($v) => $v !== null)
        );

        return response()->json([
            'message' => "Node {$node->name} registered successfully",
            'node'    => $node,
        ], 201);
    }

    /**
     * POST /api/tracking/admin/nodes/{node_id}/callback — AWS/ASG provisioning callback.
     */
    public function provisionCallback(Request $request, int $node_id): JsonResponse
    {
        $node = DockerNode::findOrFail($node_id);

        $validated = $request->validate([
            'host'  => 'required|string',
            'token' => 'required|string',
            'status' => 'required|string|in:active,failed'
        ]);

        if ($node->provisioning_token !== $validated['token']) {
            return response()->json(['message' => 'Invalid provisioning token'], 403);
        }

        if ($node->status !== 'provisioning') {
            return response()->json(['message' => 'Node is not in provisioning state'], 400);
        }

        $node->update([
            'host' => $validated['host'],
            'status' => $validated['status'],
        ]);

        // If successful, trigger the final SSH registration (pull images, check docker, etc.)
        if ($validated['status'] === 'active') {
            try {
                $this->nodeManager->registerNode($node->name, $node->host, [
                    'ssh_port' => $node->ssh_port,
                    'region'   => $node->region,
                ]);
            } catch (\Exception $e) {
                $node->update(['status' => 'offline']);
                return response()->json(['message' => 'Node reported active but registration failed: ' . $e->getMessage()], 500);
            }
        }

        // Clear token after use
        $node->update(['provisioning_token' => null]);

        return response()->json([
            'message' => "Node {$node->name} provisioning completed and marked as {$validated['status']}",
            'node'    => $node,
        ]);
    }

    /**
     * GET /api/tracking/admin/nodes/{id} — Node detail with containers.
     */
    public function show(int $id): JsonResponse
    {
        $node = DockerNode::findOrFail($id);

        return response()->json(
            $this->nodeManager->getNodeDetail($node)
        );
    }

    /**
     * PUT /api/tracking/admin/nodes/{id} — Update node config.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $node = DockerNode::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'nullable|string|unique:docker_nodes,name,' . $node->id,
            'max_containers' => 'nullable|integer|min:1|max:200',
            'status'         => 'nullable|in:active,draining,offline',
            'cpu_cores'      => 'nullable|integer',
            'memory_gb'      => 'nullable|integer',
            'metadata'       => 'nullable|array',
        ]);

        $node->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json([
            'message' => "Node {$node->name} updated",
            'node'    => $node->fresh(),
        ]);
    }

    /**
     * DELETE /api/tracking/admin/nodes/{id} — Remove a node.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $node = DockerNode::findOrFail($id);
        $force = $request->boolean('force', false);

        $deleted = $this->nodeManager->removeNode($node, $force);

        if (!$deleted) {
            return response()->json([
                'message' => "Node {$node->name} has containers — set to draining. Use ?force=true to force remove.",
                'status'  => 'draining',
            ], 409);
        }

        return response()->json([
            'message' => "Node removed successfully",
        ]);
    }

    /**
     * GET /api/tracking/admin/nodes/{id}/stats — Node resource metrics.
     */
    public function stats(int $id): JsonResponse
    {
        $node = DockerNode::findOrFail($id);

        return response()->json(
            $this->nodeManager->getNodeDetail($node)
        );
    }

    /**
     * POST /api/tracking/admin/nodes/{id}/drain — Mark node as draining.
     */
    public function drain(int $id): JsonResponse
    {
        $node = DockerNode::findOrFail($id);

        $this->nodeManager->drainNode($node);

        return response()->json([
            'message' => "Node {$node->name} set to draining — no new containers will be assigned",
        ]);
    }

    /**
     * POST /api/tracking/admin/health-check — Run health check on all nodes.
     */
    public function healthCheck(): JsonResponse
    {
        $results = $this->nodeManager->healthCheckAll();

        return response()->json($results);
    }

    /**
     * GET /api/tracking/admin/overview — Global infrastructure overview.
     */
    public function overview(): JsonResponse
    {
        return response()->json(
            $this->nodeManager->getNodeStats()
        );
    }

    /**
     * GET /api/tracking/admin/containers — All containers across all tenants.
     */
    public function allContainers(Request $request): JsonResponse
    {
        $query = TrackingContainer::with('node')
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->filled('node_id')) {
            $query->where('docker_node_id', $request->node_id);
        }

        if ($request->filled('status')) {
            $query->where('docker_status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('container_id', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }

        $containers = $query->paginate(50)->through(function ($c) {
            return [
                'id'            => $c->id,
                'name'          => $c->name,
                'container_id'  => $c->container_id,
                'docker_status' => $c->docker_status,
                'docker_port'   => $c->docker_port,
                'sidecar_port'  => $c->sidecar_port,
                'domain'        => $c->domain,
                'is_active'     => $c->is_active,
                'node'          => $c->node ? [
                    'id'     => $c->node->id,
                    'name'   => $c->node->name,
                    'region' => $c->node->region,
                ] : null,
                'created_at'    => $c->created_at?->toISOString(),
            ];
        });

        return response()->json($containers);
    }

    /**
     * GET /api/tracking/admin/usage — Usage and billing overview.
     */
    public function usageOverview(): JsonResponse
    {
        $totalContainers = TrackingContainer::count();
        $activeContainers = TrackingContainer::where('is_active', true)->count();
        $totalNodes = DockerNode::count();

        return response()->json([
            'total_containers'   => $totalContainers,
            'active_containers'  => $activeContainers,
            'inactive_containers' => $totalContainers - $activeContainers,
            'total_nodes'        => $totalNodes,
            'containers_by_status' => TrackingContainer::selectRaw('docker_status, COUNT(*) as count')
                ->groupBy('docker_status')
                ->pluck('count', 'docker_status'),
            'containers_by_node' => DockerNode::withCount('containers')
                ->get()
                ->pluck('containers_count', 'name'),
        ]);
    }
    /**
     * GET /api/tracking/admin/infra-settings — Global Infrastructure settings.
     */
    public function infrastructureSettings(): JsonResponse
    {
        return response()->json([
            'settings' => [
                'auto_scale_threshold' => \App\Models\GlobalSetting::get('tracking_auto_scale_threshold', 85),
                'auto_scale_webhook'   => \App\Models\GlobalSetting::get('tracking_auto_scale_webhook', ''),
                'kubernetes_api_key'   => \App\Models\GlobalSetting::get('tracking_kubernetes_api_key', ''),
                'kubernetes_endpoint'  => \App\Models\GlobalSetting::get('tracking_kubernetes_api_endpoint', 'https://api.eks.amazonaws.com'),
            ]
        ]);
    }

    /**
     * POST /api/tracking/admin/infra-settings — Update Global Infrastructure settings.
     */
    public function updateInfrastructureSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'auto_scale_threshold' => 'required|integer|min:10|max:95',
            'auto_scale_webhook'   => 'nullable|url',
            'kubernetes_api_key'   => 'nullable|string',
            'kubernetes_endpoint'  => 'nullable|url',
        ]);

        \App\Models\GlobalSetting::set('tracking_auto_scale_threshold', $validated['auto_scale_threshold'], 'infrastructure');
        \App\Models\GlobalSetting::set('tracking_auto_scale_webhook', $validated['auto_scale_webhook'] ?? '', 'infrastructure');
        \App\Models\GlobalSetting::set('tracking_kubernetes_api_key', $validated['kubernetes_api_key'] ?? '', 'infrastructure');
        \App\Models\GlobalSetting::set('tracking_kubernetes_api_endpoint', $validated['kubernetes_endpoint'] ?? '', 'infrastructure');

        return response()->json(['message' => 'Infrastructure settings updated successfully']);
    }

    /**
     * POST /api/tracking/admin/nodes/scale-up — Manually trigger regional scale up.
     */
    public function manualScaleUp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region' => 'required|string',
        ]);

        \App\Jobs\Tracking\ScaleUpRegionJob::dispatch($validated['region']);

        return response()->json([
            'message' => "Scale up job dispatched for region: {$validated['region']}. A new node will appear in 'provisioning' state shortly.",
        ]);
    }

    /**
     * GET /api/tracking/admin/cluster-status — Get K8s EKS cluster health.
     */
    public function clusterStatus(KubernetesApiClient $client): JsonResponse
    {
        $connected = $client->ping();
        
        return response()->json([
            'connected'    => $connected,
            'cluster_name' => env('EKS_CLUSTER_NAME', 'sgtm-tracking'),
            'region'       => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'simulated'    => config('tracking.kubernetes.simulate', false),
            'timestamp'    => now()->toIso8601String(),
        ]);
    }
}
