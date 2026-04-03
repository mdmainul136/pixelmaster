<?php
/**
 * PM_SGTM_DataLayer — Multi-Platform Data Layer Manager.
 *
 * Manages data layer pushes for:
 *  - GA4 (dataLayer.push + gtag)
 *  - Meta Pixel (fbq)
 *  - TikTok Pixel (ttq)
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_DataLayer {

    /**
     * Initialize pixel base codes and engagement tracking.
     */
    public static function init() {
        add_action( 'wp_head', array( __CLASS__, 'inject_pixel_base_codes' ), 3 );
        add_action( 'wp_footer', array( __CLASS__, 'inject_engagement_tracking' ), 99 );
    }

    /**
     * Inject base pixel codes (after consent defaults at priority 1-2).
     */
    public static function inject_pixel_base_codes() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $settings = PM_SGTM_Settings::get_all();

        // ── GA4 / gtag.js base code ──
        if ( ! empty( $settings['measurement_id'] ) ) {
            self::inject_ga4_base( $settings );
        }

        // ── Meta Pixel base code ──
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            self::inject_meta_pixel_base( $settings );
        }

        // ── TikTok Pixel base code ──
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            self::inject_tiktok_base( $settings );
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  BASE PIXEL CODES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * GA4 gtag.js routed through sGTM transport URL.
     */
    private static function inject_ga4_base( $settings ) {
        $transport_url  = esc_url( rtrim( $settings['transport_url'], '/' ) );
        $measurement_id = esc_js( $settings['measurement_id'] );

        // Route gtag.js through sGTM if transport URL set, else Google CDN
        $gtag_src = ! empty( $transport_url )
            ? $transport_url . '/gtag/js?id=' . $measurement_id
            : 'https://www.googletagmanager.com/gtag/js?id=' . $measurement_id;

        echo "\n<!-- GA4 Data Layer -->\n";
        echo '<script async src="' . esc_url( $gtag_src ) . '"></script>' . "\n";
        echo "<script>\n";

        // Only declare dataLayer/gtag if consent defaults haven't already (avoids duplicate)
        echo "window.dataLayer=window.dataLayer||[];\n";
        echo "if(typeof gtag==='undefined'){function gtag(){dataLayer.push(arguments);}}\n";
        echo "gtag('js',new Date());\n";

        // Config with server_container_url for first-party
        if ( ! empty( $transport_url ) ) {
            echo "gtag('config','" . $measurement_id . "',{\n";
            echo "  'server_container_url':'" . esc_js( $transport_url ) . "',\n";
            echo "  'send_page_view':" . ( $settings['auto_page_view'] ? 'true' : 'false' ) . "\n";
            echo "});\n";
        } else {
            echo "gtag('config','" . $measurement_id . "',{'send_page_view':" . ( $settings['auto_page_view'] ? 'true' : 'false' ) . "});\n";
        }

        echo "</script>\n";
    }

    /**
     * Meta Pixel (Facebook) base code.
     */
    private static function inject_meta_pixel_base( $settings ) {
        $pixel_id = esc_js( $settings['meta_pixel_id'] );

        echo "\n<!-- Meta Pixel -->\n";
        echo "<script>\n";
        echo "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n";
        echo "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\n";
        echo "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\n";
        echo "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,\n";
        echo "document,'script','https://connect.facebook.net/en_US/fbevents.js');\n";
        echo "fbq('init','" . $pixel_id . "'";

        // Advanced Matching — pass hashed user data
        if ( is_user_logged_in() ) {
            $user = wp_get_current_user();
            $am   = array();
            if ( ! empty( $user->user_email ) ) {
                $am['em'] = strtolower( trim( $user->user_email ) );
            }
            if ( ! empty( $user->first_name ) ) {
                $am['fn'] = strtolower( trim( $user->first_name ) );
            }
            if ( ! empty( $user->last_name ) ) {
                $am['ln'] = strtolower( trim( $user->last_name ) );
            }
            if ( ! empty( $am ) ) {
                echo ',' . wp_json_encode( $am, JSON_UNESCAPED_SLASHES );
            }
        }

        echo ");\n";
        echo "fbq('track','PageView');\n";
        echo "</script>\n";
        echo '<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=' . esc_attr( $pixel_id ) . '&ev=PageView&noscript=1" /></noscript>' . "\n";
    }

    /**
     * TikTok Pixel base code.
     */
    private static function inject_tiktok_base( $settings ) {
        $pixel_id = esc_js( $settings['tiktok_pixel_id'] );

        echo "\n<!-- TikTok Pixel -->\n";
        echo "<script>\n";
        echo "!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=\n";
        echo "[\"page\",\"track\",\"identify\",\"instances\",\"debug\",\"on\",\"off\",\"once\",\"ready\",\n";
        echo "\"alias\",\"group\",\"enableCookie\",\"disableCookie\",\"holdConsent\",\"revokeConsent\",\n";
        echo "\"grantConsent\"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(\n";
        echo "Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)\n";
        echo "ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||\n";
        echo "[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};\n";
        echo "ttq.load=function(e,n){var r=\"https://analytics.tiktok.com/i18n/pixel/events.js\";\n";
        echo "var o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=\n";
        echo "ttq._t||{};ttq._t[e+\"_\"+o]=1;var a=d.createElement(\"script\");a.type=\"text/javascript\";\n";
        echo "a.async=!0;a.src=r+\"?sdkid=\"+e+\"&lib=\"+t;var s=d.getElementsByTagName(\"script\")[0];\n";
        echo "s.parentNode.insertBefore(a,s)};\n";
        echo "ttq.load('" . $pixel_id . "');\n";
        echo "ttq.page();\n";
        echo "}(window,document,'ttq');\n";
        echo "</script>\n";
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  EVENT PUSH METHODS — Called by WooCommerce integration
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Push view_item / ViewContent event to all platforms.
     *
     * @param array  $item     Product item data.
     * @param string $currency Currency code.
     */
    public static function push_view_content( $item, $currency ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4 dataLayer
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_data = array(
                'event'    => 'view_item',
                'ecommerce' => array(
                    'currency' => $currency,
                    'value'    => $item['price'],
                    'items'    => array( self::to_ga4_item( $item ) ),
                ),
            );
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push(" . wp_json_encode( $ga4_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // Meta Pixel
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            $fb_data = array(
                'content_ids'  => array( $item['id'] ),
                'content_name' => $item['name'],
                'content_type' => 'product',
                'value'        => $item['price'],
                'currency'     => $currency,
            );
            $js .= "fbq('track','ViewContent'," . wp_json_encode( $fb_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // TikTok
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            $tt_data = array(
                'content_id'   => $item['id'],
                'content_name' => $item['name'],
                'content_type' => 'product',
                'value'        => $item['price'],
                'currency'     => $currency,
            );
            $js .= "ttq.track('ViewContent'," . wp_json_encode( $tt_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    /**
     * Push view_item_list / ViewContent (list) event.
     */
    public static function push_view_item_list( $list_name, $items, $currency ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_items = array_map( array( __CLASS__, 'to_ga4_item' ), $items );
            $ga4_data = array(
                'event'     => 'view_item_list',
                'ecommerce' => array(
                    'item_list_name' => $list_name,
                    'items'          => $ga4_items,
                ),
            );
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push(" . wp_json_encode( $ga4_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // Meta — ViewContent with content_ids array
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            $ids = array_column( $items, 'id' );
            $js .= "fbq('track','ViewContent',{content_ids:" . wp_json_encode( $ids ) . ",content_type:'product_group'});\n";
        }

        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    /**
     * Push add_to_cart / AddToCart event.
     */
    public static function push_add_to_cart( $item, $qty, $currency ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_item = self::to_ga4_item( $item );
            $ga4_item['quantity'] = $qty;
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push({event:'add_to_cart',ecommerce:{currency:'" . esc_js( $currency ) . "',value:" . floatval( $item['price'] * $qty ) . ",items:[" . wp_json_encode( $ga4_item, JSON_UNESCAPED_SLASHES ) . "]}});\n";
        }

        // Meta
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            $fb_data = array(
                'content_ids'  => array( $item['id'] ),
                'content_name' => $item['name'],
                'content_type' => 'product',
                'value'        => $item['price'] * $qty,
                'currency'     => $currency,
                'num_items'    => $qty,
            );
            $js .= "fbq('track','AddToCart'," . wp_json_encode( $fb_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // TikTok
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            $tt_data = array(
                'content_id'   => $item['id'],
                'content_name' => $item['name'],
                'content_type' => 'product',
                'value'        => $item['price'] * $qty,
                'currency'     => $currency,
                'quantity'     => $qty,
            );
            $js .= "ttq.track('AddToCart'," . wp_json_encode( $tt_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        return $js;
    }

    /**
     * Push add_to_cart event and echo inline script.
     * Convenience wrapper when called from server-side hooks.
     */
    public static function echo_add_to_cart( $item, $qty, $currency ) {
        $js = self::push_add_to_cart( $item, $qty, $currency );
        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    /**
     * Push begin_checkout / InitiateCheckout event.
     */
    public static function push_begin_checkout( $items, $total, $currency, $coupon = '' ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_data = array(
                'event'     => 'begin_checkout',
                'ecommerce' => array(
                    'currency' => $currency,
                    'value'    => $total,
                    'items'    => array_map( array( __CLASS__, 'to_ga4_item' ), $items ),
                ),
            );
            if ( ! empty( $coupon ) ) {
                $ga4_data['ecommerce']['coupon'] = $coupon;
            }
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push(" . wp_json_encode( $ga4_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // Meta
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            $ids = array_column( $items, 'id' );
            $fb_data = array(
                'content_ids'  => $ids,
                'content_type' => 'product',
                'value'        => $total,
                'currency'     => $currency,
                'num_items'    => count( $items ),
            );
            $js .= "fbq('track','InitiateCheckout'," . wp_json_encode( $fb_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // TikTok
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            $tt_data = array(
                'content_type' => 'product',
                'value'        => $total,
                'currency'     => $currency,
                'quantity'     => count( $items ),
            );
            $js .= "ttq.track('InitiateCheckout'," . wp_json_encode( $tt_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    /**
     * Push purchase / Purchase event to all platforms.
     */
    public static function push_purchase( $transaction ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_items = array_map( array( __CLASS__, 'to_ga4_item' ), $transaction['items'] );
            $ga4_data = array(
                'event'     => 'purchase',
                'ecommerce' => array(
                    'transaction_id' => $transaction['id'],
                    'value'          => $transaction['value'],
                    'tax'            => $transaction['tax'],
                    'shipping'       => $transaction['shipping'],
                    'currency'       => $transaction['currency'],
                    'items'          => $ga4_items,
                ),
            );
            if ( ! empty( $transaction['coupon'] ) ) {
                $ga4_data['ecommerce']['coupon'] = $transaction['coupon'];
            }
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push(" . wp_json_encode( $ga4_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // Meta Pixel — Purchase
        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            $ids = array_column( $transaction['items'], 'id' );
            $fb_data = array(
                'content_ids'  => $ids,
                'content_type' => 'product',
                'value'        => $transaction['value'],
                'currency'     => $transaction['currency'],
                'num_items'    => count( $transaction['items'] ),
            );
            $js .= "fbq('track','Purchase'," . wp_json_encode( $fb_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        // TikTok — CompletePayment
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            $tt_contents = array();
            foreach ( $transaction['items'] as $item ) {
                $tt_contents[] = array(
                    'content_id'   => $item['id'],
                    'content_name' => $item['name'],
                    'content_type' => 'product',
                    'price'        => $item['price'],
                    'quantity'     => $item['quantity'] ?? 1,
                );
            }
            $tt_data = array(
                'contents'     => $tt_contents,
                'content_type' => 'product',
                'value'        => $transaction['value'],
                'currency'     => $transaction['currency'],
            );
            $js .= "ttq.track('CompletePayment'," . wp_json_encode( $tt_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    /**
     * Push view_cart event.
     */
    public static function push_view_cart( $items, $total, $currency ) {
        $settings = PM_SGTM_Settings::get_all();
        $js = '';

        // GA4
        if ( ! empty( $settings['measurement_id'] ) ) {
            $ga4_data = array(
                'event'     => 'view_cart',
                'ecommerce' => array(
                    'currency' => $currency,
                    'value'    => $total,
                    'items'    => array_map( array( __CLASS__, 'to_ga4_item' ), $items ),
                ),
            );
            $js .= "dataLayer.push({'ecommerce':null});\n";
            $js .= "dataLayer.push(" . wp_json_encode( $ga4_data, JSON_UNESCAPED_SLASHES ) . ");\n";
        }

        if ( ! empty( $js ) ) {
            echo "<script>" . $js . "</script>\n";
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ITEM MAPPERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Convert plugin item format to GA4 dataLayer format.
     */
    public static function to_ga4_item( $item ) {
        return array(
            'item_id'       => $item['id'] ?? '',
            'item_name'     => $item['name'] ?? '',
            'price'         => floatval( $item['price'] ?? 0 ),
            'item_brand'    => $item['brand'] ?? '',
            'item_category' => $item['category'] ?? '',
            'item_variant'  => $item['variant'] ?? '',
            'quantity'      => absint( $item['quantity'] ?? 1 ),
        );
    }

    // ── Engagement Tracking ─────────────────────────────────

    /**
     * Inject engagement tracking scripts in footer.
     * Scroll depth, time on page, file download tracking.
     */
    public static function inject_engagement_tracking() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $settings   = PM_SGTM_Settings::get_all();
        $scroll     = ! empty( $settings['scroll_tracking'] );
        $time       = ! empty( $settings['time_tracking'] );
        $downloads  = ! empty( $settings['download_tracking'] );

        if ( ! $scroll && ! $time && ! $downloads ) {
            return;
        }

        $nonce_attr = PM_SGTM_Tracker::get_nonce_attr();

        echo "<script{$nonce_attr}>\n";
        echo "(function(){\n";
        echo "'use strict';\n";
        echo "var dl=window.dataLayer=window.dataLayer||[];\n";

        // ── Scroll Depth ──
        if ( $scroll ) {
            echo "var scrollFired={};\n";
            echo "function checkScroll(){\n";
            echo "  var h=document.documentElement,b=document.body;\n";
            echo "  var st=h.scrollTop||b.scrollTop;\n";
            echo "  var sh=Math.max(h.scrollHeight,b.scrollHeight)-h.clientHeight;\n";
            echo "  if(sh<=0)return;\n";
            echo "  var pct=Math.round(st/sh*100);\n";
            echo "  [25,50,75,100].forEach(function(t){\n";
            echo "    if(pct>=t&&!scrollFired[t]){\n";
            echo "      scrollFired[t]=true;\n";
            echo "      dl.push({event:'scroll_depth',scroll_percentage:t,scroll_threshold:t+'%'});\n";
            echo "    }\n";
            echo "  });\n";
            echo "}\n";
            echo "var scrollTimer;\n";
            echo "window.addEventListener('scroll',function(){clearTimeout(scrollTimer);scrollTimer=setTimeout(checkScroll,150);},{passive:true});\n";
        }

        // ── Time on Page ──
        if ( $time ) {
            echo "var timeStart=Date.now();\n";
            echo "var timeFired={};\n";
            echo "[10,30,60,180].forEach(function(s){\n";
            echo "  setTimeout(function(){\n";
            echo "    if(!timeFired[s]&&!document.hidden){\n";
            echo "      timeFired[s]=true;\n";
            echo "      dl.push({event:'time_on_page',time_seconds:s,time_label:s+'s',engaged_time:Math.round((Date.now()-timeStart)/1000)});\n";
            echo "    }\n";
            echo "  },s*1000);\n";
            echo "});\n";
            // Engaged session (10s + scroll or click)
            echo "var engaged=false;\n";
            echo "function markEngaged(){\n";
            echo "  if(engaged)return;engaged=true;\n";
            echo "  dl.push({event:'engaged_session',engagement_type:'active'});\n";
            echo "}\n";
            echo "setTimeout(function(){\n";
            echo "  document.addEventListener('click',markEngaged,{once:true});\n";
            echo "  document.addEventListener('scroll',markEngaged,{once:true});\n";
            echo "},10000);\n";
        }

        // ── File Download Tracking ──
        if ( $downloads ) {
            echo "var dlExts=/\\.(pdf|zip|rar|doc|docx|xls|xlsx|csv|ppt|pptx|gz|tar|7z|exe|dmg)$/i;\n";
            echo "document.addEventListener('click',function(e){\n";
            echo "  var a=e.target.closest('a[href]');\n";
            echo "  if(!a)return;\n";
            echo "  var href=a.getAttribute('href')||'';\n";
            echo "  var m=href.match(dlExts);\n";
            echo "  if(m){\n";
            echo "    var fname=href.split('/').pop().split('?')[0];\n";
            echo "    dl.push({event:'file_download',file_name:fname,file_extension:m[1].toLowerCase(),link_url:href,link_text:(a.textContent||'').trim().substring(0,100)});\n";
            echo "  }\n";
            echo "});\n";
        }

        echo "})();\n";
        echo "</script>\n";
    }
}
