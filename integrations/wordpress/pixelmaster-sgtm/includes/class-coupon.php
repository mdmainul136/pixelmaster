<?php
/**
 * PM_SGTM_Coupon — WooCommerce coupon tracking.
 * Auto-pushes coupon_applied and coupon_removed events to dataLayer.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_Coupon {

    public function __construct() {
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }

        // Coupon applied
        add_action( 'woocommerce_applied_coupon', array( $this, 'coupon_applied' ) );
        // Coupon removed
        add_action( 'woocommerce_removed_coupon', array( $this, 'coupon_removed' ) );
        // Push coupon data on checkout page
        add_action( 'woocommerce_before_checkout_form', array( $this, 'checkout_coupon_data' ) );
        // Inject script to capture dataLayer events
        add_action( 'wp_footer', array( $this, 'inject_coupon_scripts' ), 90 );
    }

    /**
     * Handle coupon applied (server-side, queues for JS output).
     */
    public function coupon_applied( $coupon_code ) {
        $coupon = new WC_Coupon( $coupon_code );
        $data   = $this->get_coupon_data( $coupon );

        WC()->session->set( 'pm_sgtm_coupon_event', array(
            'action' => 'applied',
            'data'   => $data,
        ) );
    }

    /**
     * Handle coupon removed.
     */
    public function coupon_removed( $coupon_code ) {
        WC()->session->set( 'pm_sgtm_coupon_event', array(
            'action' => 'removed',
            'data'   => array(
                'coupon_code' => sanitize_text_field( $coupon_code ),
            ),
        ) );
    }

    /**
     * Push existing coupon data at checkout.
     */
    public function checkout_coupon_data() {
        $cart    = WC()->cart;
        $coupons = $cart->get_applied_coupons();

        if ( empty( $coupons ) ) {
            return;
        }

        $coupon_data = array();
        $total_discount = 0;

        foreach ( $coupons as $code ) {
            $coupon     = new WC_Coupon( $code );
            $discount   = $cart->get_coupon_discount_amount( $code );
            $total_discount += $discount;

            $coupon_data[] = array(
                'coupon_code'     => $code,
                'discount_amount' => (float) $discount,
                'discount_type'   => $coupon->get_discount_type(),
                'free_shipping'   => $coupon->get_free_shipping(),
            );
        }

        WC()->session->set( 'pm_sgtm_checkout_coupons', array(
            'coupons'        => $coupon_data,
            'total_discount' => $total_discount,
            'coupon_count'   => count( $coupons ),
        ) );
    }

    /**
     * Inject coupon tracking scripts in footer.
     */
    public function inject_coupon_scripts() {
        if ( ! WC()->session ) {
            return;
        }

        $event          = WC()->session->get( 'pm_sgtm_coupon_event' );
        $checkout_data  = WC()->session->get( 'pm_sgtm_checkout_coupons' );

        if ( ! $event && ! $checkout_data ) {
            return;
        }

        echo '<script>' . "\n";
        echo 'window.dataLayer=window.dataLayer||[];' . "\n";

        if ( $event ) {
            $action = $event['action'];
            $data   = $event['data'];

            if ( 'applied' === $action ) {
                printf(
                    'dataLayer.push({event:"coupon_applied",coupon_code:%s,discount_amount:%s,discount_type:%s,free_shipping:%s});' . "\n",
                    wp_json_encode( $data['coupon_code'] ),
                    wp_json_encode( $data['discount_amount'] ),
                    wp_json_encode( $data['discount_type'] ),
                    wp_json_encode( $data['free_shipping'] )
                );
            } elseif ( 'removed' === $action ) {
                printf(
                    'dataLayer.push({event:"coupon_removed",coupon_code:%s});' . "\n",
                    wp_json_encode( $data['coupon_code'] )
                );
            }

            WC()->session->set( 'pm_sgtm_coupon_event', null );
        }

        if ( $checkout_data ) {
            printf(
                'dataLayer.push({event:"checkout_coupons",coupons:%s,total_discount:%s,coupon_count:%d});' . "\n",
                wp_json_encode( $checkout_data['coupons'] ),
                wp_json_encode( $checkout_data['total_discount'] ),
                $checkout_data['coupon_count']
            );

            WC()->session->set( 'pm_sgtm_checkout_coupons', null );
        }

        echo '</script>' . "\n";
    }

    /**
     * Extract coupon data for dataLayer.
     */
    private function get_coupon_data( $coupon ) {
        $cart     = WC()->cart;
        $code     = $coupon->get_code();
        $discount = $cart ? $cart->get_coupon_discount_amount( $code ) : 0;

        return array(
            'coupon_code'     => $code,
            'discount_amount' => (float) $discount,
            'discount_type'   => $coupon->get_discount_type(),
            'free_shipping'   => $coupon->get_free_shipping(),
            'coupon_amount'   => (float) $coupon->get_amount(),
            'minimum_amount'  => (float) $coupon->get_minimum_amount(),
        );
    }
}
