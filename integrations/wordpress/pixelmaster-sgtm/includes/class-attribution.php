<?php
/**
 * PM_SGTM_Attribution — UTM Persistence & Click ID Attribution.
 * 
 * Auto-captures UTM parameters and ad click IDs on landing,
 * persists in first-party cookie, injects into all dataLayer events.
 * Supports first-touch + last-touch attribution models.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_Attribution {

    /** Cookie name for attribution data */
    const COOKIE_NAME = 'pm_sgtm_attribution';

    /** UTM parameters to capture */
    const UTM_PARAMS = array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id' );

    /** Ad platform click IDs */
    const CLICK_IDS = array(
        'gclid'   => 'google',
        'gbraid'  => 'google',
        'wbraid'  => 'google',
        'fbclid'  => 'meta',
        'ttclid'  => 'tiktok',
        'msclkid' => 'microsoft',
        'li_fat_id' => 'linkedin',
        'twclid'  => 'twitter',
        'ScCid'   => 'snapchat',
        'epik'    => 'pinterest',
    );

    /**
     * Initialize hooks.
     */
    public static function init() {
        $settings = PM_SGTM_Settings::get_all();
        if ( empty( $settings['transport_url'] ) ) {
            return;
        }

        // Capture UTMs + click IDs on every page load
        add_action( 'wp', array( __CLASS__, 'capture_attribution' ) );

        // Inject attribution into head (after consent defaults)
        add_action( 'wp_head', array( __CLASS__, 'inject_attribution_script' ), 5 );
    }

    /**
     * Capture UTM params and click IDs from the URL on landing.
     */
    public static function capture_attribution() {
        if ( is_admin() || wp_doing_ajax() ) {
            return;
        }

        // Check if any UTM or click ID params exist in URL
        $has_params = false;
        foreach ( array_merge( self::UTM_PARAMS, array_keys( self::CLICK_IDS ) ) as $param ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            if ( ! empty( $_GET[ $param ] ) ) {
                $has_params = true;
                break;
            }
        }

        if ( ! $has_params ) {
            return;
        }

        // Build attribution data
        $attribution = array();

        // UTM parameters
        foreach ( self::UTM_PARAMS as $param ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            if ( ! empty( $_GET[ $param ] ) ) {
                $attribution[ $param ] = sanitize_text_field( wp_unslash( $_GET[ $param ] ) );
            }
        }

        // Click IDs
        foreach ( self::CLICK_IDS as $param => $platform ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            if ( ! empty( $_GET[ $param ] ) ) {
                $attribution['click_id']       = sanitize_text_field( wp_unslash( $_GET[ $param ] ) );
                $attribution['click_platform'] = $platform;
                $attribution['click_param']    = $param;
                break; // Only one click ID at a time
            }
        }

        if ( empty( $attribution ) ) {
            return;
        }

        $attribution['landing_page'] = esc_url_raw( home_url( add_query_arg( array() ) ) );
        $attribution['timestamp']    = time();
        $attribution['referrer']     = isset( $_SERVER['HTTP_REFERER'] )
            ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) )
            : '';

        // Cookie expiry: 90 days
        $expiry = apply_filters( 'pm_sgtm_attribution_cookie_days', 90 );

        // First-touch: only set if no existing cookie
        $existing = self::get_attribution();
        if ( empty( $existing['first_touch'] ) ) {
            $data = array(
                'first_touch' => $attribution,
                'last_touch'  => $attribution,
            );
        } else {
            // Last-touch: always update
            $data = $existing;
            $data['last_touch'] = $attribution;
        }

        // Set cookie (path=/, secure, SameSite=Lax)
        $json = wp_json_encode( $data );
        setcookie(
            self::COOKIE_NAME,
            $json,
            array(
                'expires'  => time() + ( $expiry * DAY_IN_SECONDS ),
                'path'     => '/',
                'secure'   => is_ssl(),
                'httponly' => false, // JS needs to read it
                'samesite' => 'Lax',
            )
        );

        // Also set in superglobal so it's available on this request
        $_COOKIE[ self::COOKIE_NAME ] = $json;
    }

    /**
     * Get stored attribution data from cookie.
     *
     * @return array
     */
    public static function get_attribution() {
        if ( empty( $_COOKIE[ self::COOKIE_NAME ] ) ) {
            return array();
        }
        $data = json_decode( wp_unslash( $_COOKIE[ self::COOKIE_NAME ] ), true );
        return is_array( $data ) ? $data : array();
    }

    /**
     * Get attribution data formatted for server-side events.
     *
     * @return array
     */
    public static function get_server_attribution() {
        $data = self::get_attribution();
        if ( empty( $data ) ) {
            return array();
        }

        $result = array();

        // Use last-touch for conversion events
        $touch = $data['last_touch'] ?? array();
        if ( ! empty( $touch['utm_source'] ) ) {
            $result['traffic_source'] = array(
                'source'   => $touch['utm_source'] ?? '',
                'medium'   => $touch['utm_medium'] ?? '',
                'campaign' => $touch['utm_campaign'] ?? '',
                'term'     => $touch['utm_term'] ?? '',
                'content'  => $touch['utm_content'] ?? '',
            );
        }

        // Click IDs for enhanced conversions
        if ( ! empty( $touch['click_id'] ) ) {
            $result['click_id']       = $touch['click_id'];
            $result['click_platform'] = $touch['click_platform'] ?? '';
        }

        // First-touch data
        if ( ! empty( $data['first_touch']['utm_source'] ) ) {
            $result['first_touch_source'] = $data['first_touch']['utm_source'];
        }

        return $result;
    }

    /**
     * Inject client-side attribution script.
     * Reads cookie and pushes to dataLayer.
     */
    public static function inject_attribution_script() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $nonce_attr = PM_SGTM_Tracker::get_nonce_attr();

        echo "<script{$nonce_attr}>\n";
        echo "(function(){\n";
        echo "'use strict';\n";

        // Capture UTMs + click IDs from URL (client-side backup)
        echo "var pm_utm=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id'];\n";
        echo "var pm_cids={gclid:'google',gbraid:'google',wbraid:'google',fbclid:'meta',ttclid:'tiktok',msclkid:'microsoft'};\n";
        echo "var sp=new URLSearchParams(location.search);\n";
        echo "var utms={},hasUtm=false;\n";
        echo "pm_utm.forEach(function(k){var v=sp.get(k);if(v){utms[k]=v;hasUtm=true;}});\n";
        echo "Object.keys(pm_cids).forEach(function(k){var v=sp.get(k);if(v){utms.click_id=v;utms.click_platform=pm_cids[k];hasUtm=true;}});\n";

        // Push attribution context to dataLayer
        echo "window.dataLayer=window.dataLayer||[];\n";

        // Read cookie for stored attribution
        echo "var c=document.cookie.match(/(?:^|;\\s*)pm_sgtm_attribution=([^;]*)/);\n";
        echo "if(c){try{var a=JSON.parse(decodeURIComponent(c[1]));\n";
        echo "  if(a.last_touch){\n";
        echo "    dataLayer.push({pm_attribution:{first_touch:a.first_touch||{},last_touch:a.last_touch||{}}});\n";
        echo "  }\n";
        echo "}catch(e){}}\n";

        // If new UTMs found, save to cookie
        echo "if(hasUtm){\n";
        echo "  utms.landing_page=location.href;\n";
        echo "  utms.timestamp=Math.floor(Date.now()/1000);\n";
        echo "  utms.referrer=document.referrer||'';\n";
        echo "  var existing={};\n";
        echo "  if(c){try{existing=JSON.parse(decodeURIComponent(c[1]));}catch(e){}}\n";
        echo "  if(!existing.first_touch)existing.first_touch=utms;\n";
        echo "  existing.last_touch=utms;\n";
        echo "  var d=new Date();d.setTime(d.getTime()+90*86400000);\n";
        echo "  document.cookie='pm_sgtm_attribution='+encodeURIComponent(JSON.stringify(existing))+';expires='+d.toUTCString()+';path=/;SameSite=Lax'+(location.protocol==='https:'?';Secure':'');\n";
        echo "  dataLayer.push({pm_attribution:{first_touch:existing.first_touch,last_touch:existing.last_touch}});\n";
        echo "}\n";

        echo "})();\n";
        echo "</script>\n";
    }
}
