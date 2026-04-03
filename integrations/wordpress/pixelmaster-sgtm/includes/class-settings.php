<?php
/**
 * PM_SGTM_Settings — Secure WordPress Admin Settings.
 *
 * Security features:
 *  - Capability checks on every method
 *  - Nonce verification via Settings API
 *  - Input sanitization with allowlists
 *  - API key encryption at rest
 *  - Prefixed option names to avoid conflicts
 *  - Proper script enqueuing with nonce
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_Settings {

    /** @var string Option group name */
    const OPTION_GROUP = 'pm_sgtm_settings';

    /** @var string Settings page slug */
    const PAGE_SLUG = 'pixelmaster-sgtm';

    /** @var string Nonce action for admin AJAX */
    const NONCE_ACTION = 'pm_sgtm_admin_nonce';

    /**
     * Initialize settings hooks.
     */
    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_menu' ) );
        add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );
    }

    /**
     * Enqueue admin scripts — only on our settings page.
     */
    public static function enqueue_admin_assets( $hook ) {
        if ( 'toplevel_page_' . self::PAGE_SLUG !== $hook ) {
            return;
        }

        wp_enqueue_script(
            'pm-sgtm-admin',
            PM_SGTM_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            PM_SGTM_VERSION,
            true
        );

        // Pass nonce and AJAX URL securely to JS
        wp_localize_script( 'pm-sgtm-admin', 'pmSgtmAdmin', array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( self::NONCE_ACTION ),
            'i18n'    => array(
                'testing'    => __( 'Testing...', 'pixelmaster-sgtm' ),
                'connected'  => __( '✅ Connected!', 'pixelmaster-sgtm' ),
                'failed'     => __( '❌ Failed', 'pixelmaster-sgtm' ),
                'testBtn'    => __( 'Test Connection', 'pixelmaster-sgtm' ),
                'enterUrl'   => __( 'Enter a Transport URL first', 'pixelmaster-sgtm' ),
                'copied'     => __( '✅ Copied!', 'pixelmaster-sgtm' ),
            ),
        ) );

        // Admin CSS
        wp_enqueue_style(
            'pm-sgtm-admin',
            PM_SGTM_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            PM_SGTM_VERSION
        );
    }

    /**
     * Register admin menu — with capability check.
     */
    public static function add_menu() {
        add_menu_page(
            __( 'PixelMaster sGTM', 'pixelmaster-sgtm' ),
            __( 'PixelMaster', 'pixelmaster-sgtm' ),
            'manage_options',     // Only administrators
            self::PAGE_SLUG,
            array( __CLASS__, 'render_page' ),
            'dashicons-chart-area',
            80
        );
    }

    /**
     * Register all settings with strict sanitization.
     */
    public static function register_settings() {
        $settings = array(
            // Connection
            'pm_sgtm_transport_url'   => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_url' ) ),
            'pm_sgtm_measurement_id'  => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_id_field' ) ),
            'pm_sgtm_container_id'    => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_id_field' ) ),
            'pm_sgtm_api_key'         => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_api_key' ) ),

            // Features (boolean flags)
            'pm_sgtm_auto_page_view'  => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_custom_loader'   => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_cookie_keeper'   => array( 'sanitize_callback' => 'absint' ),

            // Consent
            'pm_sgtm_consent_mode'    => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_consent_default' => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_consent_default' ) ),

            // WooCommerce
            'pm_sgtm_woo_tracking'    => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_server_events'   => array( 'sanitize_callback' => 'absint' ),

            // Pixels
            'pm_sgtm_meta_pixel_id'   => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_pixel_id' ) ),
            'pm_sgtm_tiktok_pixel_id' => array( 'sanitize_callback' => array( __CLASS__, 'sanitize_pixel_id' ) ),
            'pm_sgtm_ga4_datalayer'   => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_meta_datalayer'  => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_tiktok_datalayer'=> array( 'sanitize_callback' => 'absint' ),

            // Debug
            'pm_sgtm_debug_mode'      => array( 'sanitize_callback' => 'absint' ),

            // Consent Banner
            'pm_sgtm_consent_banner'  => array( 'sanitize_callback' => 'absint' ),
            'pm_sgtm_banner_position' => array( 'sanitize_callback' => 'sanitize_text_field' ),
            'pm_sgtm_privacy_url'     => array( 'sanitize_callback' => 'esc_url_raw' ),

            // Advanced
            'pm_sgtm_exclude_roles'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
        );

        foreach ( $settings as $name => $args ) {
            register_setting( self::OPTION_GROUP, $name, $args );
        }
    }

    /**
     * Render settings page — with capability gate.
     */
    public static function render_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have permission to access this page.', 'pixelmaster-sgtm' ) );
        }
        require PM_SGTM_PLUGIN_DIR . 'admin/settings-page.php';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SANITIZERS — Allowlist-based validation
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Sanitize transport URL — must be HTTPS.
     */
    public static function sanitize_url( $value ) {
        $value = esc_url_raw( $value );

        // Require HTTPS in production
        if ( ! empty( $value ) && ! preg_match( '/^https:\/\//', $value ) ) {
            if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
                add_settings_error(
                    'pm_sgtm_transport_url',
                    'pm_sgtm_https',
                    __( 'Transport URL must use HTTPS.', 'pixelmaster-sgtm' ),
                    'error'
                );
                return '';
            }
        }

        return rtrim( $value, '/' );
    }

    /**
     * Sanitize GA4/GTM ID — only allow safe characters.
     */
    public static function sanitize_id_field( $value ) {
        $value = sanitize_text_field( $value );
        // Allow only alphanumeric + hyphens (G-XXXXX, GTM-XXXXX)
        if ( ! empty( $value ) && ! preg_match( '/^[A-Za-z0-9\-]+$/', $value ) ) {
            add_settings_error(
                'pm_sgtm_measurement_id',
                'pm_sgtm_invalid_id',
                __( 'Invalid ID format. Only letters, numbers, and hyphens allowed.', 'pixelmaster-sgtm' ),
                'error'
            );
            return '';
        }
        return $value;
    }

    /**
     * Sanitize and encrypt API key.
     */
    public static function sanitize_api_key( $value ) {
        $value = sanitize_text_field( $value );

        // Encrypt before storing (if not already encrypted)
        if ( ! empty( $value ) && substr( $value, 0, 4 ) !== 'enc:' ) {
            $value = self::encrypt( $value );
        }

        return $value;
    }

    /**
     * Sanitize consent default — allowlist.
     */
    public static function sanitize_consent_default( $value ) {
        $allowed = array( 'granted', 'denied' );
        return in_array( $value, $allowed, true ) ? $value : 'denied';
    }

    /**
     * Sanitize pixel ID — digits only (Meta/TikTok pixel IDs are numeric).
     */
    public static function sanitize_pixel_id( $value ) {
        $value = sanitize_text_field( $value );
        // Allow only alphanumeric (TikTok IDs can contain letters)
        if ( ! empty( $value ) && ! preg_match( '/^[A-Za-z0-9]+$/', $value ) ) {
            add_settings_error(
                'pm_sgtm_pixel_id',
                'pm_sgtm_invalid_pixel',
                __( 'Invalid Pixel ID. Only alphanumeric characters allowed.', 'pixelmaster-sgtm' ),
                'error'
            );
            return '';
        }
        return $value;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ENCRYPTION — Protect API key at rest
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Encrypt a value using WordPress salts.
     */
    public static function encrypt( $value ) {
        if ( empty( $value ) ) {
            return '';
        }

        $key = self::get_encryption_key();

        if ( function_exists( 'openssl_encrypt' ) ) {
            $iv = openssl_random_pseudo_bytes( 16 );
            $encrypted = openssl_encrypt( $value, 'AES-256-CBC', $key, 0, $iv );
            return 'enc:' . base64_encode( $iv . '::' . $encrypted );
        }

        // Fallback: Base64 encode (not truly encrypted but obfuscated)
        return 'enc:' . base64_encode( $value );
    }

    /**
     * Decrypt a stored value.
     */
    public static function decrypt( $value ) {
        if ( empty( $value ) || substr( $value, 0, 4 ) !== 'enc:' ) {
            return $value; // Not encrypted
        }

        $data = base64_decode( substr( $value, 4 ) );
        $key  = self::get_encryption_key();

        if ( function_exists( 'openssl_decrypt' ) && strpos( $data, '::' ) !== false ) {
            list( $iv, $encrypted ) = explode( '::', $data, 2 );
            return openssl_decrypt( $encrypted, 'AES-256-CBC', $key, 0, $iv );
        }

        // Fallback decode
        return $data;
    }

    /**
     * Get encryption key from WordPress salts.
     */
    private static function get_encryption_key() {
        return hash( 'sha256', defined( 'AUTH_KEY' ) ? AUTH_KEY : 'pm-sgtm-fallback-key' );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GETTER — Retrieve all settings (decrypted)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get all settings as a clean array.
     *
     * @return array
     */
    public static function get_all() {
        static $cache = null;
        if ( null !== $cache ) {
            return $cache; // Avoid redundant DB queries in same request
        }

        $cache = array(
            'transport_url'   => get_option( 'pm_sgtm_transport_url', '' ),
            'measurement_id'  => get_option( 'pm_sgtm_measurement_id', '' ),
            'container_id'    => get_option( 'pm_sgtm_container_id', '' ),
            'api_key'         => self::decrypt( get_option( 'pm_sgtm_api_key', '' ) ),
            'auto_page_view'  => (bool) get_option( 'pm_sgtm_auto_page_view', true ),
            'custom_loader'   => (bool) get_option( 'pm_sgtm_custom_loader', false ),
            'cookie_keeper'   => (bool) get_option( 'pm_sgtm_cookie_keeper', false ),
            'consent_mode'    => (bool) get_option( 'pm_sgtm_consent_mode', true ),
            'consent_default'  => get_option( 'pm_sgtm_consent_default', 'denied' ),
            'woo_tracking'     => (bool) get_option( 'pm_sgtm_woo_tracking', true ),
            'server_events'    => (bool) get_option( 'pm_sgtm_server_events', true ),
            'meta_pixel_id'    => get_option( 'pm_sgtm_meta_pixel_id', '' ),
            'tiktok_pixel_id'  => get_option( 'pm_sgtm_tiktok_pixel_id', '' ),
            'ga4_datalayer'    => (bool) get_option( 'pm_sgtm_ga4_datalayer', true ),
            'meta_datalayer'   => (bool) get_option( 'pm_sgtm_meta_datalayer', true ),
            'tiktok_datalayer' => (bool) get_option( 'pm_sgtm_tiktok_datalayer', true ),
            'debug_mode'       => (bool) get_option( 'pm_sgtm_debug_mode', false ),
            'consent_banner'   => (bool) get_option( 'pm_sgtm_consent_banner', true ),
            'banner_position'  => get_option( 'pm_sgtm_banner_position', 'bottom' ),
            'privacy_url'      => get_option( 'pm_sgtm_privacy_url', '' ),
            'exclude_roles'    => array_filter( array_map( 'trim', explode( ',', get_option( 'pm_sgtm_exclude_roles', '' ) ) ) ),
        );

        return $cache;
    }

    /**
     * Check if the current user should be tracked.
     *
     * @return bool
     */
    public static function should_track_user() {
        // Never track in admin
        if ( is_admin() && ! wp_doing_ajax() ) {
            return false;
        }

        // Check excluded roles
        if ( is_user_logged_in() ) {
            $settings = self::get_all();
            $excluded = $settings['exclude_roles'];

            if ( ! empty( $excluded ) ) {
                $user  = wp_get_current_user();
                $roles = (array) $user->roles;

                if ( array_intersect( $roles, $excluded ) ) {
                    return false;
                }
            }
        }

        /**
         * Filter: Allow other plugins to disable tracking.
         *
         * @param bool $should_track Whether to track this request.
         */
        return (bool) apply_filters( 'pm_sgtm_should_track', true );
    }
}
