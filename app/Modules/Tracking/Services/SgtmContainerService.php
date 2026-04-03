<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingTag;
use App\Models\Tracking\TrackingDestination;
use Illuminate\Support\Facades\Log;

/**
 * sGTM Container Management Service (Hybrid Architecture)
 *
 * In Hybrid mode, Google's official sGTM image handles all tag/trigger processing.
 * This service manages container records, event-to-destination mapping, and
 * variable resolution for Laravel-side DLQ routing.
 *
 * Models:
 *  - TrackingContainer: container_config (base64 GTM config), api_secret (column), settings (JSON)
 *  - TrackingTag: triggers, config, variables (kept for Laravel-side DLQ routing)
 *  - TrackingDestination: type, credentials, mappings
 */
class SgtmContainerService
{
    // ── Container Management ──────────────────────────

    /**
     * Create a new sGTM container.
     * Accepts either a config string (PixelMaster-style) or manual container_id.
     */
    public function createContainer(array $data): TrackingContainer
    {
        // If config string provided, parse it to extract container_id
        $containerId = $data['container_id'] ?? null;
        $containerConfig = $data['container_config'] ?? null;

        if ($containerConfig && !$containerId) {
            $parsed = $this->parseConfigString($containerConfig);
            $containerId = $parsed['id'] ?? null;
        }

        if (!$containerId) {
            throw new \InvalidArgumentException('Either container_id or container_config is required.');
        }

        return TrackingContainer::create([
            'name'             => $data['name'],
            'container_id'     => $containerId,
            'container_config' => $containerConfig,
            'api_secret'       => $data['api_secret'] ?? null,
            'domain'           => $data['domain'] ?? null,
            'is_active'        => true,
            'settings'         => array_merge($data['settings'] ?? [], [
                'measurement_id' => $data['measurement_id'] ?? null,
                'transport_url'  => $data['transport_url'] ?? null,
                'environment'    => $data['environment'] ?? 'production',
            ]),
        ]);
    }

    /**
     * Parse a base64-encoded GTM Config String.
     */
    public function parseConfigString(string $configString): ?array
    {
        $decoded = base64_decode($configString, true);
        if ($decoded === false) return null;

        parse_str($decoded, $params);
        return empty($params['id']) ? null : $params;
    }

    /**
     * Get the primary active container.
     */
    public function getPrimaryContainer(): ?TrackingContainer
    {
        return TrackingContainer::where('is_active', true)->first();
    }

    /**
     * Get measurement_id from container settings.
     */
    public function getMeasurementId(TrackingContainer $container): ?string
    {
        return $container->settings['measurement_id'] ?? null;
    }

    /**
     * Get API secret from container column (migration 000015).
     */
    public function getApiSecret(TrackingContainer $container): ?string
    {
        return $container->api_secret;
    }

    /**
     * Get all containers with their tags.
     */
    public function listContainers(): array
    {
        $containers = TrackingContainer::all();

        return $containers->map(function ($container) {
            $tags = TrackingTag::where('container_id', $container->id)->get();
            return [
                'id'             => $container->id,
                'name'           => $container->name,
                'container_id'   => $container->container_id,
                'domain'         => $container->domain,
                'measurement_id' => $container->settings['measurement_id'] ?? null,
                'transport_url'  => $container->settings['transport_url'] ?? null,
                'environment'    => $container->settings['environment'] ?? 'production',
                'is_active'      => $container->is_active,
                'tags_count'     => $tags->count(),
                'active_tags'    => $tags->where('is_active', true)->count(),
            ];
        })->toArray();
    }

    // ── Tag Management ────────────────────────────────

    /**
     * Create a new tag in a container.
     */
    public function createTag(int $containerId, array $data): TrackingTag
    {
        return TrackingTag::create([
            'container_id'    => $containerId,
            'name'            => $data['name'],
            'type'            => $data['type'],                // pixel, script, conversion, custom
            'destination_type' => $data['destination_type'] ?? null,
            'triggers'        => $data['triggers'] ?? [],      // Using existing field name
            'config'          => $data['config'] ?? [],        // Using existing field name
            'variables'       => $data['variables'] ?? [],
            'priority'        => $data['priority'] ?? 0,
            'is_active'       => $data['is_active'] ?? true,
        ]);
    }

    /**
     * Evaluate which tags should fire for a given event.
     *
     * @param string $eventName   Event name (e.g., 'purchase', 'page_view')
     * @param array  $eventData   Full event data including params
     * @return TrackingTag[]      Tags that should fire
     */
    public function evaluateTagTriggers(string $eventName, array $eventData): array
    {
        $container = $this->getPrimaryContainer();
        if (!$container) return [];

        $activeTags = TrackingTag::where('container_id', $container->id)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        $matchedTags = [];

        foreach ($activeTags as $tag) {
            if ($this->matchesTrigger($tag, $eventName, $eventData)) {
                $matchedTags[] = $tag;
            }
        }

        return $matchedTags;
    }

    /**
     * Check if a tag's trigger matches the given event.
     * Uses `triggers` field (existing model field, not trigger_config).
     */
    private function matchesTrigger(TrackingTag $tag, string $eventName, array $eventData): bool
    {
        $trigger = $tag->triggers ?? [];

        // No trigger config = fire on all events
        if (empty($trigger)) return true;

        // Match by event names
        if (isset($trigger['events'])) {
            $events = (array) $trigger['events'];
            if (!in_array($eventName, $events) && !in_array('*', $events)) {
                return false;
            }
        }

        // Match by event type
        if (isset($trigger['event_type'])) {
            $eventType = $eventData['event_type'] ?? 'custom';
            if ($trigger['event_type'] !== $eventType) {
                return false;
            }
        }

        // Match by conditions (field comparisons)
        if (isset($trigger['conditions'])) {
            foreach ($trigger['conditions'] as $condition) {
                $field = $condition['field'] ?? null;
                $op    = $condition['operator'] ?? 'equals';
                $value = $condition['value'] ?? null;

                $actual = data_get($eventData, $field);

                $matched = match ($op) {
                    'equals'       => $actual == $value,
                    'not_equals'   => $actual != $value,
                    'contains'     => is_string($actual) && str_contains($actual, $value),
                    'starts_with'  => is_string($actual) && str_starts_with($actual, $value),
                    'regex'        => is_string($actual) && preg_match($value, $actual),
                    'greater_than' => is_numeric($actual) && $actual > $value,
                    'less_than'    => is_numeric($actual) && $actual < $value,
                    'exists'       => $actual !== null,
                    default        => true,
                };

                if (!$matched) return false;
            }
        }

        return true;
    }

    // ── Variable Resolution ───────────────────────────

    /**
     * Resolve tag variables from event data.
     * Variables use {{variable_name}} syntax inside tag config.
     * Uses `config` field (existing model field, not tag_config).
     *
     * @param array $tagConfig  Tag configuration with {{placeholders}}
     * @param array $eventData  Event data to resolve from
     */
    public function resolveVariables(array $tagConfig, array $eventData): array
    {
        $resolved = [];

        foreach ($tagConfig as $key => $value) {
            if (is_string($value)) {
                $resolved[$key] = preg_replace_callback('/\{\{(.+?)\}\}/', function ($matches) use ($eventData) {
                    return data_get($eventData, trim($matches[1]), $matches[0]);
                }, $value);
            } elseif (is_array($value)) {
                $resolved[$key] = $this->resolveVariables($value, $eventData);
            } else {
                $resolved[$key] = $value;
            }
        }

        return $resolved;
    }

    // ── Destination Mapping ───────────────────────────

    /**
     * Get all active destinations.
     */
    public function getActiveDestinations(): array
    {
        return TrackingDestination::where('is_active', true)->get()->toArray();
    }

    /**
     * Map a GA4 event name to destination-specific event names.
     * Uses `mappings` field from TrackingDestination (existing model field).
     *
     * @param string $ga4EventName  Standard GA4 event name
     * @return array                ['facebook_capi' => 'Purchase', 'tiktok' => 'CompletePayment', ...]
     */
    public function mapEventToDestinations(string $ga4EventName): array
    {
        $destinations = TrackingDestination::where('is_active', true)->get();
        $mapped = [];

        foreach ($destinations as $dest) {
            $mapping = $dest->mappings ?? [];
            $mapped[$dest->type] = $mapping[$ga4EventName] ?? $ga4EventName;
        }

        return $mapped;
    }
}
