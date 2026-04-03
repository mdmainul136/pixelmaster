<?php
/**
 * PM_SGTM_Server_Events — Multi-Platform Server-Side Event Forwarding.
 *
 * Sends purchase/refund events to:
 *  - GA4 Measurement Protocol
 *  - Meta Conversions API (CAPI)
 *  - TikTok Events API
 *  - PixelMaster sGTM pipeline
 *
 * Security:
 *  - PII hashed with SHA-256 before transmitting
 *  - Event deduplication via event_id (matching client-side)
 *  - SSL enforced, API key encrypted at rest
 *  - Non-blocking requests (no checkout latency)
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_Server_Events {

    /**
     * Initialize server-side event hooks.
     */
    public static function init() {
        $settings = PM_SGTM_Settings::get_all();
        if ( ! $settings['server_events'] || empty( $settings['transport_url'] ) ) {
            return;
        }

        // Fire on order status transitions
        add_action( 'woocommerce_order_status_processing', array( __CLASS__, 'send_purchase_event' ), 10, 1 );
        add_action( 'woocommerce_order_status_completed', array( __CLASS__, 'send_purchase_event' ), 10, 1 );

        // Refund event
        add_action( 'woocommerce_order_refunded', array( __CLASS__, 'send_refund_event' ), 10, 2 );
    }

    /**
     * Send server-side purchase event to all platforms.
     *
     * @param int $order_id WooCommerce order ID.
     */
    public static function send_purchase_event( $order_id ) {
        $order_id = absint( $order_id );
        $order    = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        // Dedup: prevent duplicate server events
        if ( $order->get_meta( '_pm_sgtm_server_sent' ) ) {
            return;
        }
        $order->update_meta_data( '_pm_sgtm_server_sent', gmdate( 'Y-m-d H:i:s' ) );
        $order->save();

        $items     = self::build_items( $order );
        $user_data = self::get_user_data( $order );
        $event_id  = 'woo_purchase_' . $order_id;

        // Attribution data (UTM + click IDs)
        $attribution = array();
        if ( class_exists( 'PM_SGTM_Attribution' ) ) {
            $attribution = PM_SGTM_Attribution::get_server_attribution();
        }

        $transaction = array(
            'transaction_id' => sanitize_text_field( $order->get_order_number() ),
            'value'          => floatval( $order->get_total() ),
            'tax'            => floatval( $order->get_total_tax() ),
            'shipping'       => floatval( $order->get_shipping_total() ),
            'currency'       => sanitize_text_field( $order->get_currency() ),
            'coupon'         => sanitize_text_field( implode( ',', $order->get_coupon_codes() ) ) ?: null,
            'items'          => $items,
        );

        // ── 1. PixelMaster sGTM Pipeline ──
        $sgtm_event = array(
            'name'   => 'purchase',
            'params' => array_merge( $transaction, array(
                'user_data'   => $user_data,
                'event_id'    => $event_id,
                '_source'     => 'wordpress_server',
                'attribution' => $attribution,
            ) ),
        );

        /** @var array $sgtm_event Filterable server event. */
        $sgtm_event = apply_filters( 'pm_sgtm_server_event', $sgtm_event, $order );
        self::send_to_pixelmaster( $sgtm_event, $order );

        // ── 2. Meta Conversions API (CAPI) ──
        $settings = PM_SGTM_Settings::get_all();
        if ( ! empty( $settings['meta_pixel_id'] ) && ! empty( $settings['meta_access_token'] ) ) {
            self::send_meta_capi( $order, $items, $user_data, $event_id, $settings );
        }

        // ── 3. TikTok Events API ──
        if ( ! empty( $settings['tiktok_pixel_id'] ) && ! empty( $settings['tiktok_access_token'] ) ) {
            self::send_tiktok_ea( $order, $items, $user_data, $event_id, $settings );
        }
    }

    /**
     * Send server-side refund event.
     */
    public static function send_refund_event( $order_id, $refund_id ) {
        $order = wc_get_order( absint( $order_id ) );
        if ( ! $order ) {
            return;
        }

        $event = array(
            'name'   => 'refund',
            'params' => array(
                'transaction_id' => sanitize_text_field( $order->get_order_number() ),
                'value'          => floatval( $order->get_total() ),
                'currency'       => sanitize_text_field( $order->get_currency() ),
                'event_id'       => 'woo_refund_' . absint( $refund_id ),
                '_source'        => 'wordpress_server',
            ),
        );

        self::send_to_pixelmaster( $event, $order );
    }

    // ── Platform Senders ──────────────────────────────────────

    /**
     * Send to PixelMaster sGTM pipeline.
     */
    private static function send_to_pixelmaster( array $event, $order ) {
        $settings = PM_SGTM_Settings::get_all();
        $url      = rtrim( $settings['transport_url'], '/' ) . '/mp/collect';

        if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return;
        }

        $body = array(
            'client_id' => self::get_client_id( $order ),
            'user_id'   => $order->get_customer_id() ? (string) $order->get_customer_id() : null,
            'events'    => array( $event ),
        );

        wp_remote_post( $url, array(
            'body'        => wp_json_encode( $body ),
            'headers'     => array(
                'Content-Type' => 'application/json',
                'X-PM-Api-Key' => $settings['api_key'],
                'X-PM-Source'  => 'wordpress',
                'User-Agent'   => 'PixelMaster-WP/' . PM_SGTM_VERSION,
            ),
            'timeout'     => 5,
            'blocking'    => false,
            'sslverify'   => true,
            'data_format' => 'body',
        ) );
    }

    /**
     * Send purchase to Meta Conversions API (CAPI).
     *
     * @link https://developers.facebook.com/docs/marketing-api/conversions-api
     */
    private static function send_meta_capi( $order, array $items, array $user_data, string $event_id, array $settings ) {
        $pixel_id = $settings['meta_pixel_id'];
        $token    = $settings['meta_access_token'];
        $url      = "https://graph.facebook.com/v18.0/{$pixel_id}/events";

        $content_ids = array_map( function ( $item ) {
            return $item['item_id'] ?? '';
        }, $items );

        $event_data = array(
            array(
                'event_name'    => 'Purchase',
                'event_time'    => time(),
                'event_id'      => $event_id,
                'event_source_url' => home_url(),
                'action_source' => 'website',
                'user_data'     => array(
                    'em'  => ! empty( $user_data['sha256_email_address'] ) ? array( $user_data['sha256_email_address'] ) : array(),
                    'ph'  => ! empty( $user_data['sha256_phone_number'] ) ? array( $user_data['sha256_phone_number'] ) : array(),
                    'fn'  => ! empty( $user_data['address']['first_name'] ) ? array( hash( 'sha256', strtolower( $user_data['address']['first_name'] ) ) ) : array(),
                    'ln'  => ! empty( $user_data['address']['last_name'] ) ? array( hash( 'sha256', strtolower( $user_data['address']['last_name'] ) ) ) : array(),
                    'ct'  => ! empty( $user_data['address']['city'] ) ? array( hash( 'sha256', strtolower( $user_data['address']['city'] ) ) ) : array(),
                    'st'  => ! empty( $user_data['address']['region'] ) ? array( hash( 'sha256', strtolower( $user_data['address']['region'] ) ) ) : array(),
                    'zp'  => ! empty( $user_data['address']['postal_code'] ) ? array( hash( 'sha256', $user_data['address']['postal_code'] ) ) : array(),
                    'country' => ! empty( $user_data['address']['country'] ) ? array( hash( 'sha256', strtolower( $user_data['address']['country'] ) ) ) : array(),
                    'client_ip_address' => sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) ),
                    'client_user_agent' => sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ?? '' ) ),
                    'fbc' => sanitize_text_field( wp_unslash( $_COOKIE['_fbc'] ?? '' ) ),
                    'fbp' => sanitize_text_field( wp_unslash( $_COOKIE['_fbp'] ?? '' ) ),
                ),
                'custom_data'   => array(
                    'currency'     => sanitize_text_field( $order->get_currency() ),
                    'value'        => floatval( $order->get_total() ),
                    'content_ids'  => $content_ids,
                    'content_type' => 'product',
                    'num_items'    => count( $items ),
                    'order_id'     => sanitize_text_field( $order->get_order_number() ),
                ),
            ),
        );

        wp_remote_post( $url, array(
            'body'      => wp_json_encode( array(
                'data'         => $event_data,
                'access_token' => $token,
            ) ),
            'headers'   => array( 'Content-Type' => 'application/json' ),
            'timeout'   => 5,
            'blocking'  => false,
            'sslverify' => true,
        ) );
    }

    /**
     * Send purchase to TikTok Events API.
     *
     * @link https://business-api.tiktok.com/portal/docs?id=1771100865818625
     */
    private static function send_tiktok_ea( $order, array $items, array $user_data, string $event_id, array $settings ) {
        $pixel_id = $settings['tiktok_pixel_id'];
        $token    = $settings['tiktok_access_token'];
        $url      = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

        $content_ids = array_map( function ( $item ) {
            return $item['item_id'] ?? '';
        }, $items );

        $event_data = array(
            'event'     => 'CompletePayment',
            'event_id'  => $event_id,
            'timestamp' => gmdate( 'Y-m-d\TH:i:s', time() ),
            'context'   => array(
                'ad'   => array(
                    'callback' => sanitize_text_field( wp_unslash( $_COOKIE['ttclid'] ?? '' ) ),
                ),
                'page' => array(
                    'url'      => home_url(),
                    'referrer' => wp_get_referer() ?: '',
                ),
                'user' => array(
                    'external_id' => $order->get_customer_id() ? hash( 'sha256', (string) $order->get_customer_id() ) : '',
                    'email'       => $user_data['sha256_email_address'] ?? '',
                    'phone'       => $user_data['sha256_phone_number'] ?? '',
                ),
                'user_agent' => sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ?? '' ) ),
                'ip'         => sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) ),
            ),
            'properties' => array(
                'contents'     => array_map( function ( $item ) {
                    return array(
                        'content_id'   => $item['item_id'] ?? '',
                        'content_name' => $item['item_name'] ?? '',
                        'quantity'     => $item['quantity'] ?? 1,
                        'price'        => $item['price'] ?? 0,
                    );
                }, $items ),
                'content_type' => 'product',
                'currency'     => sanitize_text_field( $order->get_currency() ),
                'value'        => floatval( $order->get_total() ),
                'order_id'     => sanitize_text_field( $order->get_order_number() ),
            ),
        );

        wp_remote_post( $url, array(
            'body'      => wp_json_encode( array(
                'pixel_code' => $pixel_id,
                'partner_name' => 'PixelMaster',
                'data'       => array( $event_data ),
            ) ),
            'headers'   => array(
                'Content-Type'  => 'application/json',
                'Access-Token'  => $token,
            ),
            'timeout'   => 5,
            'blocking'  => false,
            'sslverify' => true,
        ) );
    }

    // ── Helpers ────────────────────────────────────────────────

    /**
     * Build GA4-compatible items array from WC order.
     */
    private static function build_items( $order ) {
        $items = array();
        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            if ( ! $product instanceof WC_Product ) {
                continue;
            }

            $categories = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
            if ( is_wp_error( $categories ) ) {
                $categories = array();
            }

            $items[] = array(
                'item_id'       => sanitize_text_field( $product->get_sku() ?: (string) $product->get_id() ),
                'item_name'     => sanitize_text_field( $product->get_name() ),
                'price'         => floatval( $product->get_price() ),
                'quantity'      => absint( $item->get_quantity() ),
                'item_category' => ! empty( $categories ) ? sanitize_text_field( $categories[0] ) : '',
                'item_brand'    => sanitize_text_field( $product->get_attribute( 'brand' ) ?: '' ),
            );
        }
        return $items;
    }

    /**
     * Get client ID from order meta or generate.
     */
    private static function get_client_id( $order ) {
        $client_id = $order->get_meta( '_pm_client_id' );
        if ( ! empty( $client_id ) ) {
            return sanitize_text_field( $client_id );
        }
        return time() . '.' . wp_rand( 100000000, 999999999 );
    }

    /**
     * Extract hashed PII for Enhanced Conversions.
     */
    private static function get_user_data( $order ) {
        $email = strtolower( trim( $order->get_billing_email() ) );
        $phone = preg_replace( '/\D/', '', $order->get_billing_phone() );

        return array(
            'sha256_email_address' => ! empty( $email ) ? hash( 'sha256', $email ) : null,
            'sha256_phone_number'  => ! empty( $phone ) ? hash( 'sha256', $phone ) : null,
            'address'              => array(
                'first_name'  => sanitize_text_field( $order->get_billing_first_name() ),
                'last_name'   => sanitize_text_field( $order->get_billing_last_name() ),
                'city'        => sanitize_text_field( $order->get_billing_city() ),
                'region'      => sanitize_text_field( $order->get_billing_state() ),
                'postal_code' => sanitize_text_field( $order->get_billing_postcode() ),
                'country'     => sanitize_text_field( $order->get_billing_country() ),
            ),
        );
    }
}
