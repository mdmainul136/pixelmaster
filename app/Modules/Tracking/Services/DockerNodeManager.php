<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\DockerNode;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\Log;

/**
 * Docker Node Manager — manages the AWS EC2 node pool for sGTM containers.
 *
 * Responsibilities:
 *   - Register/remove nodes from the pool
 *   - Select the best node for new container deployments (least-loaded)
 *   - Allocate ports on specific nodes
 *   - Health check all nodes
 *   - Provide dashboard stats
 */
class DockerNodeManager
{
    public function __construct(
        private RemoteDockerClient $docker
    ) {}

    // ── Node Registration ───────────────────────────────────────

    /**
     * Register a new AWS EC2 node into the pool.
     * Verifies SSH connectivity and pulls required Docker images.
     */
    public function registerNode(string $name, string $host, array $options = []): DockerNode
    {
        $node = DockerNode::create([
            'name'             => $name,
            'host'             => $host,
            'ssh_port'         => $options['ssh_port'] ?? 22,
            'docker_api_port'  => $options['docker_api_port'] ?? 2376,
            'region'           => $options['region'] ?? 'us-east-1',
            'max_containers'   => $options['max_containers'] ?? config('tracking.docker.max_containers_per_node', 50),
            'port_range_start' => $options['port_range_start'] ?? config('tracking.docker.port_range_start', 9000),
            'port_range_end'   => $options['port_range_end'] ?? 9999,
            'cpu_cores'        => $options['cpu_cores'] ?? null,
            'memory_gb'        => $options['memory_gb'] ?? null,
            'metadata'         => $options['metadata'] ?? [],
            'status'           => 'active',
        ]);

        // Verify SSH connectivity
        if (config('tracking.docker.mode') !== 'self_hosted') {
            try {
                $reachable = $this->docker->ping($node);

                if (!$reachable) {
                    Log::warning("[NodeManager] Node {$name} ({$host}) is not reachable via SSH. Check credentials.");
                    $node->update(['status' => 'offline']);
                } else {
                    // Create Docker network if needed
                    $this->docker->execute($node, 'docker network create ' . config('tracking.docker.network', 'tracking_network') . ' 2>/dev/null || true');

                    // Pull images
                    $sgtmImage    = config('tracking.docker.sgtm_image');
                    $sidecarImage = config('tracking.docker.sidecar_image');

                    if ($sgtmImage) $this->docker->pullImage($node, $sgtmImage);
                    if ($sidecarImage) $this->docker->pullImage($node, $sidecarImage);

                    Log::info("[NodeManager] Node {$name} registered successfully after SSH verification");
                }
            } catch (\Exception $e) {
                Log::error("[NodeManager] Critical error during node registration for {$name}: " . $e->getMessage());
                $node->update(['status' => 'failed']);
            }
        }

        return $node;
    }

    /**
     * Remove a node from the pool.
     * If force=false and node has containers, sets status to 'draining' instead of deleting.
     */
    public function removeNode(DockerNode $node, bool $force = false): bool
    {
        $containerCount = $node->containers()->count();

        if ($containerCount > 0 && !$force) {
            $node->update(['status' => 'draining']);
            Log::info("[NodeManager] Node {$node->name} has {$containerCount} containers — set to draining");
            return false;
        }

        if ($force && $containerCount > 0) {
            Log::warning("[NodeManager] Force-removing node {$node->name} with {$containerCount} containers");
            // Nullify node references on containers
            $node->containers()->update(['docker_node_id' => null]);
        }

        $node->delete();
        Log::info("[NodeManager] Node {$node->name} removed from pool");

        return true;
    }

    /**
     * Mark a node as draining — no new containers will be assigned.
     */
    public function drainNode(DockerNode $node): void
    {
        $node->update(['status' => 'draining']);
        Log::info("[NodeManager] Node {$node->name} set to draining");
    }

    // ── Node Selection (Scheduling) ─────────────────────────────

    /**
     * Select the best node for a new container deployment.
     * Strategy: least-loaded active node, prefer the specified region.
     *
     * @return DockerNode|null Returns null if no capacity available
     */
    public function selectNode(?string $preferredRegion = null): ?DockerNode
    {
        $query = DockerNode::active()->withCapacity()->leastLoaded();

        if ($preferredRegion) {
            // Try preferred region first
            $node = (clone $query)->inRegion($preferredRegion)->first();

            if ($node) {
                return $node;
            }

            // Fall back to any available node
            Log::info("[NodeManager] No capacity in region {$preferredRegion}, falling back to any region");
        }

        return $query->first();
    }

    /**
     * Allocate an available port on a specific node.
     * Scans Docker ps on the node to find used ports, returns the first available.
     */
    public function allocatePortOnNode(DockerNode $node): int
    {
        $start = $node->port_range_start;
        $end   = $node->port_range_end;

        // Get ports already used on this node from DB
        $usedPorts = TrackingContainer::where('docker_node_id', $node->id)
            ->whereNotNull('docker_port')
            ->pluck('docker_port')
            ->merge(
                TrackingContainer::where('docker_node_id', $node->id)
                    ->whereNotNull('sidecar_port')
                    ->pluck('sidecar_port')
            )
            ->toArray();

        // Find first available port
        for ($port = $start; $port <= $end; $port++) {
            if (!in_array($port, $usedPorts)) {
                return $port;
            }
        }

        // Fallback: scan remote Docker for used ports
        $result = $this->docker->listContainers($node);
        if ($result['success']) {
            $remotePorts = [];
            foreach (explode("\n", $result['output']) as $line) {
                if (preg_match_all('/(\d+)->\d+/', $line, $matches)) {
                    $remotePorts = array_merge($remotePorts, array_map('intval', $matches[1]));
                }
            }

            for ($port = $start; $port <= $end; $port++) {
                if (!in_array($port, $remotePorts) && !in_array($port, $usedPorts)) {
                    return $port;
                }
            }
        }

        throw new \RuntimeException("No available ports on node {$node->name} (range {$start}-{$end})");
    }

    // ── Health Checks ───────────────────────────────────────────

    /**
     * Run health check on all active nodes.
     * Updates: last_health_check, cpu/memory/disk usage, current_containers count.
     *
     * @return array{healthy: int, unhealthy: int, details: array}
     */
    public function healthCheckAll(): array
    {
        $nodes   = DockerNode::whereIn('status', ['active', 'draining'])->get();
        $healthy = 0;
        $unhealthy = 0;
        $details = [];

        foreach ($nodes as $node) {
            /** @var DockerNode $node */
            $result = $this->healthCheckNode($node);
            $details[] = $result;

            if ($result['healthy']) {
                $healthy++;
            } else {
                $unhealthy++;
            }
        }

        return ['healthy' => $healthy, 'unhealthy' => $unhealthy, 'details' => $details];
    }

    /**
     * Health check a single node.
     */
    public function healthCheckNode(DockerNode $node): array
    {
        $isReachable = false;
        $metrics = ['cpu_percent' => 0, 'memory_percent' => 0, 'disk_percent' => 0];
        $containerCount = 0;

        if (config('tracking.docker.mode') === 'self_hosted') {
            // Local mode: always healthy
            $isReachable = true;
            $containerCount = $node->containers()->count();
        } else {
            $isReachable = $this->docker->ping($node);

            if ($isReachable) {
                $metrics = $this->docker->getNodeMetrics($node);
                $containerCount = $this->docker->countContainers($node);
            }
        }

        // Update node record
        $node->update([
            'last_health_check'    => now(),
            'cpu_usage_percent'    => $metrics['cpu_percent'],
            'memory_usage_percent' => $metrics['memory_percent'],
            'disk_usage_percent'   => $metrics['disk_percent'],
            'current_containers'   => $containerCount,
            'status'               => $isReachable ? $node->status : 'offline',
        ]);

        return [
            'node_id'         => $node->id,
            'name'            => $node->name,
            'host'            => $node->host,
            'healthy'         => $isReachable,
            'status'          => $node->status,
            'containers'      => $containerCount,
            'max_containers'  => $node->max_containers,
            'cpu_percent'     => $metrics['cpu_percent'],
            'memory_percent'  => $metrics['memory_percent'],
            'disk_percent'    => $metrics['disk_percent'],
        ];
    }

    /**
     * Sync the current_containers count for a node from the database.
     */
    public function syncContainerCount(DockerNode $node): void
    {
        $count = $node->containers()->count();
        $node->update(['current_containers' => $count]);
    }

    /**
     * Estimate the daily AWS cost for a node based on its type/cores.
     */
    public function getEstimatedDailyCost(DockerNode $node): float
    {
        // Simple logic: $0.05 per CPU core per hour (rough t3.medium benchmark)
        $cores = $node->cpu_cores ?? 2;
        $hourlyRate = $cores * 0.025; // Approx $0.05/hr for 2 cores
        return $hourlyRate * 24;
    }

    // ── Dashboard Stats ─────────────────────────────────────────

    /**
     * Get overview stats for all nodes (infra dashboard).
     */
    public function getNodeStats(): array
    {
        $nodes = DockerNode::all();

        $totalNodes = $nodes->count();
        $activeNodes = $nodes->where('status', 'active')->count();
        $totalContainers = $nodes->sum('current_containers');
        $totalCapacity = $nodes->sum('max_containers');
        $avgCpu = $nodes->avg('cpu_usage_percent') ?? 0;
        $avgMemory = $nodes->avg('memory_usage_percent') ?? 0;
        
        $totalDailyCost = $nodes->reduce(function ($carry, $node) {
            return $carry + $this->getEstimatedDailyCost($node);
        }, 0);

        return [
            'total_nodes'       => $totalNodes,
            'active_nodes'      => $activeNodes,
            'draining_nodes'    => $nodes->where('status', 'draining')->count(),
            'offline_nodes'     => $nodes->where('status', 'offline')->count(),
            'total_containers'  => $totalContainers,
            'total_capacity'    => $totalCapacity,
            'utilization'       => $totalCapacity > 0 ? round(($totalContainers / $totalCapacity) * 100, 1) : 0,
            'avg_cpu'           => round($avgCpu, 1),
            'avg_memory'        => round($avgMemory, 1),
            'cost_estimate'     => round($totalDailyCost, 2),
            'nodes'             => $nodes->map(function ($node) {
                return [
                    'id'               => $node->id,
                    'name'             => $node->name,
                    'host'             => $node->host,
                    'region'           => $node->region,
                    'status'           => $node->status,
                    'containers'       => $node->current_containers,
                    'max_containers'   => $node->max_containers,
                    'capacity_percent' => $node->capacityPercent(),
                    'cpu_percent'      => $node->cpu_usage_percent,
                    'memory_percent'   => $node->memory_usage_percent,
                    'disk_percent'     => $node->disk_usage_percent,
                    'healthy'          => $node->isHealthy(),
                    'last_health'      => $node->last_health_check?->toISOString(),
                ];
            })->values()->toArray(),
        ];
    }

    /**
     * Get detailed info for a specific node including its containers.
     */
    public function getNodeDetail(DockerNode $node): array
    {
        $node->load('containers');

        return [
            'node' => [
                'id'               => $node->id,
                'name'             => $node->name,
                'host'             => $node->host,
                'region'           => $node->region,
                'status'           => $node->status,
                'ssh_port'         => $node->ssh_port,
                'containers'       => $node->current_containers,
                'max_containers'   => $node->max_containers,
                'capacity_percent' => $node->capacityPercent(),
                'cpu_cores'        => $node->cpu_cores,
                'memory_gb'        => $node->memory_gb,
                'cpu_percent'      => $node->cpu_usage_percent,
                'memory_percent'   => $node->memory_usage_percent,
                'disk_percent'     => $node->disk_usage_percent,
                'metadata'         => $node->metadata,
                'healthy'          => $node->isHealthy(),
                'last_health'      => $node->last_health_check?->toISOString(),
                'created_at'       => $node->created_at->toISOString(),
            ],
            'containers' => $node->containers->map(function ($c) {
                return [
                    'id'            => $c->id,
                    'name'          => $c->name,
                    'container_id'  => $c->container_id,
                    'docker_status' => $c->docker_status,
                    'docker_port'   => $c->docker_port,
                    'sidecar_port'  => $c->sidecar_port,
                    'domain'        => $c->domain,
                    'is_active'     => $c->is_active,
                ];
            })->values()->toArray(),
        ];
    }
}
