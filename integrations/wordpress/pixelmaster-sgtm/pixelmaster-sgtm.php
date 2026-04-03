<?php
/**
 * Plugin Name:       PixelMaster sGTM — Server-Side Tracking
 * Plugin URI:        https://pixelmaster.io/wordpress
 * Description:       One-click server-side Google Tag Manager integration. Tracks e-commerce events, supports Consent Mode v2, and bypasses ad blockers.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            PixelMaster
 * Author URI:        https://pixelmaster.io
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       pixelmaster-sgtm
 * Domain Path:       /languages
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SECURITY: Prevent direct access
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COMPATIBILITY: Prevent class/constant collisions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ( defined( 'PM_SGTM_VERSION' ) ) {
    return; // Another instance already loaded
}

define( 'PM_SGTM_VERSION',    '1.0.0' );
define( 'PM_SGTM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PM_SGTM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'PM_SGTM_PLUGIN_FILE', __FILE__ );
define( 'PM_SGTM_MIN_WP',     '5.8' );
define( 'PM_SGTM_MIN_PHP',    '7.4' );

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COMPATIBILITY: PHP & WP version check
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ( version_compare( PHP_VERSION, PM_SGTM_MIN_PHP, '<' ) ) {
    add_action( 'admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        echo esc_html(
            sprintf(
                /* translators: %s: minimum PHP version */
                __( 'PixelMaster sGTM requires PHP %s or higher.', 'pixelmaster-sgtm' ),
                PM_SGTM_MIN_PHP
            )
        );
        echo '</p></div>';
    } );
    return;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  LOAD: Include class files (guard against re-declaration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ( ! class_exists( 'PM_SGTM_Settings' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-settings.php';
}
if ( ! class_exists( 'PM_SGTM_Tracker' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-tracker.php';
}
if ( ! class_exists( 'PM_SGTM_DataLayer' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-datalayer.php';
}
if ( ! class_exists( 'PM_SGTM_Consent' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-consent.php';
}
if ( ! class_exists( 'PM_SGTM_Attribution' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-attribution.php';
}
if ( ! class_exists( 'PM_SGTM_Monitor' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-monitor.php';
}
if ( ! class_exists( 'PM_SGTM_Export' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-export.php';
}
if ( ! class_exists( 'PM_SGTM_Dashboard' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-dashboard.php';
}
if ( ! class_exists( 'PM_SGTM_Coupon' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-coupon.php';
}
if ( ! class_exists( 'PM_SGTM_ABTest' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-abtest.php';
}
if ( ! class_exists( 'PM_SGTM_CustomEvents' ) ) {
    require_once PM_SGTM_PLUGIN_DIR . 'includes/class-custom-events.php';
}

// Load text domain for i18n
add_action( 'init', 'pm_sgtm_load_textdomain' );
function pm_sgtm_load_textdomain() {
    load_plugin_textdomain( 'pixelmaster-sgtm', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}

// Load WooCommerce integration ONLY when WooCommerce is fully loaded
add_action( 'plugins_loaded', 'pm_sgtm_load_woocommerce', 20 );
function pm_sgtm_load_woocommerce() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        return;
    }
    if ( ! class_exists( 'PM_SGTM_WooCommerce' ) ) {
        require_once PM_SGTM_PLUGIN_DIR . 'includes/class-woocommerce.php';
    }
    if ( ! class_exists( 'PM_SGTM_Server_Events' ) ) {
        require_once PM_SGTM_PLUGIN_DIR . 'includes/class-woo-server-events.php';
    }
    if ( ! class_exists( 'PM_SGTM_Catalogue_Sync' ) ) {
        require_once PM_SGTM_PLUGIN_DIR . 'includes/class-catalogue-sync.php';
    }
    PM_SGTM_WooCommerce::init();
    PM_SGTM_Server_Events::init();
    PM_SGTM_Catalogue_Sync::init();
}

// Initialize core
PM_SGTM_Settings::init();
PM_SGTM_Tracker::init();
PM_SGTM_DataLayer::init();
PM_SGTM_Consent::init();
PM_SGTM_Attribution::init();
PM_SGTM_Monitor::init();
PM_SGTM_Export::init();
new PM_SGTM_Dashboard();
new PM_SGTM_Coupon();
new PM_SGTM_ABTest();
new PM_SGTM_CustomEvents();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ACTIVATION: Set defaults with autoload=no for non-critical
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
register_activation_hook( __FILE__, 'pm_sgtm_activate' );
function pm_sgtm_activate() {
    // Capability check — only admins can activate
    if ( ! current_user_can( 'activate_plugins' ) ) {
        return;
    }

    $defaults = array(
        'pm_sgtm_transport_url'      => '',
        'pm_sgtm_measurement_id'     => '',
        'pm_sgtm_container_id'       => '',
        'pm_sgtm_api_key'            => '',
        'pm_sgtm_auto_page_view'     => '1',
        'pm_sgtm_custom_loader'      => '0',
        'pm_sgtm_cookie_keeper'      => '0',
        'pm_sgtm_consent_mode'       => '1',
        'pm_sgtm_consent_default'    => 'denied',
        'pm_sgtm_consent_banner'     => '1',
        'pm_sgtm_privacy_url'        => '',
        'pm_sgtm_debug_mode'         => '0',
        'pm_sgtm_woo_tracking'       => '1',
        'pm_sgtm_server_events'      => '1',
        'pm_sgtm_exclude_roles'      => '',
        // Multi-pixel
        'pm_sgtm_meta_pixel_id'      => '',
        'pm_sgtm_meta_access_token'  => '',
        'pm_sgtm_tiktok_pixel_id'    => '',
        'pm_sgtm_tiktok_access_token'=> '',
        // Engagement tracking
        'pm_sgtm_scroll_tracking'    => '1',
        'pm_sgtm_time_tracking'      => '1',
        'pm_sgtm_download_tracking'  => '1',
        // Custom events & A/B tests (stored as JSON arrays)
        'pm_sgtm_custom_events'      => array(),
        'pm_sgtm_ab_tests'           => array(),
    );

    foreach ( $defaults as $key => $value ) {
        if ( false === get_option( $key ) ) {
            add_option( $key, $value, '', 'no' );
        }
    }

    // Store plugin version for future migrations
    update_option( 'pm_sgtm_version', PM_SGTM_VERSION, 'no' );

    // Flush rewrite rules if needed
    flush_rewrite_rules();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DEACTIVATION: Cleanup transients
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
register_deactivation_hook( __FILE__, 'pm_sgtm_deactivate' );
function pm_sgtm_deactivate() {
    if ( ! current_user_can( 'activate_plugins' ) ) {
        return;
    }
    delete_transient( 'pm_sgtm_health' );
    delete_transient( 'pm_sgtm_admin_notices' );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ADMIN AJAX: Secure connection test proxy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
add_action( 'wp_ajax_pm_sgtm_test_connection', 'pm_sgtm_ajax_test_connection' );
function pm_sgtm_ajax_test_connection() {
    // Verify nonce
    check_ajax_referer( 'pm_sgtm_admin_nonce', 'nonce' );

    // Verify capability
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array( 'message' => __( 'Unauthorized', 'pixelmaster-sgtm' ) ), 403 );
    }

    $url = isset( $_POST['url'] ) ? esc_url_raw( wp_unslash( $_POST['url'] ) ) : '';
    if ( empty( $url ) ) {
        wp_send_json_error( array( 'message' => __( 'No URL provided', 'pixelmaster-sgtm' ) ) );
    }

    // Validate URL format
    if ( ! filter_var( $url, FILTER_VALIDATE_URL ) || ! preg_match( '/^https:\/\//', $url ) ) {
        wp_send_json_error( array( 'message' => __( 'URL must use HTTPS', 'pixelmaster-sgtm' ) ) );
    }

    // Proxy the request server-side (never expose admin to external AJAX)
    $response = wp_remote_get( trailingslashit( $url ) . 'healthz', array(
        'timeout'   => 5,
        'sslverify' => true,
    ) );

    if ( is_wp_error( $response ) ) {
        wp_send_json_error( array( 'message' => $response->get_error_message() ) );
    }

    $code = wp_remote_retrieve_response_code( $response );
    if ( $code >= 200 && $code < 400 ) {
        wp_send_json_success( array( 'message' => __( 'Connected', 'pixelmaster-sgtm' ) ) );
    }

    wp_send_json_error( array( 'message' => sprintf( 'HTTP %d', $code ) ) );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ADMIN: Configuration incomplete notice
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
add_action( 'admin_notices', 'pm_sgtm_admin_notices' );
function pm_sgtm_admin_notices() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $url = get_option( 'pm_sgtm_transport_url', '' );
    if ( empty( $url ) ) {
        $settings_url = admin_url( 'admin.php?page=pixelmaster-sgtm' );
        echo '<div class="notice notice-warning is-dismissible"><p>';
        echo wp_kses(
            sprintf(
                /* translators: %s: settings page URL */
                __( '⚡ <strong>PixelMaster sGTM</strong> is active but not configured. <a href="%s">Configure now</a>.', 'pixelmaster-sgtm' ),
                esc_url( $settings_url )
            ),
            array( 'strong' => array(), 'a' => array( 'href' => array() ) )
        );
        echo '</p></div>';
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  i18n: Load text domain
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
add_action( 'init', function () {
    load_plugin_textdomain( 'pixelmaster-sgtm', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
} );
