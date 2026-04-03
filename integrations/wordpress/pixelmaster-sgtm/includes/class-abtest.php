<?php
/**
 * PM_SGTM_ABTest — A/B Test variant tracking.
 * Assigns visitors to test variants and pushes experiment data to dataLayer.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_ABTest {

    /** @var array Registered tests */
    private $tests = array();

    public function __construct() {
        $this->tests = get_option( 'pm_sgtm_ab_tests', array() );

        if ( ! empty( $this->tests ) ) {
            add_action( 'wp_head', array( $this, 'inject_experiment_data' ), 1 );
        }

        // Admin AJAX
        add_action( 'wp_ajax_pm_sgtm_save_ab_tests', array( $this, 'save_tests' ) );
        add_action( 'wp_ajax_pm_sgtm_get_ab_tests', array( $this, 'get_tests' ) );
    }

    /**
     * Inject experiment/variant into dataLayer on every page.
     */
    public function inject_experiment_data() {
        if ( empty( $this->tests ) ) {
            return;
        }

        $experiments = array();

        foreach ( $this->tests as $test ) {
            if ( empty( $test['active'] ) ) {
                continue;
            }

            $variant = $this->get_visitor_variant( $test );
            $experiments[] = array(
                'experiment_id'   => sanitize_title( $test['id'] ),
                'experiment_name' => sanitize_text_field( $test['name'] ),
                'variant_id'      => $variant['id'],
                'variant_name'    => $variant['name'],
                'traffic_pct'     => $variant['weight'],
            );
        }

        if ( empty( $experiments ) ) {
            return;
        }

        echo '<script>' . "\n";
        echo 'window.dataLayer=window.dataLayer||[];' . "\n";
        printf(
            'dataLayer.push({event:"experiment_impression",experiments:%s});' . "\n",
            wp_json_encode( $experiments )
        );

        // GA4 experiment fields
        foreach ( $experiments as $exp ) {
            printf(
                'dataLayer.push({"experiment_id":%s,"experiment_variant":%s});' . "\n",
                wp_json_encode( $exp['experiment_id'] ),
                wp_json_encode( $exp['variant_id'] )
            );
        }

        echo '</script>' . "\n";
    }

    /**
     * Assign visitor to a variant (sticky via cookie).
     */
    private function get_visitor_variant( $test ) {
        $cookie_name = 'pm_ab_' . sanitize_title( $test['id'] );
        $variants    = $test['variants'] ?? array();

        if ( empty( $variants ) ) {
            return array( 'id' => 'control', 'name' => 'Control', 'weight' => 100 );
        }

        // Check existing assignment
        if ( isset( $_COOKIE[ $cookie_name ] ) ) {
            $assigned = sanitize_text_field( wp_unslash( $_COOKIE[ $cookie_name ] ) );
            foreach ( $variants as $v ) {
                if ( $v['id'] === $assigned ) {
                    return $v;
                }
            }
        }

        // Assign randomly based on weights
        $total  = array_sum( array_column( $variants, 'weight' ) );
        $rand   = mt_rand( 1, max( $total, 1 ) );
        $cumul  = 0;
        $chosen = $variants[0];

        foreach ( $variants as $v ) {
            $cumul += (int) ( $v['weight'] ?? 50 );
            if ( $rand <= $cumul ) {
                $chosen = $v;
                break;
            }
        }

        // Set cookie (90 days)
        setcookie( $cookie_name, $chosen['id'], time() + 90 * DAY_IN_SECONDS, '/', '', is_ssl(), false );

        return $chosen;
    }

    /**
     * AJAX: Save A/B tests.
     */
    public function save_tests() {
        check_ajax_referer( 'pm_sgtm_admin', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        $raw   = isset( $_POST['tests'] ) ? wp_unslash( $_POST['tests'] ) : '[]';
        $tests = json_decode( $raw, true );

        if ( ! is_array( $tests ) ) {
            wp_send_json_error( array( 'message' => 'Invalid data' ) );
        }

        // Sanitize
        $clean = array();
        foreach ( $tests as $test ) {
            $t = array(
                'id'       => sanitize_title( $test['id'] ?? wp_generate_uuid4() ),
                'name'     => sanitize_text_field( $test['name'] ?? '' ),
                'active'   => ! empty( $test['active'] ),
                'variants' => array(),
            );

            foreach ( $test['variants'] ?? array() as $v ) {
                $t['variants'][] = array(
                    'id'     => sanitize_title( $v['id'] ?? '' ),
                    'name'   => sanitize_text_field( $v['name'] ?? '' ),
                    'weight' => absint( $v['weight'] ?? 50 ),
                );
            }

            if ( ! empty( $t['name'] ) && ! empty( $t['variants'] ) ) {
                $clean[] = $t;
            }
        }

        update_option( 'pm_sgtm_ab_tests', $clean );
        wp_send_json_success( array( 'message' => 'Tests saved', 'count' => count( $clean ) ) );
    }

    /**
     * AJAX: Get A/B tests.
     */
    public function get_tests() {
        check_ajax_referer( 'pm_sgtm_admin', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        wp_send_json_success( $this->tests );
    }
}
