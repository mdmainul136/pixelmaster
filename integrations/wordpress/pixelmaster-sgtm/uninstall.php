<?php
/**
 * PixelMaster sGTM — Uninstall.
 * Fires when the plugin is deleted via WP admin.
 * Removes all options, transients, and scheduled events.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// ── Options to remove ──
$options = array(
    // Connection
    'pm_sgtm_transport_url',
    'pm_sgtm_measurement_id',
    'pm_sgtm_container_id',
    'pm_sgtm_api_key',

    // Tracking pixels
    'pm_sgtm_ga4_datalayer',
    'pm_sgtm_meta_pixel_id',
    'pm_sgtm_meta_datalayer',
    'pm_sgtm_tiktok_pixel_id',
    'pm_sgtm_tiktok_datalayer',

    // Enhanced conversions
    'pm_sgtm_meta_access_token',
    'pm_sgtm_tiktok_access_token',

    // Features
    'pm_sgtm_auto_page_view',
    'pm_sgtm_custom_loader',
    'pm_sgtm_cookie_keeper',

    // Consent
    'pm_sgtm_consent_mode',
    'pm_sgtm_consent_default',
    'pm_sgtm_consent_banner',
    'pm_sgtm_banner_position',
    'pm_sgtm_privacy_url',

    // WooCommerce
    'pm_sgtm_woo_tracking',
    'pm_sgtm_server_events',

    // Engagement
    'pm_sgtm_scroll_tracking',
    'pm_sgtm_time_tracking',
    'pm_sgtm_download_tracking',

    // Advanced
    'pm_sgtm_exclude_roles',
    'pm_sgtm_debug_mode',

    // Custom events
    'pm_sgtm_custom_events',

    // A/B tests
    'pm_sgtm_ab_tests',

    // Version
    'pm_sgtm_version',
);

foreach ( $options as $option ) {
    delete_option( $option );
}

// ── Transients to remove ──
$transients = array(
    'pm_sgtm_health_cache',
    'pm_sgtm_logs_cache',
    'pm_sgtm_dashboard_stats',
);

foreach ( $transients as $transient ) {
    delete_transient( $transient );
}

// ── Cleanup user meta ──
delete_metadata( 'user', 0, 'pm_sgtm_dismissed_notice', '', true );

// ── Remove scheduled cron events ──
$crons = array( 'pm_sgtm_daily_cleanup', 'pm_sgtm_health_check' );
foreach ( $crons as $cron ) {
    $timestamp = wp_next_scheduled( $cron );
    if ( $timestamp ) {
        wp_unschedule_event( $timestamp, $cron );
    }
}

// ── Multisite cleanup ──
if ( is_multisite() ) {
    $sites = get_sites( array( 'number' => 1000 ) );
    foreach ( $sites as $site ) {
        switch_to_blog( $site->blog_id );
        foreach ( $options as $option ) {
            delete_option( $option );
        }
        foreach ( $transients as $transient ) {
            delete_transient( $transient );
        }
        restore_current_blog();
    }
}
