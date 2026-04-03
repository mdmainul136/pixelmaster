<?php
/**
 * PM_SGTM_WooCommerce — Secure client-side e-commerce event tracking.
 *
 * Security:
 *  - All data passed through wp_json_encode (auto-escapes)
 *  - Currency values sanitized via esc_js
 *  - Product data filtered before output
 *  - wp_add_inline_script used where possible
 *  - Hook compatibility: deferred init, standard priorities
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_WooCommerce {

    /**
     * Initialize WooCommerce hooks — only if tracking enabled.
     */
    public static function init() {
        if ( ! class_exists( 'WooCommerce' ) ) {
            return;
        }

        $settings = PM_SGTM_Settings::get_all();
        if ( ! $settings['woo_tracking'] ) {
            return;
        }

        // Product page — view_item
        add_action( 'woocommerce_after_single_product', array( __CLASS__, 'track_view_item' ), 20 );

        // Category/Shop page — view_item_list
        add_action( 'woocommerce_after_shop_loop', array( __CLASS__, 'track_view_item_list' ), 20 );

        // Add to cart tracking
        add_action( 'wp_footer', array( __CLASS__, 'track_add_to_cart_js' ), 20 );

        // Cart page — view_cart
        add_action( 'woocommerce_after_cart', array( __CLASS__, 'track_view_cart' ), 20 );

        // Checkout page — begin_checkout
        add_action( 'woocommerce_before_checkout_form', array( __CLASS__, 'track_begin_checkout' ), 20 );

        // Thank you page — purchase (with dedup)
        add_action( 'woocommerce_thankyou', array( __CLASS__, 'track_purchase' ), 10, 1 );

        // Remove from cart
        add_action( 'wp_footer', array( __CLASS__, 'track_remove_from_cart_js' ), 20 );

        // Store client ID in order meta (for server-side dedup)
        add_action( 'woocommerce_checkout_update_order_meta', array( __CLASS__, 'save_client_id_to_order' ), 10, 1 );
    }

    /**
     * Track view_item on single product page.
     */
    public static function track_view_item() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        global $product;
        if ( ! $product instanceof WC_Product ) {
            return;
        }

        $item     = self::product_to_item( $product );
        $currency = esc_js( get_woocommerce_currency() );

        // Push to all data layers (GA4, Meta, TikTok)
        PM_SGTM_DataLayer::push_view_content( $item, $currency );

        self::render_event_script(
            "PixelMaster.ecommerce.viewItem(" . wp_json_encode( $item, JSON_UNESCAPED_SLASHES ) . ",'" . $currency . "');"
        );
    }

    /**
     * Track view_item_list on shop/category pages.
     */
    public static function track_view_item_list() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        global $wp_query;

        $items = array();
        if ( ! empty( $wp_query->posts ) ) {
            foreach ( array_slice( $wp_query->posts, 0, 50 ) as $post ) {
                $product = wc_get_product( $post->ID );
                if ( $product instanceof WC_Product ) {
                    $items[] = self::product_to_item( $product );
                }
            }
        }

        if ( empty( $items ) ) {
            return;
        }

        $list_name = 'Shop';
        if ( is_search() ) {
            $list_name = 'Search Results';
        } elseif ( is_product_category() ) {
            $list_name = single_cat_title( '', false ) ?: 'Category';
        }

        // Push to all data layers
        PM_SGTM_DataLayer::push_view_item_list( $list_name, $items, get_woocommerce_currency() );

        self::render_event_script(
            "PixelMaster.ecommerce.viewItemList(" .
            wp_json_encode( sanitize_text_field( $list_name ) ) . "," .
            wp_json_encode( $items, JSON_UNESCAPED_SLASHES ) . ");"
        );
    }

    /**
     * Track add_to_cart — handles both AJAX and single product form.
     */
    public static function track_add_to_cart_js() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        if ( ! is_woocommerce() && ! is_cart() && ! is_checkout() ) {
            return;
        }

        $currency = esc_js( get_woocommerce_currency() );

        // Expose product data on single product page (safely)
        if ( is_product() ) {
            global $product;
            if ( $product instanceof WC_Product ) {
                $data = wp_json_encode( self::product_to_item( $product ), JSON_UNESCAPED_SLASHES );
                echo '<script>window._pm_pd=' . $data . ';</script>' . "\n";
            }
        }

        self::render_event_script( "
jQuery(document.body).on('added_to_cart',function(e,f,h,b){
  if(!window.PixelMaster||!PixelMaster.ecommerce)return;
  var d=b.data('product_data');
  if(d)PixelMaster.ecommerce.addToCart(d,parseInt(b.data('quantity')||1),'{$currency}');
});
jQuery('.single_add_to_cart_button').on('click',function(){
  if(!window.PixelMaster||!window._pm_pd)return;
  var q=parseInt(jQuery('input.qty').val()||1);
  PixelMaster.ecommerce.addToCart(window._pm_pd,q,'{$currency}');
});
        " );
    }

    /**
     * Track view_cart on cart page.
     */
    public static function track_view_cart() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $cart = WC()->cart;
        if ( ! $cart || $cart->is_empty() ) {
            return;
        }

        $items = self::cart_to_items( $cart );
        $total = floatval( $cart->get_cart_contents_total() );
        $currency = esc_js( get_woocommerce_currency() );

        // Push to all data layers
        PM_SGTM_DataLayer::push_view_cart( $items, $total, $currency );

        self::render_event_script(
            "PixelMaster.ecommerce.viewCart(" .
            wp_json_encode( $items, JSON_UNESCAPED_SLASHES ) . "," .
            $total . ",'" . $currency . "');"
        );
    }

    /**
     * Track begin_checkout on checkout page.
     */
    public static function track_begin_checkout() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $cart = WC()->cart;
        if ( ! $cart || $cart->is_empty() ) {
            return;
        }

        $items    = self::cart_to_items( $cart );
        $total    = floatval( $cart->get_cart_contents_total() );
        $currency = esc_js( get_woocommerce_currency() );
        $coupon   = esc_js( implode( ',', $cart->get_applied_coupons() ) );

        // Push to all data layers
        PM_SGTM_DataLayer::push_begin_checkout( $items, $total, $currency, $coupon );

        self::render_event_script(
            "PixelMaster.ecommerce.beginCheckout(" .
            wp_json_encode( $items, JSON_UNESCAPED_SLASHES ) . "," .
            $total . ",'" . $currency . "','" . $coupon . "');"
        );
    }

    /**
     * Track purchase on thank-you page with deduplication.
     */
    public static function track_purchase( $order_id ) {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $order_id = absint( $order_id );
        $order    = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        // Dedup: only fire once per order
        if ( $order->get_meta( '_pm_sgtm_tracked' ) ) {
            return;
        }
        $order->update_meta_data( '_pm_sgtm_tracked', '1' );
        $order->save();

        $items = array();
        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            if ( ! $product instanceof WC_Product ) {
                continue;
            }
            $item_data             = self::product_to_item( $product );
            $item_data['quantity'] = absint( $item->get_quantity() );
            $items[]               = $item_data;
        }

        $transaction = array(
            'id'       => sanitize_text_field( $order->get_order_number() ),
            'value'    => floatval( $order->get_total() ),
            'tax'      => floatval( $order->get_total_tax() ),
            'shipping' => floatval( $order->get_shipping_total() ),
            'currency' => sanitize_text_field( $order->get_currency() ),
            'coupon'   => sanitize_text_field( implode( ',', $order->get_coupon_codes() ) ) ?: null,
            'items'    => $items,
        );

        // Push to all data layers (GA4 purchase, Meta Purchase, TikTok CompletePayment)
        PM_SGTM_DataLayer::push_purchase( $transaction );

        self::render_event_script(
            "PixelMaster.ecommerce.purchase(" .
            wp_json_encode( $transaction, JSON_UNESCAPED_SLASHES ) . ");"
        );
    }

    /**
     * Track remove_from_cart on cart page.
     */
    public static function track_remove_from_cart_js() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        if ( ! is_cart() ) {
            return;
        }

        $currency = esc_js( get_woocommerce_currency() );

        self::render_event_script( "
jQuery(document.body).on('removed_from_cart',function(e,f,h,b){
  if(!window.PixelMaster||!PixelMaster.ecommerce)return;
  var n=b.closest('tr').find('.product-name a').text();
  PixelMaster.ecommerce.removeFromCart({name:n},1,'{$currency}');
});
        " );
    }

    /**
     * Save PM client ID from cookie into order meta for server-side dedup.
     */
    public static function save_client_id_to_order( $order_id ) {
        $client_id = '';

        // Try PM cookie first
        if ( isset( $_COOKIE['_pm_client_id'] ) ) {
            $client_id = sanitize_text_field( wp_unslash( $_COOKIE['_pm_client_id'] ) );
        } elseif ( isset( $_COOKIE['_ga'] ) ) {
            // Extract GA client ID
            $parts = explode( '.', sanitize_text_field( wp_unslash( $_COOKIE['_ga'] ) ) );
            if ( count( $parts ) >= 4 ) {
                $client_id = $parts[2] . '.' . $parts[3];
            }
        }

        if ( ! empty( $client_id ) ) {
            $order = wc_get_order( absint( $order_id ) );
            if ( $order ) {
                $order->update_meta_data( '_pm_client_id', sanitize_text_field( $client_id ) );
                $order->save();
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  HELPERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Convert WC_Product to GA4-compatible item array.
     * All values are sanitized.
     *
     * @param WC_Product $product
     * @return array
     */
    private static function product_to_item( $product ) {
        $categories = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
        if ( is_wp_error( $categories ) ) {
            $categories = array();
        }

        return array(
            'id'       => sanitize_text_field( $product->get_sku() ?: (string) $product->get_id() ),
            'name'     => sanitize_text_field( $product->get_name() ),
            'price'    => floatval( $product->get_price() ),
            'brand'    => sanitize_text_field( $product->get_attribute( 'brand' ) ?: '' ),
            'category' => ! empty( $categories ) ? sanitize_text_field( $categories[0] ) : '',
            'variant'  => $product->is_type( 'variation' ) ? sanitize_text_field( $product->get_attribute_summary() ) : '',
        );
    }

    /**
     * Convert WooCommerce cart to items array.
     *
     * @param WC_Cart $cart
     * @return array
     */
    private static function cart_to_items( $cart ) {
        $items = array();
        foreach ( $cart->get_cart() as $cart_item ) {
            $product = $cart_item['data'];
            if ( ! $product instanceof WC_Product ) {
                continue;
            }
            $item             = self::product_to_item( $product );
            $item['quantity'] = absint( $cart_item['quantity'] );
            $items[]          = $item;
        }
        return $items;
    }

    /**
     * Render an inline event script with safety wrapper.
     *
     * @param string $js JavaScript code to execute.
     */
    private static function render_event_script( $js ) {
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JS is constructed from escaped parts
        echo "<script>document.addEventListener('DOMContentLoaded',function(){if(window.PixelMaster&&PixelMaster.ecommerce){" . trim( $js ) . "}});</script>\n";
    }
}
