<?php
/**
 * PM_SGTM_Consent — Geo-Aware Cookie Consent + 3rd Party CMP Bridge.
 *
 * Legal Compliance:
 *  - GDPR (EU 27 + EEA): Opt-in required, all tracking denied by default
 *  - UK GDPR + PECR: Same as EU GDPR
 *  - CCPA/CPRA (California): Opt-out model, tracking allowed by default
 *  - LGPD (Brazil): Opt-in required
 *  - PIPEDA (Canada): Opt-in required
 *  - POPIA (South Africa): Opt-in required
 *  - PDPA (Thailand): Opt-in required
 *  - APPs (Australia): Notice-only, tracking allowed
 *  - DPDPA (India): Notice-only, tracking allowed
 *  - Others: Tracking allowed by default, no banner required
 *
 * Features:
 *  - Server-side geo-detection (Cloudflare, WooCommerce, MaxMind, fallback)
 *  - Auto-detects: CookieYes, Complianz, CookieBot, Borlabs, Moove, WP Consent API
 *  - Category-based consent: Necessary, Analytics, Marketing
 *  - GPC (Global Privacy Control) signal detection
 *  - Consent Mode v2 update for GA4, Meta Pixel, TikTok Pixel
 *  - CCPA "Do Not Sell" link support
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PM_SGTM_Consent {

    /** @var string Cookie name for storing consent */
    const COOKIE_NAME = 'pm_sgtm_consent';

    /** @var int Cookie expiry in days */
    const COOKIE_DAYS = 365;

    /**
     * Privacy law regions and their requirements.
     *
     * @var array region_id => config
     */
    const REGIONS = array(
        // ── OPT-IN REQUIRED (strict) ──
        'gdpr' => array(
            'name'            => 'GDPR (EU/EEA)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array(
                'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR',
                'DE','GR','HU','IE','IT','LV','LT','LU','MT','NL',
                'PL','PT','RO','SK','SI','ES','SE',
                // EEA (non-EU)
                'IS','LI','NO',
            ),
        ),
        'uk_gdpr' => array(
            'name'            => 'UK GDPR + PECR',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'GB' ),
        ),
        'lgpd' => array(
            'name'            => 'LGPD (Brazil)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'BR' ),
        ),
        'pipeda' => array(
            'name'            => 'PIPEDA (Canada)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'CA' ),
        ),
        'popia' => array(
            'name'            => 'POPIA (South Africa)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'ZA' ),
        ),
        'pdpa' => array(
            'name'            => 'PDPA (Thailand)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'TH' ),
        ),
        'appi' => array(
            'name'            => 'APPI (Japan)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'JP' ),
        ),
        'pdpb' => array(
            'name'            => 'K-PIPA (South Korea)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'KR' ),
        ),
        // PIPL (China) — strictest
        'pipl' => array(
            'name'            => 'PIPL (China)',
            'default_consent' => 'denied',
            'banner_required' => true,
            'opt_model'       => 'opt-in',
            'countries'       => array( 'CN' ),
        ),

        // ── OPT-OUT MODEL (US states) ──
        'ccpa' => array(
            'name'            => 'CCPA/CPRA (California)',
            'default_consent' => 'granted',
            'banner_required' => false,
            'opt_model'       => 'opt-out',
            'dns_link'        => true,  // "Do Not Sell" link required
            'countries'       => array( 'US' ),
            'regions'         => array( 'CA' ), // California state
        ),
        'us_other' => array(
            'name'            => 'US (Other States)',
            'default_consent' => 'granted',
            'banner_required' => false,
            'opt_model'       => 'opt-out',
            'countries'       => array( 'US' ),
        ),

        // ── NOTICE-ONLY ──
        'notice' => array(
            'name'            => 'Notice-Only (AU/IN/others)',
            'default_consent' => 'granted',
            'banner_required' => false,
            'opt_model'       => 'notice',
            'countries'       => array( 'AU', 'NZ', 'IN', 'SG', 'MY', 'PH', 'ID' ),
        ),
    );

    /** @var array|null Cached geo result */
    private static $geo_cache = null;

    /**
     * Initialize consent system.
     */
    public static function init() {
        $settings = PM_SGTM_Settings::get_all();

        if ( empty( $settings['consent_mode'] ) ) {
            return;
        }

        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
        add_action( 'wp_head', array( __CLASS__, 'inject_consent_logic' ), 2 );
        add_action( 'wp_footer', array( __CLASS__, 'inject_banner_html' ), 99 );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GEO-DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Detect visitor's country code (ISO 3166-1 alpha-2).
     *
     * Priority:
     *  1. Cloudflare header (fastest, no lookup)
     *  2. WooCommerce Geolocation (if active)
     *  3. WordPress.com geo header
     *  4. MaxMind GeoIP (if available)
     *  5. Fallback to admin setting
     *
     * @return array { country: string, region: string|null, source: string }
     */
    public static function detect_geo() {
        if ( null !== self::$geo_cache ) {
            return self::$geo_cache;
        }

        $country = '';
        $region  = null;
        $source  = 'fallback';

        // 1. Cloudflare (free, automatic on CF-proxied sites)
        if ( ! empty( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) {
            $country = strtoupper( sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_IPCOUNTRY'] ) ) );
            $source  = 'cloudflare';
            // Cloudflare also provides region for US
            if ( $country === 'US' && ! empty( $_SERVER['HTTP_CF_REGION'] ) ) {
                $region = strtoupper( sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_REGION'] ) ) );
            }
        }

        // 2. WooCommerce Geolocation
        if ( empty( $country ) && class_exists( 'WC_Geolocation' ) ) {
            $geo = WC_Geolocation::geolocate_ip();
            if ( ! empty( $geo['country'] ) ) {
                $country = strtoupper( $geo['country'] );
                $region  = ! empty( $geo['state'] ) ? strtoupper( $geo['state'] ) : null;
                $source  = 'woocommerce';
            }
        }

        // 3. WordPress.com / Jetpack geo header
        if ( empty( $country ) && ! empty( $_SERVER['GEOIP_COUNTRY_CODE'] ) ) {
            $country = strtoupper( sanitize_text_field( wp_unslash( $_SERVER['GEOIP_COUNTRY_CODE'] ) ) );
            $source  = 'geoip_header';
        }

        // 4. Sucuri / other CDN headers
        if ( empty( $country ) && ! empty( $_SERVER['HTTP_X_SUCURI_CLIENTIP'] ) ) {
            // Sucuri doesn't provide country directly, skip
        }

        // 5. MaxMind GeoIP2 (if PHP extension loaded)
        if ( empty( $country ) && function_exists( 'geoip_country_code_by_name' ) ) {
            $ip = self::get_visitor_ip();
            if ( $ip ) {
                $code = @geoip_country_code_by_name( $ip );
                if ( $code ) {
                    $country = strtoupper( $code );
                    $source  = 'maxmind';
                }
            }
        }

        // 6. Fallback: use admin-configured default
        if ( empty( $country ) || $country === 'XX' || $country === 'T1' ) {
            $settings = PM_SGTM_Settings::get_all();
            $country  = '';
            $source   = 'fallback';
        }

        /**
         * Filter: Allow overriding geo detection.
         *
         * @param array $geo { country, region, source }
         */
        self::$geo_cache = apply_filters( 'pm_sgtm_visitor_geo', array(
            'country' => $country,
            'region'  => $region,
            'source'  => $source,
        ) );

        return self::$geo_cache;
    }

    /**
     * Get the privacy law region for the visitor.
     *
     * @return array { region_id, name, default_consent, banner_required, opt_model, dns_link }
     */
    public static function get_visitor_privacy_region() {
        $geo     = self::detect_geo();
        $country = $geo['country'];
        $region  = $geo['region'];

        // No country detected — fall back to admin default
        if ( empty( $country ) ) {
            $settings = PM_SGTM_Settings::get_all();
            $default  = $settings['consent_default'] ?? 'denied';
            return array(
                'region_id'       => 'unknown',
                'name'            => 'Unknown',
                'default_consent' => $default,
                'banner_required' => ( $default === 'denied' ),
                'opt_model'       => ( $default === 'denied' ) ? 'opt-in' : 'opt-out',
                'dns_link'        => false,
            );
        }

        // Check CCPA first (US + California specifically)
        if ( $country === 'US' && $region === 'CA' ) {
            $r = self::REGIONS['ccpa'];
            return array(
                'region_id'       => 'ccpa',
                'name'            => $r['name'],
                'default_consent' => $r['default_consent'],
                'banner_required' => $r['banner_required'],
                'opt_model'       => $r['opt_model'],
                'dns_link'        => true,
            );
        }

        // Check all regions
        foreach ( self::REGIONS as $id => $config ) {
            if ( $id === 'ccpa' || $id === 'us_other' ) {
                continue; // Handle US separately
            }
            if ( in_array( $country, $config['countries'], true ) ) {
                return array(
                    'region_id'       => $id,
                    'name'            => $config['name'],
                    'default_consent' => $config['default_consent'],
                    'banner_required' => $config['banner_required'],
                    'opt_model'       => $config['opt_model'],
                    'dns_link'        => ! empty( $config['dns_link'] ),
                );
            }
        }

        // US (non-California)
        if ( $country === 'US' ) {
            $r = self::REGIONS['us_other'];
            return array(
                'region_id'       => 'us_other',
                'name'            => $r['name'],
                'default_consent' => $r['default_consent'],
                'banner_required' => $r['banner_required'],
                'opt_model'       => $r['opt_model'],
                'dns_link'        => false,
            );
        }

        // All other countries — granted by default, no banner
        return array(
            'region_id'       => 'none',
            'name'            => 'No Applicable Law',
            'default_consent' => 'granted',
            'banner_required' => false,
            'opt_model'       => 'none',
            'dns_link'        => false,
        );
    }

    /**
     * Get the visitor's real IP (behind proxies/CDN).
     *
     * @return string|false
     */
    private static function get_visitor_ip() {
        $headers = array(
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Standard proxy
            'HTTP_X_REAL_IP',            // Nginx
            'REMOTE_ADDR',              // Direct
        );

        foreach ( $headers as $header ) {
            if ( ! empty( $_SERVER[ $header ] ) ) {
                $ip = sanitize_text_field( wp_unslash( $_SERVER[ $header ] ) );
                // X-Forwarded-For can be comma-separated
                if ( strpos( $ip, ',' ) !== false ) {
                    $ip = trim( explode( ',', $ip )[0] );
                }
                if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
                    return $ip;
                }
            }
        }

        return false;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  3RD PARTY CMP DETECTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Detect if a 3rd party CMP plugin is active.
     *
     * @return string|false CMP name if detected, false otherwise.
     */
    public static function detect_third_party_cmp() {
        static $cache = null;
        if ( null !== $cache ) {
            return $cache;
        }

        if ( class_exists( 'Cookie_Law_Info' ) || defined( 'CLI_PLUGIN_DEVELOPMENT_MODE' ) ) {
            $cache = 'cookieyes'; return $cache;
        }
        if ( defined( 'cmplz_plugin' ) || class_exists( 'CMPLZ' ) || function_exists( 'cmplz_uses_consentmanager' ) ) {
            $cache = 'complianz'; return $cache;
        }
        if ( defined( 'COOKIEBOT_PLUGIN_DIR' ) || class_exists( 'Cookiebot_WP' ) ) {
            $cache = 'cookiebot'; return $cache;
        }
        if ( defined( 'BORLABS_COOKIE_SLUG' ) || class_exists( 'BorlabsCookie' ) ) {
            $cache = 'borlabs'; return $cache;
        }
        if ( class_exists( 'Moove_GDPR' ) || defined( 'GDPR_COOKIE_COMPLIANCE_VERSION' ) ) {
            $cache = 'moove'; return $cache;
        }
        if ( function_exists( 'wp_has_consent' ) ) {
            $cache = 'wp_consent_api'; return $cache;
        }

        $cache = apply_filters( 'pm_sgtm_detected_cmp', false );
        return $cache;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ASSET ENQUEUE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Enqueue banner CSS — only if needed.
     */
    public static function enqueue_assets() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }
        if ( self::detect_third_party_cmp() ) {
            return;
        }

        $privacy_region = self::get_visitor_privacy_region();

        // Don't load CSS if no banner required for this region
        if ( ! $privacy_region['banner_required'] && $privacy_region['opt_model'] !== 'opt-out' ) {
            return;
        }

        $settings = PM_SGTM_Settings::get_all();
        if ( empty( $settings['consent_banner'] ) ) {
            return;
        }

        wp_enqueue_style(
            'pm-sgtm-consent',
            PM_SGTM_PLUGIN_URL . 'assets/css/consent-banner.css',
            array(),
            PM_SGTM_VERSION
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CONSENT LOGIC (HEAD)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Inject consent update JavaScript logic.
     */
    public static function inject_consent_logic() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }

        $settings       = PM_SGTM_Settings::get_all();
        $cmp            = self::detect_third_party_cmp();
        $privacy_region = self::get_visitor_privacy_region();

        echo "\n<!-- PM Consent Bridge [" . esc_html( $privacy_region['region_id'] ) . "] -->\n";
        echo "<script>\n";
        echo "(function(){\n";
        echo "'use strict';\n";

        // Expose region info to JS
        echo "window.pmSgtmRegion=" . wp_json_encode( array(
            'id'        => $privacy_region['region_id'],
            'model'     => $privacy_region['opt_model'],
            'default'   => $privacy_region['default_consent'],
            'banner'    => $privacy_region['banner_required'],
            'dnsLink'   => $privacy_region['dns_link'],
        ), JSON_UNESCAPED_SLASHES ) . ";\n";

        // Consent update helper
        echo "window.pmSgtmUpdateConsent=function(analytics,marketing){\n";
        echo "  if(typeof gtag==='function'){\n";
        echo "    gtag('consent','update',{\n";
        echo "      'analytics_storage':analytics?'granted':'denied',\n";
        echo "      'ad_storage':marketing?'granted':'denied',\n";
        echo "      'ad_user_data':marketing?'granted':'denied',\n";
        echo "      'ad_personalization':marketing?'granted':'denied'\n";
        echo "    });\n";
        echo "  }\n";

        if ( ! empty( $settings['meta_pixel_id'] ) ) {
            echo "  if(typeof fbq==='function'){fbq('consent',marketing?'grant':'revoke');}\n";
        }
        if ( ! empty( $settings['tiktok_pixel_id'] ) ) {
            echo "  if(typeof ttq!=='undefined'){if(marketing){ttq.grantConsent();}else{ttq.revokeConsent();}}\n";
        }

        echo "};\n";

        // GPC detection — overrides everything
        echo "var gpc=navigator.globalPrivacyControl||false;\n";
        echo "if(gpc){window.pmSgtmUpdateConsent(false,false);}\n";

        // 3rd Party CMP vs built-in
        if ( $cmp ) {
            self::inject_cmp_bridge( $cmp );
        } else {
            // Read existing consent cookie
            echo "var c=document.cookie.match(/(?:^|;\\s*)pm_sgtm_consent=([^;]*)/);\n";
            echo "if(c){\n";
            echo "  try{var p=JSON.parse(decodeURIComponent(c[1]));\n";
            echo "    if(!gpc){window.pmSgtmUpdateConsent(!!p.analytics,!!p.marketing);}\n";
            echo "  }catch(e){}\n";
            echo "}else if(!gpc){\n";

            // No cookie yet — apply region default
            if ( $privacy_region['default_consent'] === 'granted' ) {
                echo "  window.pmSgtmUpdateConsent(true,true);\n";
            }

            echo "}\n";
        }

        echo "})();\n";
        echo "</script>\n";
    }

    /**
     * Inject 3rd party CMP bridge JavaScript.
     */
    private static function inject_cmp_bridge( $cmp ) {
        switch ( $cmp ) {
            case 'cookieyes':
                echo "document.addEventListener('cookieyes_consent_update',function(e){\n";
                echo "  var d=e.detail||{};\n";
                echo "  window.pmSgtmUpdateConsent(d.accepted&&d.accepted.indexOf('analytics')!==-1,d.accepted&&d.accepted.indexOf('advertisement')!==-1);\n";
                echo "});\n";
                echo "if(typeof getCkyConsent==='function'){var ck=getCkyConsent();if(ck){window.pmSgtmUpdateConsent(!!ck.analytics,!!ck.advertisement);}}\n";
                break;
            case 'complianz':
                echo "document.addEventListener('cmplz_fire_categories',function(e){\n";
                echo "  var c=e.detail&&e.detail.categories?e.detail.categories:[];\n";
                echo "  window.pmSgtmUpdateConsent(c.indexOf('statistics')!==-1,c.indexOf('marketing')!==-1);\n";
                echo "});\n";
                echo "if(typeof cmplz_has_consent==='function'){window.pmSgtmUpdateConsent(cmplz_has_consent('statistics'),cmplz_has_consent('marketing'));}\n";
                break;
            case 'cookiebot':
                echo "window.addEventListener('CookiebotOnAccept',function(){if(!Cookiebot||!Cookiebot.consent)return;window.pmSgtmUpdateConsent(!!Cookiebot.consent.statistics,!!Cookiebot.consent.marketing);});\n";
                echo "window.addEventListener('CookiebotOnDecline',function(){window.pmSgtmUpdateConsent(false,false);});\n";
                echo "if(typeof Cookiebot!=='undefined'&&Cookiebot.consent){window.pmSgtmUpdateConsent(!!Cookiebot.consent.statistics,!!Cookiebot.consent.marketing);}\n";
                break;
            case 'borlabs':
                echo "document.addEventListener('borlabs-cookie-consent-saved',function(){if(typeof BorlabsCookie==='undefined')return;var c=BorlabsCookie.getCookieGroupsAccepted();window.pmSgtmUpdateConsent(c.indexOf('statistics')!==-1,c.indexOf('marketing')!==-1);});\n";
                break;
            case 'moove':
                echo "document.addEventListener('moove_gdpr_consent_loaded',function(){var ck=document.cookie.match(/moove_gdpr_popup=([^;]*)/);if(ck){try{var p=JSON.parse(decodeURIComponent(ck[1]));window.pmSgtmUpdateConsent(p.thirdparty==='1',p.advanced==='1');}catch(e){}}});\n";
                break;
            case 'wp_consent_api':
                $a = function_exists( 'wp_has_consent' ) && wp_has_consent( 'statistics' );
                $m = function_exists( 'wp_has_consent' ) && wp_has_consent( 'marketing' );
                echo "window.pmSgtmUpdateConsent(" . ( $a ? 'true' : 'false' ) . "," . ( $m ? 'true' : 'false' ) . ");\n";
                echo "document.addEventListener('wp_consent_type_change',function(){window.pmSgtmUpdateConsent(wp_has_consent('statistics'),wp_has_consent('marketing'));});\n";
                break;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  BANNER HTML (FOOTER)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Inject built-in consent banner HTML.
     * Only if no 3rd party CMP AND banner is required for this region.
     */
    public static function inject_banner_html() {
        if ( ! PM_SGTM_Settings::should_track_user() ) {
            return;
        }
        if ( self::detect_third_party_cmp() ) {
            return;
        }

        $settings       = PM_SGTM_Settings::get_all();
        $privacy_region = self::get_visitor_privacy_region();

        // Decide what to show
        $show_banner   = $privacy_region['banner_required'] && ! empty( $settings['consent_banner'] );
        $show_dns_link = ! empty( $privacy_region['dns_link'] );

        if ( ! $show_banner && ! $show_dns_link ) {
            return;
        }

        $position    = in_array( $settings['banner_position'] ?? 'bottom', array( 'top', 'bottom' ), true )
            ? ( $settings['banner_position'] ?? 'bottom' )
            : 'bottom';
        $privacy_url = ! empty( $settings['privacy_url'] ) ? esc_url( $settings['privacy_url'] ) : '';
        $opt_model   = $privacy_region['opt_model'];

        ?>
        <!-- PixelMaster Cookie Consent [<?php echo esc_attr( $privacy_region['region_id'] ); ?>] -->
        <div id="pm-consent-banner" class="pm-consent-banner pm-consent-<?php echo esc_attr( $position ); ?>"
             role="dialog" aria-label="<?php esc_attr_e( 'Cookie Consent', 'pixelmaster-sgtm' ); ?>"
             data-region="<?php echo esc_attr( $privacy_region['region_id'] ); ?>"
             data-model="<?php echo esc_attr( $opt_model ); ?>"
             style="display:none;">
            <div class="pm-consent-inner">
                <div class="pm-consent-text">
                    <?php if ( $opt_model === 'opt-in' ) : ?>
                        <p>
                            <?php esc_html_e( 'We use cookies to enhance your experience, analyze site traffic, and personalize content. You can choose which cookies to allow.', 'pixelmaster-sgtm' ); ?>
                            <?php if ( $privacy_url ) : ?>
                                <a href="<?php echo $privacy_url; ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Privacy Policy', 'pixelmaster-sgtm' ); ?></a>
                            <?php endif; ?>
                        </p>
                    <?php elseif ( $opt_model === 'opt-out' ) : ?>
                        <p>
                            <?php esc_html_e( 'We use cookies and similar technologies. You have the right to opt out of the sale or sharing of your personal information.', 'pixelmaster-sgtm' ); ?>
                            <?php if ( $privacy_url ) : ?>
                                <a href="<?php echo $privacy_url; ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Privacy Policy', 'pixelmaster-sgtm' ); ?></a>
                            <?php endif; ?>
                        </p>
                    <?php endif; ?>
                </div>

                <!-- Category toggles (opt-in regions) -->
                <?php if ( $opt_model === 'opt-in' ) : ?>
                <div id="pm-consent-categories" class="pm-consent-categories" style="display:none;">
                    <label class="pm-consent-cat">
                        <input type="checkbox" checked disabled />
                        <span><?php esc_html_e( 'Necessary', 'pixelmaster-sgtm' ); ?></span>
                        <small><?php esc_html_e( 'Always active', 'pixelmaster-sgtm' ); ?></small>
                    </label>
                    <label class="pm-consent-cat">
                        <input type="checkbox" id="pm-consent-analytics" />
                        <span><?php esc_html_e( 'Analytics', 'pixelmaster-sgtm' ); ?></span>
                        <small><?php esc_html_e( 'Google Analytics, traffic insights', 'pixelmaster-sgtm' ); ?></small>
                    </label>
                    <label class="pm-consent-cat">
                        <input type="checkbox" id="pm-consent-marketing" />
                        <span><?php esc_html_e( 'Marketing', 'pixelmaster-sgtm' ); ?></span>
                        <small><?php esc_html_e( 'Facebook, TikTok, personalized ads', 'pixelmaster-sgtm' ); ?></small>
                    </label>
                </div>
                <?php endif; ?>

                <div class="pm-consent-actions">
                    <?php if ( $opt_model === 'opt-in' ) : ?>
                        <!-- GDPR/LGPD/PIPEDA: Reject, Customize, Accept -->
                        <button id="pm-consent-reject" class="pm-consent-btn pm-consent-btn-secondary" type="button">
                            <?php esc_html_e( 'Reject All', 'pixelmaster-sgtm' ); ?>
                        </button>
                        <button id="pm-consent-customize" class="pm-consent-btn pm-consent-btn-secondary" type="button">
                            <?php esc_html_e( 'Customize', 'pixelmaster-sgtm' ); ?>
                        </button>
                        <button id="pm-consent-accept" class="pm-consent-btn pm-consent-btn-primary" type="button">
                            <?php esc_html_e( 'Accept All', 'pixelmaster-sgtm' ); ?>
                        </button>
                    <?php elseif ( $opt_model === 'opt-out' ) : ?>
                        <!-- CCPA: Do Not Sell + OK -->
                        <button id="pm-consent-dns" class="pm-consent-btn pm-consent-btn-secondary" type="button">
                            <?php esc_html_e( 'Do Not Sell My Info', 'pixelmaster-sgtm' ); ?>
                        </button>
                        <button id="pm-consent-accept" class="pm-consent-btn pm-consent-btn-primary" type="button">
                            <?php esc_html_e( 'OK', 'pixelmaster-sgtm' ); ?>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <script>
        (function(){
            'use strict';
            var banner=document.getElementById('pm-consent-banner');
            if(!banner)return;
            var model=banner.getAttribute('data-model');

            // Check if consent already given
            var existing=document.cookie.match(/(?:^|;\s*)pm_sgtm_consent=([^;]*)/);
            if(existing){return;}

            // GPC — auto-deny, no banner
            if(navigator.globalPrivacyControl){
                saveCookie({necessary:true,analytics:false,marketing:false,gpc:true});
                return;
            }

            // Show banner
            banner.style.display='';

            if(model==='opt-in'){
                // ── GDPR / LGPD / PIPEDA mode ──
                var catPanel=document.getElementById('pm-consent-categories');
                var analyticsBox=document.getElementById('pm-consent-analytics');
                var marketingBox=document.getElementById('pm-consent-marketing');
                var customizeBtn=document.getElementById('pm-consent-customize');

                document.getElementById('pm-consent-accept').addEventListener('click',function(){
                    if(catPanel&&catPanel.style.display!=='none'){
                        handleConsent(analyticsBox.checked,marketingBox.checked);
                    }else{
                        handleConsent(true,true);
                    }
                });

                document.getElementById('pm-consent-reject').addEventListener('click',function(){
                    handleConsent(false,false);
                });

                if(customizeBtn){
                    customizeBtn.addEventListener('click',function(){
                        if(catPanel.style.display==='none'){
                            catPanel.style.display='';
                            customizeBtn.textContent='<?php echo esc_js( __( 'Save Preferences', 'pixelmaster-sgtm' ) ); ?>';
                        }else{
                            handleConsent(analyticsBox.checked,marketingBox.checked);
                        }
                    });
                }
            }else if(model==='opt-out'){
                // ── CCPA mode ──
                var dnsBtn=document.getElementById('pm-consent-dns');
                if(dnsBtn){
                    dnsBtn.addEventListener('click',function(){
                        handleConsent(true,false); // Allow analytics, block ad targeting
                    });
                }
                document.getElementById('pm-consent-accept').addEventListener('click',function(){
                    handleConsent(true,true);
                });
            }

            function handleConsent(analytics,marketing){
                var consent={necessary:true,analytics:analytics,marketing:marketing,region:'<?php echo esc_js( $privacy_region['region_id'] ); ?>'};
                saveCookie(consent);
                if(typeof window.pmSgtmUpdateConsent==='function'){
                    window.pmSgtmUpdateConsent(analytics,marketing);
                }
                banner.style.display='none';
            }

            function saveCookie(consent){
                var val=encodeURIComponent(JSON.stringify(consent));
                var d=new Date();
                d.setTime(d.getTime()+(<?php echo absint( self::COOKIE_DAYS ); ?>*86400000));
                document.cookie='pm_sgtm_consent='+val+';expires='+d.toUTCString()+';path=/;SameSite=Lax;Secure';
            }
        })();
        </script>
        <?php
    }
}
