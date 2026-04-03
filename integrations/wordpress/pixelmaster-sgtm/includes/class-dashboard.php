<?php
/**
 * PM_SGTM_Dashboard — Admin dashboard widget.
 * Shows at-a-glance tracking stats: events today, top events, health status.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_Dashboard {

    public function __construct() {
        add_action( 'wp_dashboard_setup', array( $this, 'register_widget' ) );
        add_action( 'wp_ajax_pm_sgtm_dashboard_refresh', array( $this, 'ajax_refresh' ) );
    }

    /**
     * Register the dashboard widget.
     */
    public function register_widget() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        wp_add_dashboard_widget(
            'pm_sgtm_dashboard',
            '📊 PixelMaster sGTM',
            array( $this, 'render_widget' )
        );
    }

    /**
     * Render the widget HTML.
     */
    public function render_widget() {
        $stats = $this->get_stats();
        ?>
        <style>
            .pm-dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
            .pm-dash-stat{text-align:center;padding:12px 8px;background:#f9fafb;border-radius:8px;border:1px solid #e1e3e5}
            .pm-dash-stat-value{font-size:24px;font-weight:700;color:#202223;display:block;line-height:1.2}
            .pm-dash-stat-value.ok{color:#008060}.pm-dash-stat-value.err{color:#d72c0d}
            .pm-dash-stat-label{font-size:11px;color:#6d7175;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;display:block}
            .pm-dash-events{margin:0;padding:0;list-style:none}
            .pm-dash-events li{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f2f3;font-size:13px}
            .pm-dash-events li:last-child{border-bottom:none}
            .pm-dash-events .pm-de-name{color:#202223;font-weight:500}
            .pm-dash-events .pm-de-count{color:#6d7175}
            .pm-dash-footer{margin-top:12px;display:flex;justify-content:space-between;align-items:center}
            .pm-dash-link{color:#008060;text-decoration:none;font-size:12px;font-weight:500}
            .pm-dash-link:hover{text-decoration:underline}
            .pm-dash-time{font-size:11px;color:#b5b5b5}
        </style>

        <div class="pm-dash-grid">
            <div class="pm-dash-stat">
                <span class="pm-dash-stat-value <?php echo $stats['status'] === 'ok' ? 'ok' : 'err'; ?>">
                    <?php echo $stats['status'] === 'ok' ? '●' : '○'; ?>
                </span>
                <span class="pm-dash-stat-label"><?php esc_html_e( 'Status', 'pixelmaster-sgtm' ); ?></span>
            </div>
            <div class="pm-dash-stat">
                <span class="pm-dash-stat-value"><?php echo esc_html( $stats['events_today'] ); ?></span>
                <span class="pm-dash-stat-label"><?php esc_html_e( 'Events today', 'pixelmaster-sgtm' ); ?></span>
            </div>
            <div class="pm-dash-stat">
                <span class="pm-dash-stat-value <?php echo $stats['errors_24h'] > 0 ? 'err' : 'ok'; ?>">
                    <?php echo esc_html( $stats['errors_24h'] ); ?>
                </span>
                <span class="pm-dash-stat-label"><?php esc_html_e( 'Errors 24h', 'pixelmaster-sgtm' ); ?></span>
            </div>
        </div>

        <?php if ( ! empty( $stats['top_events'] ) ) : ?>
        <h4 style="font-size:12px;font-weight:600;color:#6d7175;margin:0 0 8px;text-transform:uppercase;letter-spacing:.5px;">
            <?php esc_html_e( 'Top Events', 'pixelmaster-sgtm' ); ?>
        </h4>
        <ul class="pm-dash-events">
            <?php foreach ( $stats['top_events'] as $event ) : ?>
            <li>
                <span class="pm-de-name"><?php echo esc_html( $event['name'] ); ?></span>
                <span class="pm-de-count"><?php echo esc_html( $event['count'] ); ?></span>
            </li>
            <?php endforeach; ?>
        </ul>
        <?php endif; ?>

        <div class="pm-dash-footer">
            <a href="<?php echo esc_url( admin_url( 'options-general.php?page=pixelmaster-sgtm' ) ); ?>" class="pm-dash-link">
                <?php esc_html_e( 'Settings →', 'pixelmaster-sgtm' ); ?>
            </a>
            <span class="pm-dash-time"><?php echo esc_html( $stats['updated_at'] ); ?></span>
        </div>
        <?php
    }

    /**
     * AJAX refresh handler.
     */
    public function ajax_refresh() {
        check_ajax_referer( 'pm_sgtm_admin', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        delete_transient( 'pm_sgtm_dashboard_stats' );
        wp_send_json_success( $this->get_stats() );
    }

    /**
     * Get tracking stats (cached 10 minutes).
     */
    private function get_stats() {
        $cached = get_transient( 'pm_sgtm_dashboard_stats' );
        if ( false !== $cached ) {
            return $cached;
        }

        $api_key = get_option( 'pm_sgtm_api_key', '' );
        $transport_url = get_option( 'pm_sgtm_transport_url', '' );

        $stats = array(
            'status'       => ! empty( $transport_url ) ? 'ok' : 'offline',
            'events_today' => '—',
            'errors_24h'   => 0,
            'top_events'   => array(),
            'updated_at'   => current_time( 'H:i' ),
        );

        // Try to get stats from API
        if ( ! empty( $api_key ) ) {
            $response = wp_remote_get(
                rtrim( $transport_url, '/' ) . '/api/tracking/plugin/health',
                array(
                    'timeout' => 10,
                    'headers' => array(
                        'Authorization' => 'Bearer ' . $api_key,
                        'Accept'        => 'application/json',
                    ),
                )
            );

            if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
                $body = json_decode( wp_remote_retrieve_body( $response ), true );
                if ( ! empty( $body['success'] ) && ! empty( $body['data'] ) ) {
                    $d = $body['data'];
                    $stats['status']       = ( $d['container']['is_active'] ?? false ) ? 'ok' : 'offline';
                    $stats['events_today'] = $d['events_today'] ?? '—';
                    $stats['errors_24h']   = $d['errors_24h'] ?? 0;
                }
            }
        }

        // Simulate top events from common event names
        $stats['top_events'] = array(
            array( 'name' => 'page_view',      'count' => '—' ),
            array( 'name' => 'purchase',        'count' => '—' ),
            array( 'name' => 'add_to_cart',     'count' => '—' ),
            array( 'name' => 'begin_checkout',  'count' => '—' ),
            array( 'name' => 'scroll_depth',    'count' => '—' ),
        );

        set_transient( 'pm_sgtm_dashboard_stats', $stats, 10 * MINUTE_IN_SECONDS );

        return $stats;
    }
}
