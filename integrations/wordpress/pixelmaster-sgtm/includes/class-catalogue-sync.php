<?php
/**
 * PM_SGTM_Catalogue_Sync — Real-time WooCommerce Product Synchronization.
 *
 * This module ensures that product data (SKU, Price, Stock, Image) is always
 * in sync with the Laravel Catalogue Manager.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_Catalogue_Sync {

    /**
     * Initialize catalogue sync hooks.
     */
    public static function init() {
        $settings = PM_SGTM_Settings::get_all();
        
        // Only hook if WooCommerce is active and sync is enabled
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }

        // Hook into product save/update
        add_action( 'woocommerce_update_product', array( __CLASS__, 'sync_on_update' ), 20, 1 );
        add_action( 'woocommerce_new_product', array( __CLASS__, 'sync_on_update' ), 20, 1 );
        
        // Bulk actions
        add_action( 'woocommerce_product_bulk_edit_save', array( __CLASS__, 'sync_bulk_save' ), 10, 1 );

        // Admin AJAX for manual full sync
        add_action( 'wp_ajax_pm_sgtm_bulk_catalogue_sync', array( __CLASS__, 'ajax_bulk_sync' ) );
    }

    /**
     * Sync a single product to PixelMaster.
     *
     * @param int $product_id
     */
    public static function sync_on_update( $product_id ) {
        $product = wc_get_product( $product_id );
        if ( ! $product ) {
            return;
        }

        $data = self::prepare_product_data( $product );
        self::send_to_pixelmaster( array( $data ) );
    }

    /**
     * Sync bulk edited products.
     *
     * @param WC_Product $product
     */
    public static function sync_bulk_save( $product ) {
        if ( ! $product instanceof WC_Product ) {
            return;
        }
        self::sync_on_update( $product->get_id() );
    }

    /**
     * AJAX handler for full catalogue sync.
     */
    public static function ajax_bulk_sync() {
        check_ajax_referer( 'pm_sgtm_admin_nonce', 'nonce' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        $paged = isset( $_POST['paged'] ) ? absint( $_POST['paged'] ) : 1;
        $args = array(
            'limit'   => 50,
            'paginate' => true,
            'status'  => 'publish',
            'page'    => $paged,
        );

        $results  = wc_get_products( $args );
        $products = $results->products;
        $total    = $results->total;

        if ( empty( $products ) ) {
            wp_send_json_success( array( 
                'message'  => __( 'Sync complete!', 'pixelmaster-sgtm' ),
                'finished' => true 
            ) );
        }

        $payload = array();
        foreach ( $products as $product ) {
            $payload[] = self::prepare_product_data( $product );
        }

        $response = self::send_to_pixelmaster( $payload );

        wp_send_json_success( array(
            'message'  => sprintf( __( 'Synced %d products...', 'pixelmaster-sgtm' ), count( $payload ) ),
            'finished' => ( $paged * 50 ) >= $total,
            'paged'    => $paged + 1,
            'total'    => $total,
        ) );
    }

    /**
     * Prepare WooCommerce product data for API.
     */
    private static function prepare_product_data( $product ) {
        $image_id  = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'full' ) : '';

        return array(
            'external_id' => (string) $product->get_id(),
            'sku'         => $product->get_sku(),
            'name'        => $product->get_name(),
            'price'       => floatval( $product->get_price() ),
            'regular_price' => floatval( $product->get_regular_price() ),
            'sale_price'    => floatval( $product->get_sale_price() ),
            'cost'          => floatval( $product->get_meta( '_wc_cog_cost' ) ?: 0 ), // Support Cost of Goods plugins
            'stock'         => (int) $product->get_stock_quantity(),
            'manage_stock'  => $product->get_manage_stock(),
            'image_url'     => $image_url,
            'url'           => $product->get_permalink(),
            'category'      => self::get_primary_category( $product->get_id() ),
        );
    }

    /**
     * Get primary category name.
     */
    private static function get_primary_category( $product_id ) {
        $terms = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'names' ) );
        return ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0] : '';
    }

    /**
     * Send structured product data to PixelMaster Laravel API.
     */
    private static function send_to_pixelmaster( array $products ) {
        $settings = PM_SGTM_Settings::get_all();
        
        // Base URL for API
        $url = rtrim( $settings['transport_url'], '/' ) . '/api/tracking/products/sync';

        if ( empty( $settings['transport_url'] ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return false;
        }

        $body = array(
            'source'   => 'wordpress',
            'site_url' => get_site_url(),
            'products' => $products,
        );

        $response = wp_remote_post( $url, array(
            'body'        => wp_json_encode( $body ),
            'headers'     => array(
                'Content-Type' => 'application/json',
                'X-PM-Api-Key' => $settings['api_key'],
                'X-PM-Source'  => 'wordpress_plugin',
            ),
            'timeout'     => 15,
            'blocking'    => true, // Block for catalogue sync to ensure data integrity
            'sslverify'   => true,
            'data_format' => 'body',
        ) );

        if ( is_wp_error( $response ) ) {
            error_log( '[PM_SGTM] Sync failed: ' . $response->get_error_message() );
            return false;
        }

        return true;
    }
}
