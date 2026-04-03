<?php
/**
 * PM_SGTM_Monitor — Event Monitor & Health Dashboard.
 *
 * Provides real-time event monitoring, health checks, and
 * AJAX endpoints for the admin dashboard widget.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_Monitor {

    /**
     * Initialize hooks.
     */
    public static function init() {
        add_action( 'wp_ajax_pm_sgtm_health', array( __CLASS__, 'ajax_health_check' ) );
        add_action( 'wp_ajax_pm_sgtm_event_logs', array( __CLASS__, 'ajax_event_logs' ) );
    }

    /**
     * AJAX: Health check — tests connection to transport URL + fetches health from API.
     */
    public static function ajax_health_check() {
        check_ajax_referer( PM_SGTM_Settings::NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }

        $settings = PM_SGTM_Settings::get_all();
        $url      = $settings['transport_url'] ?? '';
        $api_key  = $settings['api_key'] ?? '';

        if ( empty( $url ) ) {
            wp_send_json_error( array( 'message' => 'Transport URL not configured' ) );
        }

        $health = array(
            'transport_url' => $url,
            'status'        => 'unknown',
            'latency_ms'    => 0,
            'destinations'  => array(),
            'checked_at'    => current_time( 'mysql' ),
        );

        // Test connection to transport URL
        $start = microtime( true );
        $response = wp_remote_get( trailingslashit( $url ) . 'healthz', array(
            'timeout'   => 10,
            'sslverify' => true,
        ) );
        $latency = round( ( microtime( true ) - $start ) * 1000 );

        $health['latency_ms'] = $latency;

        if ( is_wp_error( $response ) ) {
            $health['status'] = 'error';
            $health['error']  = $response->get_error_message();
        } else {
            $code = wp_remote_retrieve_response_code( $response );
            $health['status'] = ( $code >= 200 && $code < 400 ) ? 'ok' : 'error';
            $health['http_code'] = $code;
        }

        // Fetch health from PixelMaster API if API key available
        if ( ! empty( $api_key ) ) {
            $api_response = wp_remote_get(
                trailingslashit( $url ) . 'api/tracking/plugin/health',
                array(
                    'timeout' => 10,
                    'headers' => array(
                        'Authorization' => 'Bearer ' . $api_key,
                        'Accept'        => 'application/json',
                    ),
                )
            );

            if ( ! is_wp_error( $api_response ) ) {
                $body = json_decode( wp_remote_retrieve_body( $api_response ), true );
                if ( ! empty( $body['data'] ) ) {
                    $health['destinations'] = $body['data']['destinations'] ?? array();
                    $health['events_today'] = $body['data']['events_today'] ?? 0;
                    $health['container']    = $body['data']['container'] ?? array();
                }
            }
        }

        // Cache for 5 minutes
        set_transient( 'pm_sgtm_health', $health, 300 );

        wp_send_json_success( $health );
    }

    /**
     * AJAX: Fetch recent event logs from PixelMaster API.
     */
    public static function ajax_event_logs() {
        check_ajax_referer( PM_SGTM_Settings::NONCE_ACTION, 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }

        $settings = PM_SGTM_Settings::get_all();
        $url      = $settings['transport_url'] ?? '';
        $api_key  = $settings['api_key'] ?? '';

        if ( empty( $url ) || empty( $api_key ) ) {
            wp_send_json_error( array( 'message' => 'API key required for event logs' ) );
        }

        $response = wp_remote_get(
            trailingslashit( $url ) . 'api/tracking/plugin/logs?limit=50',
            array(
                'timeout' => 15,
                'headers' => array(
                    'Authorization' => 'Bearer ' . $api_key,
                    'Accept'        => 'application/json',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            wp_send_json_error( array( 'message' => $response->get_error_message() ) );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $body['success'] ) ) {
            wp_send_json_error( array( 'message' => $body['message'] ?? 'API error' ) );
        }

        wp_send_json_success( $body['data'] ?? array() );
    }

    /**
     * Get cached health data (for admin page rendering).
     *
     * @return array|false
     */
    public static function get_cached_health() {
        return get_transient( 'pm_sgtm_health' );
    }
}
