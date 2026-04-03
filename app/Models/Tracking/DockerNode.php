<?php

namespace App\Models\Tracking;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Docker Node — represents an AWS EC2 instance in the node pool.
 *
 * Each node runs Docker Engine and hosts multiple sGTM + sidecar container pairs.
 * Managed by DockerNodeManager and RemoteDockerClient.
 */
class DockerNode extends Model
{
    protected $table = 'docker_nodes';

    protected $fillable = [
        'name',
        'host',
        'ssh_port',
        'docker_api_port',
        'region',
        'status',
        'max_containers',
        'current_containers',
        'port_range_start',
        'port_range_end',
        'cpu_cores',
        'memory_gb',
        'metadata',
        'cpu_usage_percent',
        'memory_usage_percent',
        'disk_usage_percent',
        'last_health_check',
    ];

    protected $casts = [
        'metadata'             => 'array',
        'last_health_check'    => 'datetime',
        'cpu_usage_percent'    => 'float',
        'memory_usage_percent' => 'float',
        'disk_usage_percent'   => 'float',
    ];

    // ── Relationships ───────────────────────────────────────────────

    /**
     * Containers running on this node.
     */
    public function containers(): HasMany
    {
        return $this->hasMany(TrackingContainer::class, 'docker_node_id');
    }

    // ── Helpers ─────────────────────────────────────────────────────

    /**
     * Number of available container slots on this node.
     */
    public function getAvailableSlots(): int
    {
        return max(0, $this->max_containers - $this->current_containers);
    }

    /**
     * Whether the node has capacity for more containers.
     */
    public function hasCapacity(): bool
    {
        return $this->current_containers < $this->max_containers;
    }

    /**
     * Whether the node passed its last health check within the threshold.
     */
    public function isHealthy(int $thresholdMinutes = 10): bool
    {
        if (!$this->last_health_check) {
            return false;
        }

        return $this->last_health_check->diffInMinutes(now()) <= $thresholdMinutes;
    }

    /**
     * Capacity usage as a percentage (0-100).
     */
    public function capacityPercent(): float
    {
        if ($this->max_containers <= 0) return 100;
        return round(($this->current_containers / $this->max_containers) * 100, 1);
    }

    /**
     * Display label: "aws-node-01 (us-east-1)"
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->region})";
    }

    // ── Scopes ──────────────────────────────────────────────────────

    /**
     * Only active nodes (accepting new containers).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Nodes with available capacity.
     */
    public function scopeWithCapacity($query)
    {
        return $query->whereColumn('current_containers', '<', 'max_containers');
    }

    /**
     * Nodes in a specific region.
     */
    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Nodes ordered by least loaded first (for scheduling).
     */
    public function scopeLeastLoaded($query)
    {
        return $query->orderBy('current_containers', 'asc');
    }
}
