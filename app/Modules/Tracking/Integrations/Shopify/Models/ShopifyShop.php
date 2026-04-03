<?php

namespace App\Modules\Tracking\Integrations\Shopify\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Tracking\TrackingContainer;

/**
 * ShopifyShop (Integrations Identity)
 * 
 * Represents a connected Shopify store.
 */
class ShopifyShop extends Model
{
    protected $table = 'shopify_shops';

    protected $fillable = [
        'tenant_id',
        'shop_domain',
        'shop_name',
        'access_token',
        'scope',
        'nonce',
        'tracking_container_id',
        'settings',
        'script_installed',
        'script_tag_id',
        'webhooks_registered',
        'is_active',
        'installed_at',
        'uninstalled_at',
    ];

    protected $casts = [
        'settings'             => 'array',
        'script_installed'     => 'boolean',
        'webhooks_registered'  => 'boolean',
        'is_active'            => 'boolean',
        'installed_at'         => 'datetime',
        'uninstalled_at'       => 'datetime',
    ];

    protected $hidden = ['access_token'];

    /**
     * Get the associated tracking container.
     */
    public function container(): BelongsTo
    {
        return $this->belongsTo(TrackingContainer::class, 'tracking_container_id');
    }

    // ── Helpers ──

    public function getTransportUrl(): ?string
    {
        return $this->container?->domain
            ? "https://{$this->container->domain}"
            : null;
    }

    public function getMeasurementId(): ?string
    {
        return $this->settings['measurement_id'] ?? $this->container?->settings['measurement_id'] ?? null;
    }

    public function getContainerId(): ?string
    {
        return $this->container?->container_id;
    }

    public function isFullyConfigured(): bool
    {
        return $this->access_token
            && $this->tracking_container_id
            && $this->getTransportUrl();
    }

    public function markInstalled(): void
    {
        $this->update([
            'is_active'     => true,
            'installed_at'  => now(),
            'uninstalled_at'=> null,
        ]);
    }

    public function markUninstalled(): void
    {
        $this->update([
            'is_active'      => false,
            'uninstalled_at' => now(),
            'script_installed'     => false,
            'webhooks_registered'  => false,
        ]);
    }
}
