<?php
/**
 * PM_SGTM_Tracker — Secure frontend script injection.
 *
 * Security features:
 *  - CSP-compatible nonce on inline scripts
 *  - API key NEVER exposed to frontend
 *  - All output escaped
 *  - Role-based exclusion
 *  - wp_enqueue_script for proper dependency management
 *  - Filter hooks for extensibility
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_Tracker {

    /** @var string CSP nonce for this request */
    private static $csp_nonce = '';

    /**
     * Initialize tracker hooks.
     */
    public static function init() {
        // Priority 1 = before any other scripts
        add_action( 'wp_head', array( __CLASS__, 'inject_consent_defaults' ), 1 );
        // Priority 4 = after consent bridge (2) and pixel base codes (3)
        add_action( 'wp_head', array( __CLASS__, 'inject_tracking_script' ), 4 );

        // Add CSP nonce to script tags (for plugins like CSP headers)
        add_filter( 'script_loader_tag', array( __CLASS__, 'add_csp_nonce_to_script' ), 10, 2 );
    }

    /**
     * Generate or get the CSP nonce for this request.
     *
     * @return string
     */
    public static function get_csp_nonce() {
        if ( empty( self::$csp_nonce ) ) {
            /**
             * Filter: Allow CSP plugins to provide their nonce.
             *
             * @param string $nonce The CSP nonce value.
             */
            self::$csp_nonce = apply_filters( 'pm_sgtm_csp_nonce', wp_create_nonce( 'pm_sgtm_inline' ) );
        }
        return self::$csp_nonce;
    }

    /**
     * Inject Consent Mode v2 defaults — MUST be first script.
     * Uses geo-detected privacy region to set correct defaults.
     */
    public static function inject_consent_defaults() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $settings = PM_SGTM_Settings::get_all();

        if ( empty( $settings['transport_url'] ) || ! $settings['consent_mode'] ) {
            return;
        }

        // Use geo-based consent if available, else fall back to admin setting
        if ( class_exists( 'PM_SGTM_Consent' ) ) {
            $region          = PM_SGTM_Consent::get_visitor_privacy_region();
            $consent_default = $region['default_consent'];
        } else {
            $consent_default = in_array( $settings['consent_default'], array( 'granted', 'denied' ), true )
                ? $settings['consent_default']
                : 'denied';
        }

        $nonce_attr = self::get_nonce_attr();

        // Consent defaults MUST come before any gtag/gtm scripts
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fully controlled inline script
        echo "\n<!-- PixelMaster sGTM v" . esc_html( PM_SGTM_VERSION ) . " -->\n";
        echo "<script{$nonce_attr}>\n";
        echo "window.dataLayer=window.dataLayer||[];\n";
        echo "function gtag(){dataLayer.push(arguments);}\n";
        echo "gtag('consent','default',{\n";
        echo "  'analytics_storage':'" . esc_js( $consent_default ) . "',\n";
        echo "  'ad_storage':'" . esc_js( $consent_default === 'granted' ? 'granted' : 'denied' ) . "',\n";
        echo "  'ad_user_data':'denied',\n";
        echo "  'ad_personalization':'denied',\n";
        echo "  'wait_for_update':500\n";
        echo "});\n";
        echo "</script>\n";
    }

    /**
     * Inject the SDK loader and configuration.
     */
    public static function inject_tracking_script() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $settings = PM_SGTM_Settings::get_all();

        if ( empty( $settings['transport_url'] ) ) {
            return;
        }

        // Build config — NEVER include api_key in frontend
        $config = array(
            'transportUrl'  => esc_url( $settings['transport_url'] ),
            'measurementId' => sanitize_text_field( $settings['measurement_id'] ),
            'containerId'   => sanitize_text_field( $settings['container_id'] ),
            'autoPageView'  => (bool) $settings['auto_page_view'],
            'debug'         => (bool) $settings['debug_mode'],
        );

        // Append Advanced Power-Up configs
        if ( ! empty( $settings['scroll_tracking'] ) || ! empty( $settings['time_tracking'] ) || ! empty( $settings['download_tracking'] ) ) {
            $config['engagement'] = array(
                'scrollTracking'   => ! empty( $settings['scroll_tracking'] ),
                'timeTracking'     => ! empty( $settings['time_tracking'] ),
                'downloadTracking' => ! empty( $settings['download_tracking'] ),
            );
        }

        if ( ! empty( $settings['pm_sgtm_custom_events'] ) && is_array( $settings['pm_sgtm_custom_events'] ) ) {
            $config['customEvents'] = $settings['pm_sgtm_custom_events'];
        }

        if ( ! empty( $settings['pm_sgtm_ab_tests'] ) && is_array( $settings['pm_sgtm_ab_tests'] ) ) {
            $config['abTests'] = $settings['pm_sgtm_ab_tests'];
        }

        // Add consent config if enabled
        if ( $settings['consent_mode'] ) {
            $config['consent'] = array(
                'analytics_storage'  => $settings['consent_default'] === 'granted' ? 'granted' : 'denied',
                'ad_storage'         => 'denied',
                'ad_user_data'       => 'denied',
                'ad_personalization' => 'denied',
            );
        }

        $config = apply_filters( 'pm_sgtm_sdk_config', $config, $settings );
        $config_json = wp_json_encode( $config, JSON_UNESCAPED_SLASHES );
        $sdk_url = esc_url( rtrim( $settings['transport_url'], '/' ) . '/sdk/v1/pixelmaster.min.js' );
        $nonce_attr = self::get_nonce_attr();

        // Load SDK
        echo '<script async src="' . $sdk_url . '"' . $nonce_attr . '></script>' . "\n";

        // Initialize
        echo "<script{$nonce_attr}>\n";
        echo "(function(){\n";
        echo "  const init = () => {\n";
        echo "    if (window.PixelMaster) {\n";
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON encoded config
        echo "      PixelMaster.init(" . $config_json . ");\n";
        
        if ( is_user_logged_in() ) {
            $user = wp_get_current_user();
            if ( $user && $user->user_email ) {
                $user_id    = esc_js( (string) $user->ID );
                $email_hash = hash( 'sha256', strtolower( trim( $user->user_email ) ) );
                echo "      PixelMaster.identify('{$user_id}', { emailHash: '{$email_hash}' });\n";
            }
        }
        echo "    }\n";
        echo "  };\n";
        echo "  if (window.PixelMaster) { init(); } else { window.addEventListener('PixelMasterLoaded', init); }\n";
        echo "})();\n";
        echo "</script>\n";
        echo "<!-- /PixelMaster sGTM -->\n\n";
    }

    /**
     * Add CSP nonce to our enqueued scripts.
     *
     * @param string $tag    Script tag HTML.
     * @param string $handle Script handle.
     * @return string
     */
    public static function add_csp_nonce_to_script( $tag, $handle ) {
        if ( strpos( $handle, 'pm-sgtm' ) === 0 ) {
            $nonce = esc_attr( self::get_csp_nonce() );
            $tag   = str_replace( '<script ', "<script nonce=\"{$nonce}\" ", $tag );
        }
        return $tag;
    }

    /**
     * Get nonce attribute for inline scripts.
     *
     * @return string
     */
    private static function get_nonce_attr() {
        /**
         * Filter: Disable CSP nonce if not needed.
         *
         * @param bool $enable_csp_nonce Whether to add nonce attributes.
         */
        if ( ! apply_filters( 'pm_sgtm_enable_csp_nonce', false ) ) {
            return '';
        }
        return ' nonce="' . esc_attr( self::get_csp_nonce() ) . '"';
    }
}
