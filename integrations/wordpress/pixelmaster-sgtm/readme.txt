=== PixelMaster sGTM — Server-Side Tracking ===
Contributors: pixelmaster
Tags: server-side tracking, google tag manager, sgtm, analytics, consent mode
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

One-click server-side Google Tag Manager integration with Consent Mode v2, WooCommerce support, and Enhanced Conversions.

== Description ==

**PixelMaster sGTM** connects your WordPress site to a server-side Google Tag Manager container for first-party tracking that bypasses ad blockers and improves data accuracy.

= Features =

* **Server-Side GTM** — Route all tracking through your own domain
* **Consent Mode v2** — GDPR-compliant default consent states
* **WooCommerce Integration** — Automatic e-commerce event tracking
* **Server-Side Purchase Events** — Measurement Protocol for 100% accuracy
* **Enhanced Conversions** — SHA-256 hashed PII for better attribution
* **Custom Loader** — Obfuscated script paths bypass ad blockers
* **Cookie Keeper** — Extend first-party cookie lifetime

= Security =

* API key encrypted at rest (AES-256-CBC)
* Nonce-verified AJAX requests
* Capability checks on all admin actions
* CSP nonce support for inline scripts
* HTTPS enforcement for transport URL
* Role-based tracking exclusion
* Clean uninstall (removes all data)
* No sensitive data exposed to frontend

= Compatibility =

* Works alongside all major plugins (Yoast SEO, WooCommerce, Elementor, etc.)
* Prefixed classes and options prevent conflicts
* Filter hooks for customization by other plugins
* Tested with WordPress multisite

== Installation ==

1. Upload the `pixelmaster-sgtm` folder to `/wp-content/plugins/`
2. Activate through the **Plugins** menu
3. Go to **PixelMaster** in the admin menu
4. Enter your Transport URL and GA4 Measurement ID
5. Click **Test Connection** → **Save Settings**

== Frequently Asked Questions ==

= Does this replace Google Tag Manager? =

No. This plugin sends data to your server-side GTM container. You still configure tags in GTM.

= Is it GDPR compliant? =

Yes. Enable Consent Mode v2 with "Denied" defaults. The plugin respects consent before sending data.

= Does it work with WooCommerce? =

Yes. It auto-detects WooCommerce and tracks: view_item, add_to_cart, view_cart, begin_checkout, purchase, and refund events.

= How is the API key protected? =

The API key is encrypted with AES-256-CBC using your WordPress AUTH_KEY salt. It is never exposed to the frontend.

== Changelog ==

= 1.0.0 =
* Initial release
* Server-side GTM integration
* WooCommerce e-commerce tracking
* Consent Mode v2 support
* Server-side purchase events via Measurement Protocol
* API key encryption
* Role-based exclusion
* CSP nonce support

== Upgrade Notice ==

= 1.0.0 =
Initial release. Configure your Transport URL after activation.
