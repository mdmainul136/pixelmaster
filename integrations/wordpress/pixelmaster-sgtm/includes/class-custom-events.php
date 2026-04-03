<?php
/**
 * PM_SGTM_CustomEvents — Admin-defined custom event builder.
 * Allows defining custom JS events from admin UI (CSS selector + event type → dataLayer push).
 *
 * @package PixelMaster_SGTM
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

class PM_SGTM_CustomEvents {

    /** @var array Saved custom events */
    private $events = array();

    public function __construct() {
        $this->events = get_option( 'pm_sgtm_custom_events', array() );

        if ( ! empty( $this->events ) ) {
            add_action( 'wp_footer', array( $this, 'inject_custom_events' ), 99 );
        }

        // Admin AJAX
        add_action( 'wp_ajax_pm_sgtm_save_custom_events', array( $this, 'save_events' ) );
        add_action( 'wp_ajax_pm_sgtm_get_custom_events', array( $this, 'get_events' ) );
    }

    /**
     * Inject custom event listeners in footer.
     */
    public function inject_custom_events() {
        $active = array_filter( $this->events, function( $e ) {
            return ! empty( $e['active'] );
        });

        if ( empty( $active ) ) {
            return;
        }

        echo '<script>' . "\n";
        echo '(function(){' . "\n";
        echo '"use strict";' . "\n";
        echo 'var dl=window.dataLayer=window.dataLayer||[];' . "\n";

        foreach ( $active as $evt ) {
            $selector  = esc_js( $evt['selector'] );
            $trigger   = esc_js( $evt['trigger'] ?? 'click' );
            $event_name = esc_js( $evt['event_name'] );
            $params    = wp_json_encode( $evt['params'] ?? new stdClass() );

            if ( 'click' === $trigger ) {
                echo "document.addEventListener('click',function(e){" . "\n";
                echo "  var t=e.target.closest('{$selector}');" . "\n";
                echo "  if(!t)return;" . "\n";
                echo "  var p={$params};" . "\n";
                echo "  p.event='{$event_name}';" . "\n";
                echo "  p.element_text=(t.textContent||'').trim().substring(0,100);" . "\n";
                echo "  p.element_id=t.id||'';" . "\n";
                echo "  p.element_classes=t.className||'';" . "\n";
                echo "  dl.push(p);" . "\n";
                echo "});" . "\n";
            } elseif ( 'visible' === $trigger ) {
                echo "(function(){" . "\n";
                echo "  var els=document.querySelectorAll('{$selector}');" . "\n";
                echo "  if(!els.length)return;" . "\n";
                echo "  var obs=new IntersectionObserver(function(entries){" . "\n";
                echo "    entries.forEach(function(en){" . "\n";
                echo "      if(en.isIntersecting){" . "\n";
                echo "        var p={$params};" . "\n";
                echo "        p.event='{$event_name}';" . "\n";
                echo "        p.element_id=en.target.id||'';" . "\n";
                echo "        dl.push(p);" . "\n";
                echo "        obs.unobserve(en.target);" . "\n";
                echo "      }" . "\n";
                echo "    });" . "\n";
                echo "  },{threshold:0.5});" . "\n";
                echo "  els.forEach(function(el){obs.observe(el);});" . "\n";
                echo "})();" . "\n";
            } elseif ( 'submit' === $trigger ) {
                echo "document.addEventListener('submit',function(e){" . "\n";
                echo "  var t=e.target.closest('{$selector}');" . "\n";
                echo "  if(!t)return;" . "\n";
                echo "  var p={$params};" . "\n";
                echo "  p.event='{$event_name}';" . "\n";
                echo "  p.form_id=t.id||'';" . "\n";
                echo "  p.form_action=t.action||'';" . "\n";
                echo "  dl.push(p);" . "\n";
                echo "});" . "\n";
            } elseif ( 'hover' === $trigger ) {
                echo "document.addEventListener('mouseenter',function(e){" . "\n";
                echo "  if(!e.target.matches||!e.target.matches('{$selector}'))return;" . "\n";
                echo "  var p={$params};" . "\n";
                echo "  p.event='{$event_name}';" . "\n";
                echo "  p.element_text=(e.target.textContent||'').trim().substring(0,100);" . "\n";
                echo "  dl.push(p);" . "\n";
                echo "},true);" . "\n";
            }
        }

        echo '})();' . "\n";
        echo '</script>' . "\n";
    }

    /**
     * AJAX: Save custom events.
     */
    public function save_events() {
        check_ajax_referer( 'pm_sgtm_admin', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        $raw    = isset( $_POST['events'] ) ? wp_unslash( $_POST['events'] ) : '[]';
        $events = json_decode( $raw, true );

        if ( ! is_array( $events ) ) {
            wp_send_json_error( array( 'message' => 'Invalid data' ) );
        }

        $clean = array();
        $allowed_triggers = array( 'click', 'submit', 'visible', 'hover' );

        foreach ( $events as $evt ) {
            $trigger = sanitize_text_field( $evt['trigger'] ?? 'click' );
            if ( ! in_array( $trigger, $allowed_triggers, true ) ) {
                $trigger = 'click';
            }

            $e = array(
                'id'         => sanitize_title( $evt['id'] ?? wp_generate_uuid4() ),
                'event_name' => sanitize_title( $evt['event_name'] ?? '' ),
                'selector'   => sanitize_text_field( $evt['selector'] ?? '' ),
                'trigger'    => $trigger,
                'active'     => ! empty( $evt['active'] ),
                'params'     => array(),
            );

            // Sanitize custom params
            foreach ( $evt['params'] ?? array() as $key => $val ) {
                $skey = sanitize_key( $key );
                $sval = sanitize_text_field( $val );
                if ( $skey && $sval ) {
                    $e['params'][ $skey ] = $sval;
                }
            }

            if ( ! empty( $e['event_name'] ) && ! empty( $e['selector'] ) ) {
                $clean[] = $e;
            }
        }

        update_option( 'pm_sgtm_custom_events', $clean );
        wp_send_json_success( array( 'message' => 'Events saved', 'count' => count( $clean ) ) );
    }

    /**
     * AJAX: Get custom events.
     */
    public function get_events() {
        check_ajax_referer( 'pm_sgtm_admin', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( array( 'message' => 'Unauthorized' ) );
        }

        wp_send_json_success( $this->events );
    }
}
