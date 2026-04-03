<?php
/**
 * PM_SGTM_Export — Settings Export/Import & Snippet Generator.
 *
 * Export all plugin settings as JSON, import from JSON,
 * and generate universal tracking snippets for non-WP sites.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_Export {

    /**
     * Initialize hooks.
     */
    public static function init() {
        add_action( 'wp_ajax_pm_sgtm_export', array( __CLASS__, 'ajax_export' ) );
        add_action( 'wp_ajax_pm_sgtm_import', array( __CLASS__, 'ajax_import' ) );
        add_action( 'wp_ajax_pm_sgtm_snippet', array( __CLASS__, 'ajax_snippet' ) );
    }

    /**
     * AJAX: Export settings as JSON download.
     */
    public static function ajax_export() {
        check_ajax_referer( PM_SGTM_Settings::NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }

        $settings = PM_SGTM_Settings::get_all();

        // Remove sensitive data — dont export raw API key
        $export = $settings;
        if ( ! empty( $export['api_key'] ) ) {
            $export['api_key'] = '***REDACTED***';
        }

        $export['_meta'] = array(
            'plugin_version' => PM_SGTM_VERSION,
            'site_url'       => home_url(),
            'exported_at'    => current_time( 'c' ),
            'php_version'    => PHP_VERSION,
            'wp_version'     => get_bloginfo( 'version' ),
        );

        wp_send_json_success( $export );
    }

    /**
     * AJAX: Import settings from JSON.
     */
    public static function ajax_import() {
        check_ajax_referer( PM_SGTM_Settings::NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }

        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        $raw = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : '';
        $data = json_decode( $raw, true );

        if ( ! is_array( $data ) ) {
            wp_send_json_error( array( 'message' => 'Invalid JSON' ) );
        }

        // Whitelist of allowed option keys
        $allowed = array(
            'transport_url', 'measurement_id', 'container_id',
            'auto_page_view', 'custom_loader', 'cookie_keeper',
            'consent_mode', 'consent_default', 'consent_banner',
            'banner_position', 'privacy_url',
            'ga4_datalayer', 'meta_pixel_id', 'meta_datalayer',
            'tiktok_pixel_id', 'tiktok_datalayer',
            'woo_tracking', 'server_events',
            'exclude_roles', 'debug_mode',
            'scroll_tracking', 'time_tracking', 'download_tracking',
        );

        $imported = 0;
        foreach ( $allowed as $key ) {
            if ( array_key_exists( $key, $data ) ) {
                $option_name = 'pm_sgtm_' . $key;
                update_option( $option_name, sanitize_text_field( $data[ $key ] ) );
                $imported++;
            }
        }

        wp_send_json_success( array(
            'message'  => sprintf( '%d settings imported', $imported ),
            'imported' => $imported,
        ) );
    }

    /**
     * AJAX: Generate universal tracking snippet.
     */
    public static function ajax_snippet() {
        check_ajax_referer( PM_SGTM_Settings::NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }

        $settings = PM_SGTM_Settings::get_all();
        $url      = $settings['transport_url'] ?? '';
        $mid      = $settings['measurement_id'] ?? '';
        $meta_id  = $settings['meta_pixel_id'] ?? '';
        $tt_id    = $settings['tiktok_pixel_id'] ?? '';

        if ( empty( $url ) ) {
            wp_send_json_error( array( 'message' => 'Configure Transport URL first' ) );
        }

        // Build the universal snippet
        $snippet = "<!-- PixelMaster sGTM - Universal Snippet -->\n";
        $snippet .= "<script>\n";

        // Consent defaults
        $snippet .= "window.dataLayer=window.dataLayer||[];\n";
        $snippet .= "function gtag(){dataLayer.push(arguments);}\n";
        $snippet .= "gtag('consent','default',{\n";
        $snippet .= "  'analytics_storage':'denied',\n";
        $snippet .= "  'ad_storage':'denied',\n";
        $snippet .= "  'ad_user_data':'denied',\n";
        $snippet .= "  'ad_personalization':'denied',\n";
        $snippet .= "  'wait_for_update':500\n";
        $snippet .= "});\n";
        $snippet .= "</script>\n";

        // GA4
        if ( $mid ) {
            $snippet .= "<script async src=\"" . esc_url( $url . '/gtag/js?id=' . $mid ) . "\"></script>\n";
            $snippet .= "<script>\n";
            $snippet .= "gtag('js',new Date());\n";
            $snippet .= "gtag('config','" . esc_js( $mid ) . "',{\n";
            $snippet .= "  'transport_url':'" . esc_js( $url ) . "',\n";
            $snippet .= "  'first_party_collection':true\n";
            $snippet .= "});\n";
            $snippet .= "</script>\n";
        }

        // Meta Pixel
        if ( $meta_id ) {
            $snippet .= "<script>\n";
            $snippet .= "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n";
            $snippet .= "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\n";
            $snippet .= "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\n";
            $snippet .= "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}\n";
            $snippet .= "(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');\n";
            $snippet .= "fbq('init','" . esc_js( $meta_id ) . "');\n";
            $snippet .= "fbq('track','PageView');\n";
            $snippet .= "</script>\n";
        }

        // TikTok Pixel
        if ( $tt_id ) {
            $snippet .= "<script>\n";
            $snippet .= "!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];\n";
            $snippet .= "ttq.methods=['page','track','identify','instances','debug','on','off','once','ready'];\n";
            $snippet .= "ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))};};\n";
            $snippet .= "for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);\n";
            $snippet .= "ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';\n";
            $snippet .= "ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};\n";
            $snippet .= "ttq._t[e+'']=+new Date;ttq._o=ttq._o||{};ttq._o[e+'']=n||{};\n";
            $snippet .= "var s=d.createElement('script');s.async=!0;s.src=r+'?sdkid='+e+'&lib='+t;\n";
            $snippet .= "d.getElementsByTagName('head')[0].appendChild(s)};\n";
            $snippet .= "ttq.load('" . esc_js( $tt_id ) . "');ttq.page();\n";
            $snippet .= "}(window,document,'ttq');\n";
            $snippet .= "</script>\n";
        }

        $snippet .= "<!-- /PixelMaster sGTM -->\n";

        wp_send_json_success( array( 'snippet' => $snippet ) );
    }
}
