<?php

namespace App\Models\Tracking;

use App\Models\TenantBaseModel;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrackingContainer extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'ec_tracking_containers';
    protected $connection = 'central';

    protected $fillable = [
        'name',
        'container_id',
        'api_secret',
        'container_config',       // Base64 GTM config string
        'domain',
        'server_location',
        'deployment_type',
        'extra_domains',
        'preview_url',
        'is_active',
        'settings',
        'power_ups',
        'docker_container_id',
        'docker_status',
        'docker_port',
        'sidecar_port',
        'docker_node_id',
        'provisioned_at',
        'event_mappings',
        'pipeline_config',
        'data_filters',
        'secret_key',
        'metabase_type',
        'clickhouse_type',
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'settings'        => 'array',
        'power_ups'       => 'array',
        'event_mappings'  => 'array',
        'extra_domains'   => 'array',
        'pipeline_config' => 'array',
        'data_filters'    => 'array',
        'provisioned_at'  => 'datetime',
        'docker_port'     => 'integer',
        'sidecar_port'    => 'integer',
    ];

    /**
     * Boot the model and handle auto-generation of the secret key.
     */
    protected static function booted()
    {
        static::creating(function ($container) {
            // Priority 1: Use Existing Tenant's Global Secret
            if (empty($container->secret_key) && !empty($container->tenant_id)) {
                $tenant = \App\Models\Tenant::find($container->tenant_id);
                if ($tenant && !empty($tenant->global_account_secret)) {
                    $container->secret_key = $tenant->global_account_secret;
                }
            }

            // Priority 2: Fallback to random 32-char string
            if (empty($container->secret_key)) {
                $container->secret_key = \Illuminate\Support\Str::random(32);
            }
        });
    }

    // â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * The tenant owner of this container.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Get the current subscription plan key.
     */
    public function getPlanKey(): string
    {
        return $this->tenant->plan ?? 'free';
    }

    /**
     * The Docker node this container runs on (AWS EC2 instance).
     */
    public function node()
    {
        return $this->belongsTo(DockerNode::class, 'docker_node_id');
    }

    public function destinations()
    {
        return $this->hasMany(TrackingDestination::class, 'container_id');
    }

    public function eventLogs()
    {
        return $this->hasMany(TrackingEventLog::class, 'container_id');
    }

    public function tags()
    {
        return $this->hasMany(TrackingTag::class, 'container_id');
    }

    public function usage()
    {
        return $this->hasMany(TrackingUsage::class, 'container_id');
    }

    // â”€â”€ Config Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Decode the base64 container_config to extract GTM parameters.
     * Returns: ['id' => 'GTM-XXXX', 'env' => '1', 'auth' => 'token']
     */
    public function getParsedConfig(): ?array
    {
        if (!$this->container_config) {
            return null;
        }

        $decoded = base64_decode($this->container_config);
        parse_str($decoded, $params);

        return $params; // ['id' => 'GTM-XXXX', 'env' => '1', 'auth' => 'YYYY']
    }
}

