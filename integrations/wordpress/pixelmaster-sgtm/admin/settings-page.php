<?php
/**
 * PM_SGTM_Settings — Admin Settings Page Template.
 * Clean, Shopify-style card-based UI.
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( 'Unauthorized access.', 'pixelmaster-sgtm' ) );
}

// Gather status data
$transport_url = get_option( 'pm_sgtm_transport_url', '' );
$detected_cmp  = class_exists( 'PM_SGTM_Consent' ) ? PM_SGTM_Consent::detect_third_party_cmp() : false;
$geo           = class_exists( 'PM_SGTM_Consent' ) ? PM_SGTM_Consent::detect_geo() : array( 'country' => '', 'region' => null, 'source' => 'none' );
$privacy       = class_exists( 'PM_SGTM_Consent' ) ? PM_SGTM_Consent::get_visitor_privacy_region() : null;

$cmp_names = array(
    'cookieyes' => 'CookieYes', 'complianz' => 'Complianz', 'cookiebot' => 'CookieBot',
    'borlabs' => 'Borlabs Cookie', 'moove' => 'Moove GDPR', 'wp_consent_api' => 'WP Consent API',
);
?>
<div class="pm-wrap">

    <?php settings_errors(); ?>

    <!-- Header -->
    <div class="pm-header">
        <div class="pm-header-icon">
            <span class="dashicons dashicons-chart-area"></span>
        </div>
        <div>
            <h1><?php esc_html_e( 'PixelMaster sGTM', 'pixelmaster-sgtm' ); ?></h1>
            <p><?php esc_html_e( 'Server-side tracking configuration', 'pixelmaster-sgtm' ); ?></p>
        </div>
    </div>

    <form method="post" action="options.php">
        <?php settings_fields( PM_SGTM_Settings::OPTION_GROUP ); ?>

        <!-- ═══ Connection ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Connection', 'pixelmaster-sgtm' ); ?></h2>
                <?php if ( ! empty( $transport_url ) ) : ?>
                    <span class="pm-badge"><?php esc_html_e( 'Connected', 'pixelmaster-sgtm' ); ?></span>
                <?php else : ?>
                    <span class="pm-badge pm-badge--warn"><?php esc_html_e( 'Not configured', 'pixelmaster-sgtm' ); ?></span>
                <?php endif; ?>
            </div>
            <div class="pm-card-body">
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_transport_url"><?php esc_html_e( 'Transport URL', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'Your sGTM tracking domain', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="url" id="pm_sgtm_transport_url" name="pm_sgtm_transport_url"
                                   value="<?php echo esc_attr( $transport_url ); ?>"
                                   class="pm-input" placeholder="https://track.yourdomain.com" />
                            <button type="button" id="pm-test-connection" class="pm-btn pm-btn--secondary">
                                <?php esc_html_e( 'Test', 'pixelmaster-sgtm' ); ?>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_measurement_id"><?php esc_html_e( 'Measurement ID', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'GA4 Measurement ID', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <input type="text" id="pm_sgtm_measurement_id" name="pm_sgtm_measurement_id"
                               value="<?php echo esc_attr( get_option( 'pm_sgtm_measurement_id' ) ); ?>"
                               class="pm-input pm-input--short" placeholder="G-XXXXXXXXXX" />
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_container_id"><?php esc_html_e( 'Container ID', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'GTM Container ID', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <input type="text" id="pm_sgtm_container_id" name="pm_sgtm_container_id"
                               value="<?php echo esc_attr( get_option( 'pm_sgtm_container_id' ) ); ?>"
                               class="pm-input pm-input--short" placeholder="GTM-XXXXXXX" />
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_api_key"><?php esc_html_e( 'API Key', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'Stored encrypted', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="password" id="pm_sgtm_api_key" name="pm_sgtm_api_key"
                                   value="<?php echo esc_attr( get_option( 'pm_sgtm_api_key' ) ); ?>"
                                   class="pm-input" autocomplete="off" />
                            <button type="button" class="pm-eye-btn pm-sgtm-api-toggle" aria-label="<?php esc_attr_e( 'Toggle visibility', 'pixelmaster-sgtm' ); ?>">👁</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Tracking Pixels ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Tracking pixels', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body">
                <div class="pm-field">
                    <div class="pm-field-label">
                        <span><?php esc_html_e( 'GA4 Data Layer', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_ga4_datalayer" value="1"
                                   <?php checked( get_option( 'pm_sgtm_ga4_datalayer', '1' ), '1' ); ?> />
                            <span class="pm-toggle-text">
                                <?php esc_html_e( 'Push GA4 e-commerce events to dataLayer', 'pixelmaster-sgtm' ); ?>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_meta_pixel_id"><?php esc_html_e( 'Meta Pixel', 'pixelmaster-sgtm' ); ?></label>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="text" id="pm_sgtm_meta_pixel_id" name="pm_sgtm_meta_pixel_id"
                                   value="<?php echo esc_attr( get_option( 'pm_sgtm_meta_pixel_id' ) ); ?>"
                                   class="pm-input pm-input--short" placeholder="123456789012345" />
                            <label class="pm-toggle" style="margin-left:4px;">
                                <input type="checkbox" name="pm_sgtm_meta_datalayer" value="1"
                                       <?php checked( get_option( 'pm_sgtm_meta_datalayer', '1' ), '1' ); ?> />
                                <span><?php esc_html_e( 'Enable', 'pixelmaster-sgtm' ); ?></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_tiktok_pixel_id"><?php esc_html_e( 'TikTok Pixel', 'pixelmaster-sgtm' ); ?></label>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="text" id="pm_sgtm_tiktok_pixel_id" name="pm_sgtm_tiktok_pixel_id"
                                   value="<?php echo esc_attr( get_option( 'pm_sgtm_tiktok_pixel_id' ) ); ?>"
                                   class="pm-input pm-input--short" placeholder="CXXXXXXXXXXXXXXXXX" />
                            <label class="pm-toggle" style="margin-left:4px;">
                                <input type="checkbox" name="pm_sgtm_tiktok_datalayer" value="1"
                                       <?php checked( get_option( 'pm_sgtm_tiktok_datalayer', '1' ), '1' ); ?> />
                                <span><?php esc_html_e( 'Enable', 'pixelmaster-sgtm' ); ?></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Features ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Features', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body">
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Page views', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_auto_page_view" value="1"
                                   <?php checked( get_option( 'pm_sgtm_auto_page_view', '1' ), '1' ); ?> />
                            <span class="pm-toggle-text"><?php esc_html_e( 'Automatically track page views', 'pixelmaster-sgtm' ); ?></span>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Custom loader', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_custom_loader" value="1"
                                   <?php checked( get_option( 'pm_sgtm_custom_loader' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Obfuscated script paths', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( 'Bypass ad blockers — up to +40% more data', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Cookie keeper', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_cookie_keeper" value="1"
                                   <?php checked( get_option( 'pm_sgtm_cookie_keeper' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Extend first-party cookie lifetime', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( 'Up to 400 days for improved attribution', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Consent & Privacy ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Consent & privacy', 'pixelmaster-sgtm' ); ?></h2>
                <?php if ( $privacy ) : ?>
                    <span class="pm-badge pm-badge--info"><?php echo esc_html( $privacy['name'] ); ?></span>
                <?php endif; ?>
            </div>
            <div class="pm-card-body">
                <?php if ( $privacy && ! empty( $geo['country'] ) ) : ?>
                <div class="pm-banner pm-banner--info">
                    <span class="pm-banner-icon">🌍</span>
                    <div>
                        <?php
                        printf(
                            /* translators: %1$s country, %2$s source, %3$s law name, %4$s model */
                            esc_html__( 'Detected: %1$s via %2$s — %3$s (%4$s)', 'pixelmaster-sgtm' ),
                            '<strong>' . esc_html( $geo['country'] . ( $geo['region'] ? '-' . $geo['region'] : '' ) ) . '</strong>',
                            esc_html( $geo['source'] ),
                            '<strong>' . esc_html( $privacy['name'] ) . '</strong>',
                            esc_html( $privacy['opt_model'] )
                        );
                        ?>
                    </div>
                </div>
                <?php endif; ?>

                <?php if ( $detected_cmp ) : ?>
                <div class="pm-banner pm-banner--success">
                    <span class="pm-banner-icon">✓</span>
                    <div>
                        <?php
                        printf(
                            esc_html__( '%s detected — built-in banner auto-disabled', 'pixelmaster-sgtm' ),
                            '<strong>' . esc_html( $cmp_names[ $detected_cmp ] ?? $detected_cmp ) . '</strong>'
                        );
                        ?>
                    </div>
                </div>
                <?php endif; ?>

                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Consent Mode v2', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_consent_mode" value="1"
                                   <?php checked( get_option( 'pm_sgtm_consent_mode', '1' ), '1' ); ?> />
                            <span class="pm-toggle-text"><?php esc_html_e( 'Enable Google Consent Mode v2', 'pixelmaster-sgtm' ); ?></span>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <span><?php esc_html_e( 'Fallback default', 'pixelmaster-sgtm' ); ?></span>
                        <span class="pm-hint"><?php esc_html_e( 'Used when geo is unavailable', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <select name="pm_sgtm_consent_default" class="pm-select">
                            <option value="denied" <?php selected( get_option( 'pm_sgtm_consent_default' ), 'denied' ); ?>>
                                <?php esc_html_e( 'Denied (GDPR-safe)', 'pixelmaster-sgtm' ); ?>
                            </option>
                            <option value="granted" <?php selected( get_option( 'pm_sgtm_consent_default' ), 'granted' ); ?>>
                                <?php esc_html_e( 'Granted', 'pixelmaster-sgtm' ); ?>
                            </option>
                        </select>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Consent banner', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_consent_banner" value="1"
                                   <?php checked( get_option( 'pm_sgtm_consent_banner', '1' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Show built-in consent banner', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( 'Auto-adapts: opt-in for GDPR, opt-out for CCPA, hidden for other regions', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Position', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <select name="pm_sgtm_banner_position" class="pm-select">
                            <option value="bottom" <?php selected( get_option( 'pm_sgtm_banner_position', 'bottom' ), 'bottom' ); ?>>
                                <?php esc_html_e( 'Bottom', 'pixelmaster-sgtm' ); ?>
                            </option>
                            <option value="top" <?php selected( get_option( 'pm_sgtm_banner_position', 'bottom' ), 'top' ); ?>>
                                <?php esc_html_e( 'Top', 'pixelmaster-sgtm' ); ?>
                            </option>
                        </select>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_privacy_url"><?php esc_html_e( 'Privacy policy', 'pixelmaster-sgtm' ); ?></label>
                    </div>
                    <div class="pm-field-input">
                        <input type="url" id="pm_sgtm_privacy_url" name="pm_sgtm_privacy_url"
                               value="<?php echo esc_attr( get_option( 'pm_sgtm_privacy_url' ) ); ?>"
                               class="pm-input" placeholder="https://example.com/privacy-policy" />
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Catalogue Manager ═══ -->
        <?php if ( class_exists( 'WooCommerce' ) ) : ?>
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Catalogue manager', 'pixelmaster-sgtm' ); ?></h2>
                <span class="pm-badge pm-badge--info"><?php esc_html_e( 'POAS Integration', 'pixelmaster-sgtm' ); ?></span>
            </div>
            <div class="pm-card-body">
                <div class="pm-banner pm-banner--info">
                    <span class="pm-banner-icon">📦</span>
                    <div>
                        <?php esc_html_e( 'Synchronize your products with the Catalogue Manager to track real-time Profit on Ad Spend (POAS).', 'pixelmaster-sgtm' ); ?>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Real-time sync', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_catalogue_sync" value="1"
                                   <?php checked( get_option( 'pm_sgtm_catalogue_sync', '1' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Auto-sync products on save', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( 'Syncs SKU, price, and stock changes immediately.', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <span><?php esc_html_e( 'Manual synchronization', 'pixelmaster-sgtm' ); ?></span>
                        <span class="pm-hint"><?php esc_html_e( 'Use for initial setup or full updates.', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input" style="display:flex;align-items:center;gap:12px;">
                        <button type="button" id="pm-catalogue-sync-btn" class="pm-btn pm-btn--secondary pm-btn--sm">
                            <?php esc_html_e( 'Sync catalog now', 'pixelmaster-sgtm' ); ?>
                        </button>
                        <span id="pm-sync-status" style="font-size:12px;color:#6d7175;"></span>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- ═══ Enhanced Conversions ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Enhanced conversions', 'pixelmaster-sgtm' ); ?></h2>
                <span class="pm-badge pm-badge--info"><?php esc_html_e( 'Server-side', 'pixelmaster-sgtm' ); ?></span>
            </div>
            <div class="pm-card-body">
                <div class="pm-banner pm-banner--info">
                    <span class="pm-banner-icon">🔐</span>
                    <div>
                        <?php esc_html_e( 'Server-side events send hashed PII directly to Meta & TikTok for 30-40% more attributed conversions. Requires platform API tokens.', 'pixelmaster-sgtm' ); ?>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_meta_access_token"><?php esc_html_e( 'Meta Conversions API token', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'From Events Manager → Settings → Generate access token', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="password" id="pm_sgtm_meta_access_token" name="pm_sgtm_meta_access_token"
                                   value="<?php echo esc_attr( get_option( 'pm_sgtm_meta_access_token' ) ); ?>"
                                   class="pm-input" autocomplete="off" placeholder="EAAxxxxxx..." />
                            <button type="button" class="pm-eye-btn pm-sgtm-api-toggle" aria-label="<?php esc_attr_e( 'Toggle visibility', 'pixelmaster-sgtm' ); ?>">👁</button>
                        </div>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_tiktok_access_token"><?php esc_html_e( 'TikTok Events API token', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'From TikTok Business Center → Events → Server Events', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <div class="pm-field-row">
                            <input type="password" id="pm_sgtm_tiktok_access_token" name="pm_sgtm_tiktok_access_token"
                                   value="<?php echo esc_attr( get_option( 'pm_sgtm_tiktok_access_token' ) ); ?>"
                                   class="pm-input" autocomplete="off" placeholder="server_xxxxxxxxxx" />
                            <button type="button" class="pm-eye-btn pm-sgtm-api-toggle" aria-label="<?php esc_attr_e( 'Toggle visibility', 'pixelmaster-sgtm' ); ?>">👁</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Engagement Tracking ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Engagement tracking', 'pixelmaster-sgtm' ); ?></h2>
                <span class="pm-badge"><?php esc_html_e( 'Auto', 'pixelmaster-sgtm' ); ?></span>
            </div>
            <div class="pm-card-body">
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Scroll depth', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_scroll_tracking" value="1"
                                   <?php checked( get_option( 'pm_sgtm_scroll_tracking', '1' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Track scroll milestones', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( '25%, 50%, 75%, 100% — pushed as scroll_depth events', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Time on page', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_time_tracking" value="1"
                                   <?php checked( get_option( 'pm_sgtm_time_tracking', '1' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Track time thresholds + engaged sessions', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( '10s, 30s, 60s, 180s — plus engaged_session after 10s+interaction', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'File downloads', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_download_tracking" value="1"
                                   <?php checked( get_option( 'pm_sgtm_download_tracking', '1' ), '1' ); ?> />
                            <div>
                                <span class="pm-toggle-text"><?php esc_html_e( 'Auto-track file download clicks', 'pixelmaster-sgtm' ); ?></span>
                                <span class="pm-toggle-desc"><?php esc_html_e( 'PDF, ZIP, DOC, XLS, CSV, PPT, EXE, DMG and more', 'pixelmaster-sgtm' ); ?></span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Event Monitor ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Event monitor', 'pixelmaster-sgtm' ); ?></h2>
                <button type="button" id="pm-refresh-health" class="pm-btn pm-btn--secondary pm-btn--sm">
                    <?php esc_html_e( 'Refresh', 'pixelmaster-sgtm' ); ?>
                </button>
            </div>
            <div class="pm-card-body">
                <div id="pm-health-panel">
                    <div class="pm-health-grid">
                        <div class="pm-health-item">
                            <span class="pm-health-label"><?php esc_html_e( 'Status', 'pixelmaster-sgtm' ); ?></span>
                            <span id="pm-health-status" class="pm-health-value">—</span>
                        </div>
                        <div class="pm-health-item">
                            <span class="pm-health-label"><?php esc_html_e( 'Latency', 'pixelmaster-sgtm' ); ?></span>
                            <span id="pm-health-latency" class="pm-health-value">—</span>
                        </div>
                        <div class="pm-health-item">
                            <span class="pm-health-label"><?php esc_html_e( 'Events today', 'pixelmaster-sgtm' ); ?></span>
                            <span id="pm-health-events" class="pm-health-value">—</span>
                        </div>
                        <div class="pm-health-item">
                            <span class="pm-health-label"><?php esc_html_e( 'Errors (24h)', 'pixelmaster-sgtm' ); ?></span>
                            <span id="pm-health-errors" class="pm-health-value">—</span>
                        </div>
                    </div>
                </div>
                <div id="pm-event-log" style="margin-top:16px;">
                    <h4 style="margin:0 0 8px;font-size:13px;color:#6d7175;"><?php esc_html_e( 'Recent events', 'pixelmaster-sgtm' ); ?></h4>
                    <table class="pm-status-table" id="pm-event-table">
                        <thead>
                            <tr>
                                <th><?php esc_html_e( 'Event', 'pixelmaster-sgtm' ); ?></th>
                                <th><?php esc_html_e( 'Source', 'pixelmaster-sgtm' ); ?></th>
                                <th><?php esc_html_e( 'Status', 'pixelmaster-sgtm' ); ?></th>
                                <th><?php esc_html_e( 'Time', 'pixelmaster-sgtm' ); ?></th>
                            </tr>
                        </thead>
                        <tbody id="pm-event-tbody">
                            <tr><td colspan="4" style="text-align:center;color:#8c9196;"><?php esc_html_e( 'Click Refresh to load events', 'pixelmaster-sgtm' ); ?></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ═══ Tools ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Tools', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body">
                <div class="pm-tools-grid">
                    <div class="pm-tool-item">
                        <h4><?php esc_html_e( 'Export settings', 'pixelmaster-sgtm' ); ?></h4>
                        <p><?php esc_html_e( 'Download all settings as JSON backup', 'pixelmaster-sgtm' ); ?></p>
                        <button type="button" id="pm-export-btn" class="pm-btn pm-btn--secondary pm-btn--sm">
                            <?php esc_html_e( 'Export', 'pixelmaster-sgtm' ); ?>
                        </button>
                    </div>
                    <div class="pm-tool-item">
                        <h4><?php esc_html_e( 'Import settings', 'pixelmaster-sgtm' ); ?></h4>
                        <p><?php esc_html_e( 'Restore settings from JSON file', 'pixelmaster-sgtm' ); ?></p>
                        <input type="file" id="pm-import-file" accept=".json" style="display:none;" />
                        <button type="button" id="pm-import-btn" class="pm-btn pm-btn--secondary pm-btn--sm">
                            <?php esc_html_e( 'Import', 'pixelmaster-sgtm' ); ?>
                        </button>
                    </div>
                    <div class="pm-tool-item">
                        <h4><?php esc_html_e( 'Snippet generator', 'pixelmaster-sgtm' ); ?></h4>
                        <p><?php esc_html_e( 'Generate tracking code for non-WP sites', 'pixelmaster-sgtm' ); ?></p>
                        <button type="button" id="pm-snippet-btn" class="pm-btn pm-btn--secondary pm-btn--sm">
                            <?php esc_html_e( 'Generate', 'pixelmaster-sgtm' ); ?>
                        </button>
                    </div>
                </div>
                <div id="pm-snippet-output" style="display:none;margin-top:16px;padding:0 20px 16px;">
                    <textarea class="pm-input" rows="8" readonly style="font-family:monospace;font-size:12px;max-width:100%;"></textarea>
                    <button type="button" id="pm-snippet-copy" class="pm-btn pm-btn--secondary pm-btn--sm" style="margin-top:8px;">
                        <?php esc_html_e( 'Copy to clipboard', 'pixelmaster-sgtm' ); ?>
                    </button>
                </div>

                <!-- UTM Builder -->
                <div style="border-top:1px solid #e1e3e5;padding:20px;">
                    <h3 style="font-size:14px;font-weight:600;color:#202223;margin:0 0 4px;"><?php esc_html_e( 'UTM Campaign URL Builder', 'pixelmaster-sgtm' ); ?></h3>
                    <p style="font-size:12px;color:#6d7175;margin:0 0 16px;"><?php esc_html_e( 'Generate tagged URLs to track campaign performance in GA4, Meta, and TikTok.', 'pixelmaster-sgtm' ); ?></p>

                    <div class="pm-field" style="border-bottom:1px solid #f1f2f3;">
                        <div class="pm-field-label">
                            <label for="pm-utm-url"><?php esc_html_e( 'Website URL', 'pixelmaster-sgtm' ); ?> <span style="color:#d72c0d;">*</span></label>
                            <span class="pm-hint"><?php esc_html_e( 'Full page URL to tag', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="url" id="pm-utm-url" class="pm-input" placeholder="https://yoursite.com/landing-page" />
                        </div>
                    </div>
                    <div class="pm-field" style="border-bottom:1px solid #f1f2f3;">
                        <div class="pm-field-label">
                            <label for="pm-utm-source"><?php esc_html_e( 'Campaign Source', 'pixelmaster-sgtm' ); ?> <span style="color:#d72c0d;">*</span></label>
                            <span class="pm-hint"><?php esc_html_e( 'e.g. google, facebook, newsletter', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="text" id="pm-utm-source" class="pm-input pm-input--short" list="pm-utm-source-list" placeholder="google" />
                            <datalist id="pm-utm-source-list">
                                <option value="google"><option value="facebook"><option value="instagram"><option value="tiktok">
                                <option value="twitter"><option value="linkedin"><option value="youtube"><option value="email">
                                <option value="newsletter"><option value="bing"><option value="pinterest"><option value="snapchat">
                            </datalist>
                        </div>
                    </div>
                    <div class="pm-field" style="border-bottom:1px solid #f1f2f3;">
                        <div class="pm-field-label">
                            <label for="pm-utm-medium"><?php esc_html_e( 'Campaign Medium', 'pixelmaster-sgtm' ); ?> <span style="color:#d72c0d;">*</span></label>
                            <span class="pm-hint"><?php esc_html_e( 'e.g. cpc, email, social, banner', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="text" id="pm-utm-medium" class="pm-input pm-input--short" list="pm-utm-medium-list" placeholder="cpc" />
                            <datalist id="pm-utm-medium-list">
                                <option value="cpc"><option value="cpm"><option value="email"><option value="social">
                                <option value="organic"><option value="referral"><option value="display"><option value="banner">
                                <option value="retargeting"><option value="affiliate"><option value="video"><option value="push">
                            </datalist>
                        </div>
                    </div>
                    <div class="pm-field" style="border-bottom:1px solid #f1f2f3;">
                        <div class="pm-field-label">
                            <label for="pm-utm-campaign"><?php esc_html_e( 'Campaign Name', 'pixelmaster-sgtm' ); ?> <span style="color:#d72c0d;">*</span></label>
                            <span class="pm-hint"><?php esc_html_e( 'e.g. spring_sale, brand_2024', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="text" id="pm-utm-campaign" class="pm-input pm-input--short" placeholder="spring_sale_2024" />
                        </div>
                    </div>
                    <div class="pm-field" style="border-bottom:1px solid #f1f2f3;">
                        <div class="pm-field-label">
                            <label for="pm-utm-term"><?php esc_html_e( 'Campaign Term', 'pixelmaster-sgtm' ); ?></label>
                            <span class="pm-hint"><?php esc_html_e( 'Optional — paid keyword', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="text" id="pm-utm-term" class="pm-input pm-input--short" placeholder="running+shoes" />
                        </div>
                    </div>
                    <div class="pm-field">
                        <div class="pm-field-label">
                            <label for="pm-utm-content"><?php esc_html_e( 'Campaign Content', 'pixelmaster-sgtm' ); ?></label>
                            <span class="pm-hint"><?php esc_html_e( 'Optional — ad variation / CTA', 'pixelmaster-sgtm' ); ?></span>
                        </div>
                        <div class="pm-field-input">
                            <input type="text" id="pm-utm-content" class="pm-input pm-input--short" placeholder="blue_banner_v2" />
                        </div>
                    </div>

                    <div style="padding:16px 0 0;display:flex;align-items:center;gap:8px;">
                        <button type="button" id="pm-utm-generate" class="pm-btn pm-btn--primary pm-btn--sm">
                            <?php esc_html_e( 'Generate URL', 'pixelmaster-sgtm' ); ?>
                        </button>
                        <button type="button" id="pm-utm-clear" class="pm-btn pm-btn--secondary pm-btn--sm">
                            <?php esc_html_e( 'Clear', 'pixelmaster-sgtm' ); ?>
                        </button>
                    </div>

                    <div id="pm-utm-output" style="display:none;margin-top:16px;">
                        <label style="font-size:12px;font-weight:500;color:#6d7175;display:block;margin-bottom:4px;"><?php esc_html_e( 'Generated URL', 'pixelmaster-sgtm' ); ?></label>
                        <div class="pm-field-row">
                            <input type="text" id="pm-utm-result" class="pm-input" readonly style="max-width:100%;font-family:monospace;font-size:12px;background:#f9fafb;" />
                            <button type="button" id="pm-utm-copy" class="pm-btn pm-btn--secondary pm-btn--sm"><?php esc_html_e( 'Copy', 'pixelmaster-sgtm' ); ?></button>
                        </div>
                        <div id="pm-utm-short" style="margin-top:8px;display:none;">
                            <label style="font-size:12px;font-weight:500;color:#6d7175;display:block;margin-bottom:4px;"><?php esc_html_e( 'Short URL', 'pixelmaster-sgtm' ); ?></label>
                            <div class="pm-field-row">
                                <input type="text" id="pm-utm-short-result" class="pm-input" readonly style="max-width:100%;font-family:monospace;font-size:12px;background:#f9fafb;" />
                                <button type="button" id="pm-utm-short-copy" class="pm-btn pm-btn--secondary pm-btn--sm"><?php esc_html_e( 'Copy', 'pixelmaster-sgtm' ); ?></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══ Custom Events ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Custom Events', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body" style="padding:20px;">
                <p style="font-size:12px;color:#6d7175;margin:0 0 16px;">
                    <?php esc_html_e( 'Define custom dataLayer events triggered by user interactions — no code required.', 'pixelmaster-sgtm' ); ?>
                </p>
                <div id="pm-custom-events-list"></div>
                <div style="margin-top:12px;display:flex;gap:8px;">
                    <button type="button" id="pm-ce-add" class="pm-btn pm-btn--secondary pm-btn--sm">
                        + <?php esc_html_e( 'Add event', 'pixelmaster-sgtm' ); ?>
                    </button>
                    <button type="button" id="pm-ce-save" class="pm-btn pm-btn--primary pm-btn--sm">
                        <?php esc_html_e( 'Save events', 'pixelmaster-sgtm' ); ?>
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══ A/B Tests ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'A/B Tests', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body" style="padding:20px;">
                <p style="font-size:12px;color:#6d7175;margin:0 0 16px;">
                    <?php esc_html_e( 'Split test experiments — visitors are assigned to a variant via sticky cookie and data pushed to GA4.', 'pixelmaster-sgtm' ); ?>
                </p>
                <div id="pm-ab-tests-list"></div>
                <div style="margin-top:12px;display:flex;gap:8px;">
                    <button type="button" id="pm-ab-add" class="pm-btn pm-btn--secondary pm-btn--sm">
                        + <?php esc_html_e( 'Add test', 'pixelmaster-sgtm' ); ?>
                    </button>
                    <button type="button" id="pm-ab-save" class="pm-btn pm-btn--primary pm-btn--sm">
                        <?php esc_html_e( 'Save tests', 'pixelmaster-sgtm' ); ?>
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══ Advanced ═══ -->
        <div class="pm-card">
            <div class="pm-card-header">
                <h2><?php esc_html_e( 'Advanced', 'pixelmaster-sgtm' ); ?></h2>
            </div>
            <div class="pm-card-body">
                <div class="pm-field">
                    <div class="pm-field-label">
                        <label for="pm_sgtm_exclude_roles"><?php esc_html_e( 'Exclude roles', 'pixelmaster-sgtm' ); ?></label>
                        <span class="pm-hint"><?php esc_html_e( 'Comma-separated', 'pixelmaster-sgtm' ); ?></span>
                    </div>
                    <div class="pm-field-input">
                        <input type="text" id="pm_sgtm_exclude_roles" name="pm_sgtm_exclude_roles"
                               value="<?php echo esc_attr( get_option( 'pm_sgtm_exclude_roles', '' ) ); ?>"
                               class="pm-input" placeholder="administrator, editor" />
                    </div>
                </div>
                <div class="pm-field">
                    <div class="pm-field-label"><span><?php esc_html_e( 'Debug mode', 'pixelmaster-sgtm' ); ?></span></div>
                    <div class="pm-field-input">
                        <label class="pm-toggle">
                            <input type="checkbox" name="pm_sgtm_debug_mode" value="1"
                                   <?php checked( get_option( 'pm_sgtm_debug_mode' ), '1' ); ?> />
                            <span class="pm-toggle-text"><?php esc_html_e( 'Log events to browser console', 'pixelmaster-sgtm' ); ?></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save -->
        <div class="pm-card">
            <div class="pm-submit">
                <button type="submit" class="pm-btn pm-btn--primary"><?php esc_html_e( 'Save settings', 'pixelmaster-sgtm' ); ?></button>
            </div>
        </div>

    </form>

    <!-- ═══ Status ═══ -->
    <div class="pm-card">
        <div class="pm-card-header">
            <h2><?php esc_html_e( 'System status', 'pixelmaster-sgtm' ); ?></h2>
        </div>
        <div class="pm-card-body">
            <table class="pm-status-table">
                <tr>
                    <td><?php esc_html_e( 'Plugin version', 'pixelmaster-sgtm' ); ?></td>
                    <td><?php echo esc_html( PM_SGTM_VERSION ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Transport URL', 'pixelmaster-sgtm' ); ?></td>
                    <td>
                        <?php if ( $transport_url ) : ?>
                            <span class="pm-status-dot pm-status-dot--ok"></span><?php echo esc_html( $transport_url ); ?>
                        <?php else : ?>
                            <span class="pm-status-dot pm-status-dot--warn"></span><?php esc_html_e( 'Not configured', 'pixelmaster-sgtm' ); ?>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'PHP', 'pixelmaster-sgtm' ); ?></td>
                    <td><?php echo esc_html( PHP_VERSION ); ?></td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'WooCommerce', 'pixelmaster-sgtm' ); ?></td>
                    <td>
                        <?php if ( class_exists( 'WooCommerce' ) ) : ?>
                            <span class="pm-status-dot pm-status-dot--ok"></span><?php echo esc_html( WC()->version ); ?>
                        <?php else : ?>
                            <span class="pm-status-dot pm-status-dot--err"></span><?php esc_html_e( 'Not installed', 'pixelmaster-sgtm' ); ?>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'OpenSSL', 'pixelmaster-sgtm' ); ?></td>
                    <td>
                        <?php if ( function_exists( 'openssl_encrypt' ) ) : ?>
                            <span class="pm-status-dot pm-status-dot--ok"></span><?php esc_html_e( 'Available', 'pixelmaster-sgtm' ); ?>
                        <?php else : ?>
                            <span class="pm-status-dot pm-status-dot--warn"></span><?php esc_html_e( 'Not available', 'pixelmaster-sgtm' ); ?>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <td><?php esc_html_e( 'Geo detection', 'pixelmaster-sgtm' ); ?></td>
                    <td>
                        <?php if ( ! empty( $geo['country'] ) ) : ?>
                            <span class="pm-status-dot pm-status-dot--ok"></span>
                            <?php echo esc_html( $geo['source'] ); ?>
                        <?php else : ?>
                            <span class="pm-status-dot pm-status-dot--warn"></span><?php esc_html_e( 'Unavailable — using fallback', 'pixelmaster-sgtm' ); ?>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php if ( $detected_cmp ) : ?>
                <tr>
                    <td><?php esc_html_e( 'Consent CMP', 'pixelmaster-sgtm' ); ?></td>
                    <td>
                        <span class="pm-status-dot pm-status-dot--ok"></span>
                        <?php echo esc_html( $cmp_names[ $detected_cmp ] ?? $detected_cmp ); ?>
                    </td>
                </tr>
                <?php endif; ?>
            </table>
        </div>
    </div>

</div>
