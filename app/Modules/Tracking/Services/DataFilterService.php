<?php

namespace App\Modules\Tracking\Services;

/**
 * Data Collection Filter Service.
 *
 * Controls what data is collected, stored, and forwarded.
 * Provides:
 *   - Event-level filters (allow/deny by event name, source, property)
 *   - Field-level filters (strip PII or sensitive fields before forwarding)
 *   - Consent-aware routing (only forward to destinations user consented to)
 *   - Data retention controls (forward-only vs store-and-forward)
 *
 * Filter Config (stored in container settings):
 * {
 *   "data_filters": {
 *     "event_allowlist": ["PageView", "Purchase", "AddToCart"],
 *     "event_denylist": [],
 *     "strip_fields": ["user_data.email", "source_ip"],
 *     "require_consent": true,
 *     "consent_destinations": {
 *       "analytics": ["ga4"],
 *       "marketing": ["facebook_capi", "tiktok", "snapchat"],
 *       "functional": ["webhook"]
 *     },
 *     "store_events": true,
 *     "anonymize_ip": false
 *   }
 * }
 */
class DataFilterService
{
    /**
     * Apply all data filters to an event.
     * Returns null if the event should be dropped entirely.
     */
    public function applyFilters(array $event, array $filterConfig): ?array
    {
        // Step 1: Event-level allowlist/denylist
        if (!$this->isEventAllowed($event, $filterConfig)) {
            return null;
        }

        // Step 2: Bot Filtering
        if ($this->isBot($event, $filterConfig)) {
            return null;
        }

        // Step 2b: Tenant-defined IP Blocking (If Power-Up Enabled)
        if ($this->isIpBlocked($event, $filterConfig)) {
            return null;
        }

        // Step 3: PII Hashing (Mandatory for privacy compliance)
        $event = $this->hashPII($event);

        // Step 4: Strip denied fields
        $event = $this->stripFields($event, $filterConfig['strip_fields'] ?? []);

        // Step 5: Anonymize IP if configured
        if ($filterConfig['anonymize_ip'] ?? false) {
            $event = $this->anonymizeIP($event);
        }

        return $event;
    }

    /**
     * Check if an event passes the allowlist/denylist filters.
     */
    private function isEventAllowed(array $event, array $config): bool
    {
        $eventName = $event['event_name'] ?? '';

        // Denylist takes priority
        $denylist = $config['event_denylist'] ?? [];
        if (!empty($denylist) && in_array($eventName, $denylist, true)) {
            return false;
        }

        // Allowlist: if set, only listed events pass
        $allowlist = $config['event_allowlist'] ?? [];
        if (!empty($allowlist) && !in_array($eventName, $allowlist, true)) {
            return false;
        }

        return true;
    }

    /**
     * Strip specified fields from the event payload.
     * Supports dot notation for nested fields.
     */
    private function stripFields(array $event, array $fields): array
    {
        foreach ($fields as $field) {
            data_forget($event, $field);
        }
        return $event;
    }

    /**
     * Check if the event is likely from a bot or crawler.
     */
    private function isBot(array $event, array $config): bool
    {
        // Skip if bot filtering is disabled in config
        if (!($config['bot_detection'] ?? true)) {
            return false;
        }

        $ua = $event['user_agent'] ?? '';
        if (preg_match('/bot|crawl|slurp|spider|mediapartners|headless|phantom|selenium|crawler/i', $ua)) {
            return true;
        }

        // Check against centralized IP blacklist (Redis cached)
        $ip = $event['source_ip'] ?? '';
        $blockedIps = \Illuminate\Support\Facades\Redis::get('tracking:blocked_ips');
        if ($blockedIps) {
            $blockedArray = json_decode($blockedIps, true);
            if (in_array($ip, $blockedArray, true)) return true;
        }

        return false;
    }

    /**
     * Check if the event's IP address matches the tenant's custom blocked IP list.
     */
    private function isIpBlocked(array $event, array $config): bool
    {
        if (!($config['ip_blocking'] ?? false)) {
            return false;
        }

        $ip = $event['source_ip'] ?? $event['user_data']['client_ip_address'] ?? '';
        if (empty($ip)) {
            return false;
        }

        $blockedIps = $config['blocked_ips'] ?? [];
        
        // Exact match
        if (in_array($ip, $blockedIps, true)) {
            return true;
        }

        return false;
    }

    /**
     * Hash sensitive PII fields (email, phone) to ensure privacy.
     */
    public function hashPII(array $event): array
    {
        if (empty($event['user_data'])) {
            return $event;
        }

        $fieldsToHash = [
            'email'       => 'em',
            'phone'       => 'ph',
            'external_id' => 'external_id',
        ];

        foreach ($fieldsToHash as $field => $key) {
            $value = data_get($event, "user_data.{$field}");
            if ($value) {
                $hashedValue = hash('sha256', strtolower(trim($value)));
                data_set($event, "user_data.{$key}", $hashedValue);
                if ($key !== $field) {
                    data_forget($event, "user_data.{$field}");
                }
            }
        }

        return $event;
    }

    /**
     * Anonymize IP address by zeroing the last octet (IPv4) or last 80 bits (IPv6).
     * Follows Google Analytics IP anonymization standard.
     */
    private function anonymizeIP(array $event): array
    {
        $ipFields = ['source_ip', 'user_data.client_ip_address', 'ip'];

        foreach ($ipFields as $field) {
            $ip = data_get($event, $field);
            if (!$ip) continue;

            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                // IPv4: zero last octet (e.g., 192.168.1.100 → 192.168.1.0)
                $parts = explode('.', $ip);
                $parts[3] = '0';
                data_set($event, $field, implode('.', $parts));
            } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
                // IPv6: zero last 80 bits
                $expanded = inet_ntop(inet_pton($ip));
                $parts = explode(':', $expanded);
                for ($i = 3; $i < count($parts); $i++) {
                    $parts[$i] = '0000';
                }
                data_set($event, $field, implode(':', $parts));
            }
        }

        return $event;
    }

    /**
     * Filter destinations based on user's consent choices.
     *
     * @param array $consentConfig  The consent_destinations mapping from filter config
     * @param array $userConsent    User's consent choices, e.g. ['analytics' => true, 'marketing' => false]
     * @return array                List of allowed destination types
     */
    public function getConsentedDestinations(array $consentConfig, array $userConsent): array
    {
        $allowed = [];

        foreach ($consentConfig as $category => $destinations) {
            if ($userConsent[$category] ?? false) {
                $allowed = array_merge($allowed, $destinations);
            }
        }

        return array_unique($allowed);
    }

    /**
     * Apply consent filtering to determine which destinations can receive the event.
     *
     * @param array $event         The event payload (may contain consent info)
     * @param array $filterConfig  The full data_filters config
     * @param array $allDestinations  All configured destination types
     * @return array               Filtered destination types the event can go to
     */
    public function filterDestinationsByConsent(array $event, array $filterConfig, array $allDestinations): array
    {
        // If consent not required, all destinations are allowed
        if (!($filterConfig['require_consent'] ?? false)) {
            return $allDestinations;
        }

        $consentConfig = $filterConfig['consent_destinations'] ?? [];
        $userConsent = $event['consent'] ?? $event['user_data']['consent'] ?? [];

        if (empty($userConsent)) {
            // No consent data provided — block marketing, allow functional only
            return $this->getConsentedDestinations($consentConfig, [
                'functional' => true,
                'analytics'  => false,
                'marketing'  => false,
            ]);
        }

        return $this->getConsentedDestinations($consentConfig, $userConsent);
    }
}
