import { usePage } from '@inertiajs/react';

/**
 * useFeature â€” Feature gating hook
 *
 * Reads the globally shared `features` and `plan` props from Inertia.
 *
 * Usage:
 *   const { hasFeature, plan, requiresPlan } = useFeature();
 *
 *   hasFeature('logs')           // â†’ true | false
 *   requiresPlan('monitoring')   // â†’ 'business' | null
 *   plan                         // â†’ 'free' | 'pro' | 'business' | ...
 */

const PLAN_HIERARCHY = ['free', 'pro', 'business', 'enterprise', 'custom'];

export function useFeature() {
    const { features = [], plan = 'free' } = usePage().props;

    /**
     * Check if the current tenant has a specific feature enabled.
     * @param {string} featureKey - e.g. 'logs', 'cookie_keeper', 'monitoring'
     */
    const hasFeature = (featureKey) => features.includes(featureKey);

    /**
     * Returns the minimum plan required to unlock this feature.
     * Returned by checking config/plans structure via Inertia shared props
     * (server resolves this dynamically via getActiveFeatureMap).
     *
     * NOTE: This is a client-side approximation â€” for gating, use hasFeature().
     *
     * @returns {string|null} e.g. 'pro', 'business', 'custom', or null
     */
    const requiresPlan = (featureKey) => {
        // Feature map by plan tier (mirrors config/plans.php)
        const featureMap = {
            // Phase 1 Core â€” Free+
            custom_domain:              'free',
            custom_loader:              'free',
            pixelmaster_analytics:            'free',
            anonymizer:                 'free',
            http_header_config:         'free',
            global_cdn:                 'free',
            geo_headers:                'free',
            user_agent_info:            'free',
            pixelmaster_api:                  'free',
            user_id:                    'free',
            open_container_bot_index:   'free',
            click_id_restorer:          'free',
            service_account:            'free',
            // Phase 1 Core â€” Pro+
            logs:                       'pro',
            cookie_keeper:              'pro',
            bot_detection:              'pro',
            ad_blocker_info:            'pro',
            poas_data_feed:             'pro',
            pixelmaster_store:                'pro',
            // Phase 2 Infrastructure â€” Business+
            multi_zone_infrastructure:  'business',
            multi_domains:              'business',
            monitoring:                 'business',
            file_proxy:                 'business',
            xml_to_json:                'business',
            block_request_by_ip:        'business',
            schedule_requests:          'business',
            request_delay:              'business',
            // Phase 2 Infrastructure â€” Custom only
            custom_logs_retention:      'custom',
            dedicated_ip:               'custom',
            private_cluster:            'custom',
            // Phase 3 Account â€” Free+
            transfer_ownership:         'free',
            consolidated_invoice:       'free',
            share_access:               'free',
            two_factor_auth:            'free',
            // Phase 3 Account â€” Pro+
            google_sheets_connection:   'pro',
            // Phase 3 Account â€” Custom only
            single_sign_on:             'custom',
            // Phase 4 Connections â€” Pro+
            data_manager_api:           'pro',
            google_ads_connection:      'pro',
            microsoft_ads_connection:   'pro',
            meta_custom_audiences:      'pro',
        };

        return featureMap[featureKey] ?? null;
    };

    /**
     * Returns a human-readable label for the required plan.
     * e.g. 'business' â†’ 'Business'
     */
    const requiredPlanLabel = (featureKey) => {
        const tier = requiresPlan(featureKey);
        if (!tier) return null;
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    };

    /**
     * Returns the list of all features available on the current plan.
     */
    const currentFeatures = features;

    /**
     * Returns true if the current plan is at or above the given tier.
     * e.g. isPlanAtLeast('business') â†’ true if plan is business/enterprise/custom
     */
    const isPlanAtLeast = (requiredTier) => {
        const currentIndex = PLAN_HIERARCHY.indexOf(plan);
        const requiredIndex = PLAN_HIERARCHY.indexOf(requiredTier);
        if (currentIndex === -1 || requiredIndex === -1) return false;
        return currentIndex >= requiredIndex;
    };

    return {
        plan,
        features: currentFeatures,
        hasFeature,
        requiresPlan,
        requiredPlanLabel,
        isPlanAtLeast,
    };
}

