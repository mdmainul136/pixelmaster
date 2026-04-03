/**
 * PixelMaster JS SDK v1.0.0
 * (c) 2026 PixelMaster — Server-Side Tracking
 * License: MIT
 * Built: 2026-04-02T10:49:29.656Z
 */
(function(window, document) {
'use strict';

// ── utils.js ──
/**
 * PixelMaster JS SDK — Utility Functions
 * Client ID generation, cookie management, data formatting
 */

const PM_COOKIE_NAME = '_pm_cid';
const PM_SESSION_COOKIE = '_pm_sid';
const PM_COOKIE_DAYS = 400; // Max cookie lifetime (like Cookie Keeper)

/**
 * Generate a GA4-compatible client ID (timestamp.random).
 */
function generateClientId() {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 2147483647);
    return `${timestamp}.${random}`;
}

/**
 * Generate a unique session ID.
 */
function generateSessionId() {
    return Math.floor(Date.now() / 1000).toString();
}

/**
 * Generate a unique event ID for deduplication.
 */
function generateEventId() {
    return 'pm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Set a cookie with configurable expiry.
 */
function setCookie(name, value, days = PM_COOKIE_DAYS) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax;Secure`;
}

/**
 * Get a cookie value by name.
 */
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Delete a cookie.
 */
function deleteCookie(name) {
    setCookie(name, '', -1);
}

/**
 * Get or create a persistent client ID (first-party cookie).
 */
function getOrCreateClientId() {
    let clientId = getCookie(PM_COOKIE_NAME);
    if (!clientId) {
        clientId = generateClientId();
        setCookie(PM_COOKIE_NAME, clientId);
    }
    return clientId;
}

/**
 * Get or create a session ID (session cookie).
 */
function getOrCreateSessionId() {
    let sessionId = getCookie(PM_SESSION_COOKIE);
    if (!sessionId) {
        sessionId = generateSessionId();
        setCookie(PM_SESSION_COOKIE, sessionId, 0.0208); // ~30 minutes
    }
    return sessionId;
}

/**
 * Extract UTM parameters from URL.
 */
function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
        const val = params.get(key);
        if (val) utms[key] = val;
    });
    return utms;
}

/**
 * Extract click IDs from URL (gclid, fbclid, ttclid, etc.).
 */
function getClickIds() {
    const params = new URLSearchParams(window.location.search);
    const clickIds = {};
    ['gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid', 'sclid', 'msclkid', 'li_fat_id', 'epik'].forEach(key => {
        const val = params.get(key);
        if (val) clickIds[key] = val;
    });
    return clickIds;
}

/**
 * SHA-256 hash a string (for PII hashing).
 */
async function hashSHA256(value) {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format a phone number to E.164 (basic).
 */
function formatPhoneE164(phone, countryCode = '1') {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('+')) return digits;
    if (digits.length === 10) return `+${countryCode}${digits}`;
    if (digits.length === 11 && digits.startsWith(countryCode)) return `+${digits}`;
    return `+${digits}`;
}

/**
 * Build common event context (page, screen, timing).
 */
function buildEventContext() {
    return {
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: document.referrer || undefined,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        user_agent: navigator.userAgent,
        timestamp_micros: Date.now() * 1000,
    };
}

/**
 * Reliable beacon or fetch send with retry.
 */
function sendBeacon(url, data) {
    const payload = JSON.stringify(data);

    // Try sendBeacon first (survives page unload)
    if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return Promise.resolve(true);
    }

    // Fallback to fetch with keepalive
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
    }).then(() => true).catch(() => false);
}


// ── engagement.js ──
/**
 * PixelMaster JS SDK — Engagement Tracker
 * Handles scroll depth, time on page, and file downloads.
 */

class EngagementTracker {
    constructor(pixelmaster) {
        this.pm = pixelmaster;
        this.config = {};
        
        // State
        this.scrollMarks = { 25: false, 50: false, 75: false, 100: false };
        this.timeMarks = { 10: false, 30: false, 60: false, 180: false };
        this.interactionOccurred = false;
        this.engagedSessionSet = false;
        
        // Throttling
        this.scrollThrottle = false;
    }

    /**
     * Start the trackers based on config
     */
    init(config = {}) {
        this.config = config;
        
        if (this.config.scrollTracking) {
            window.addEventListener('scroll', this._handleScroll.bind(this), { passive: true });
        }
        
        if (this.config.timeTracking) {
            this._startTimeTracker();
            // Listen for interactions to mark session as engaged
            ['scroll', 'click', 'keypress'].forEach(evt => {
                window.addEventListener('scroll', () => { this.interactionOccurred = true; }, { once: true, passive: true });
                window.addEventListener('click', () => { this.interactionOccurred = true; }, { once: true, passive: true });
                window.addEventListener('keypress', () => { this.interactionOccurred = true; }, { once: true, passive: true });
            });
        }
        
        if (this.config.downloadTracking) {
            document.addEventListener('click', this._handleDownloadClick.bind(this));
        }
    }

    _handleScroll() {
        if (this.scrollThrottle) return;
        this.scrollThrottle = true;
        
        setTimeout(() => {
            const docHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
            
            const winHeight = window.innerHeight || document.documentElement.clientHeight;
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            
            const scrollPercent = (scrollY / (docHeight - winHeight)) * 100;
            
            [25, 50, 75, 100].forEach(mark => {
                // Trigger near the mark (e.g., 99% counts as 100%)
                if (!this.scrollMarks[mark] && scrollPercent >= (mark - 1)) {
                    this.scrollMarks[mark] = true;
                    this.pm.track('scroll_depth', { percent_scrolled: mark });
                }
            });
            
            this.scrollThrottle = false;
        }, 200);
    }

    _startTimeTracker() {
        const startTime = Date.now();
        
        const interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            
            // Check for engaged session (10s + interaction)
            if (!this.engagedSessionSet && elapsedSeconds >= 10 && this.interactionOccurred) {
                this.engagedSessionSet = true;
                // Just update the internal SDK state, GA4 handles this automatically if logic aligns,
                // but we also fire a specific event for sGTM routing.
                this.pm.track('engaged_session', {});
            }
            
            // Fire milestone events
            [10, 30, 60, 180].forEach(mark => {
                if (!this.timeMarks[mark] && elapsedSeconds >= mark) {
                    this.timeMarks[mark] = true;
                    this.pm.track('time_on_page', { seconds: mark });
                    
                    if (mark === 180) {
                        clearInterval(interval); // Stop interval after last mark
                    }
                }
            });
        }, 1000);
    }

    _handleDownloadClick(e) {
        // Find closest anchor tag
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target || target.tagName === 'BODY') return;
        }
        
        if (!target || !target.href) return;
        
        const extMatch = target.href.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
        const extensions = ['pdf', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'exe', 'dmg', 'mp4', 'mp3'];
        
        if (extMatch && extensions.includes(extMatch[1].toLowerCase())) {
            this.pm.track('file_download', {
                file_url: target.href,
                file_extension: extMatch[1].toLowerCase(),
                link_text: target.innerText || target.textContent || '',
            });
        }
    }
}


// ── custom-events.js ──
/**
 * PixelMaster JS SDK — Custom Events automation
 * Binds delegated click listeners based on CSS selectors.
 */

class CustomEvents {
    constructor(pixelmaster) {
        this.pm = pixelmaster;
        this.eventsConfig = [];
        this.isListening = false;
    }

    /**
     * Start listening for configured DOM element clicks.
     * @param {Array} events - Array of { selector: '.btn', eventName: 'custom_click', params: {} }
     */
    init(events = []) {
        if (!Array.isArray(events) || events.length === 0) return;
        
        this.eventsConfig = events;
        
        if (!this.isListening) {
            document.addEventListener('click', this._handleClick.bind(this));
            this.isListening = true;
        }
    }

    _handleClick(e) {
        // Check if the clicked target or any of its parents match our configured selectors
        for (const config of this.eventsConfig) {
            let target = e.target;
            while (target && target !== document.body) {
                if (target.matches && target.matches(config.selector)) {
                    // Match found!
                    this.pm.track(config.eventName, {
                        ...config.params,
                        element_text: target.innerText || target.textContent || '',
                        element_id: target.id || '',
                        element_classes: target.className || ''
                    });
                    
                    // Don't fire multiple configured events for the same exact click bubble
                    // unless we want to, but breaking is safer for deduplication.
                    break;
                }
                target = target.parentNode;
            }
        }
    }
}


// ── ab-testing.js ──
/**
 * PixelMaster JS SDK — A/B Testing
 * Handles deterministic variant assignment and data injection.
 */


class ABTesting {
    constructor(pixelmaster) {
        this.pm = pixelmaster;
        this.activeTests = [];
        this.assignedVariants = {};
    }

    /**
     * @param {Array} tests - Array of { id: 'test_123', name: 'Header Test', variants: ['A', 'B'] }
     */
    init(tests = []) {
        if (!Array.isArray(tests) || tests.length === 0) return;
        this.activeTests = tests;
        this._assignVariants();
    }

    /**
     * Retrieves assigned variants for all active tests.
     */
    getVariants() {
        return { ...this.assignedVariants };
    }

    _assignVariants() {
        // Read existing assignments from cookie
        const cookieValue = getCookie('_pm_ab');
        let storedAssignments = {};
        
        if (cookieValue) {
            try {
                storedAssignments = JSON.parse(atob(cookieValue));
            } catch (e) {
                storedAssignments = {};
            }
        }

        let cookieNeedsUpdate = false;

        this.activeTests.forEach(test => {
            if (storedAssignments[test.id]) {
                // User already has a variant for this test
                this.assignedVariants[test.id] = storedAssignments[test.id];
            } else {
                // Assign a random variant
                if (test.variants && test.variants.length > 0) {
                    const randomIndex = Math.floor(Math.random() * test.variants.length);
                    const selectedVariant = test.variants[randomIndex];
                    this.assignedVariants[test.id] = {
                        name: test.name,
                        variant: selectedVariant
                    };
                    storedAssignments[test.id] = this.assignedVariants[test.id];
                    cookieNeedsUpdate = true;
                }
            }
            
            // Push to dataLayer for immediate rendering decisions or reporting
            if (this.assignedVariants[test.id]) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'ab_test_view',
                    experiment_id: test.id,
                    experiment_name: test.name,
                    variant: this.assignedVariants[test.id].variant
                });
            }
        });

        // Save updated assignments back to persistent cookie (400 days)
        if (cookieNeedsUpdate) {
            // Encode as base64 to avoid cookie character issues
            setCookie('_pm_ab', btoa(JSON.stringify(storedAssignments)), 400);
        }
    }
}


// ── consent.js ──
/**
 * PixelMaster JS SDK — Consent Mode v2
 * Google Consent Mode v2 integration with granular consent types.
 */

const CONSENT_STORAGE_KEY = '_pm_consent';

// Default denied state (GDPR-safe)
const DEFAULT_CONSENT = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
};

/**
 * ConsentManager — Manages Google Consent Mode v2 state.
 */
class ConsentManager {
    constructor(pixelmaster) {
        this.pm = pixelmaster;
        this.state = { ...DEFAULT_CONSENT };
        this._loadSavedConsent();
    }

    /**
     * Set default consent state (called before any tracking).
     * @param {Object} defaults - Consent defaults to merge
     */
    setDefaults(defaults = {}) {
        this.state = { ...DEFAULT_CONSENT, ...defaults };
        this._pushToDataLayer('consent', 'default', this.state);
    }

    /**
     * Update consent state (after user interaction with banner).
     * @param {Object} updates - Consent updates { analytics_storage: 'granted', ... }
     */
    update(updates = {}) {
        this.state = { ...this.state, ...updates };
        this._pushToDataLayer('consent', 'update', this.state);
        this._saveConsent();

        // Notify server about consent change
        if (this.pm.config.transportUrl) {
            this.pm._sendToServer('/consent', {
                visitor_id: this.pm.clientId,
                consent: this.state,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Grant all consent types.
     */
    grantAll() {
        this.update({
            analytics_storage: 'granted',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            personalization_storage: 'granted',
        });
    }

    /**
     * Deny all non-essential consent types.
     */
    denyAll() {
        this.update({
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            personalization_storage: 'denied',
        });
    }

    /**
     * Grant only analytics (no ads).
     */
    grantAnalyticsOnly() {
        this.update({
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
        });
    }

    /**
     * Check if a specific consent type is granted.
     */
    isGranted(type) {
        return this.state[type] === 'granted';
    }

    /**
     * Get current consent state.
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Check if user has made any consent choice.
     */
    hasConsented() {
        try {
            return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
        } catch {
            return false;
        }
    }

    // ── Private helpers ──

    _pushToDataLayer(command, action, params) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(command, action, params);

        // Also call gtag if available
        if (typeof window.gtag === 'function') {
            window.gtag(command, action, params);
        }
    }

    _saveConsent() {
        try {
            localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.state));
        } catch {
            // Storage not available
        }
    }

    _loadSavedConsent() {
        try {
            const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (saved) {
                this.state = { ...DEFAULT_CONSENT, ...JSON.parse(saved) };
            }
        } catch {
            // Storage not available
        }
    }
}


// ── ecommerce.js ──
/**
 * PixelMaster JS SDK — E-Commerce Event Helpers
 * GA4-compatible e-commerce events with automatic data layer population.
 */

/**
 * EcommerceTracker — Handles all e-commerce tracking events.
 * Follows GA4 e-commerce event specification.
 */
class EcommerceTracker {
    constructor(pixelmaster) {
        this.pm = pixelmaster;
    }

    /**
     * Track product/item list view.
     * @param {string} listName - e.g. "Search Results", "Homepage"
     * @param {Array} items - Array of item objects
     */
    viewItemList(listName, items = []) {
        this.pm.track('view_item_list', {
            item_list_name: listName,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track single product/item view.
     * @param {Object} item - Item object { id, name, price, category, variant, brand }
     * @param {string} currency - Currency code (default: USD)
     */
    viewItem(item, currency = 'USD') {
        const normalized = this._normalizeItem(item);
        this.pm.track('view_item', {
            currency,
            value: normalized.price || 0,
            items: [normalized],
        });
    }

    /**
     * Track item click / select.
     * @param {Object} item - Item object
     * @param {string} listName - List the item was clicked from
     */
    selectItem(item, listName = '') {
        this.pm.track('select_item', {
            item_list_name: listName,
            items: [this._normalizeItem(item)],
        });
    }

    /**
     * Track add to cart.
     * @param {Object} item - Item object
     * @param {number} quantity - Quantity added
     * @param {string} currency - Currency code
     */
    addToCart(item, quantity = 1, currency = 'USD') {
        const normalized = this._normalizeItem(item);
        normalized.quantity = quantity;
        this.pm.track('add_to_cart', {
            currency,
            value: (normalized.price || 0) * quantity,
            items: [normalized],
        });
    }

    /**
     * Track remove from cart.
     */
    removeFromCart(item, quantity = 1, currency = 'USD') {
        const normalized = this._normalizeItem(item);
        normalized.quantity = quantity;
        this.pm.track('remove_from_cart', {
            currency,
            value: (normalized.price || 0) * quantity,
            items: [normalized],
        });
    }

    /**
     * Track cart view.
     * @param {Array} items - Cart items
     * @param {number} cartValue - Total cart value
     * @param {string} currency - Currency code
     */
    viewCart(items = [], cartValue = 0, currency = 'USD') {
        this.pm.track('view_cart', {
            currency,
            value: cartValue,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track checkout start.
     * @param {Array} items - Cart items
     * @param {number} value - Cart total
     * @param {string} currency - Currency code
     * @param {string} coupon - Coupon code if any
     */
    beginCheckout(items = [], value = 0, currency = 'USD', coupon = '') {
        this.pm.track('begin_checkout', {
            currency,
            value,
            coupon: coupon || undefined,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track shipping info submission.
     */
    addShippingInfo(items = [], value = 0, currency = 'USD', shippingTier = '') {
        this.pm.track('add_shipping_info', {
            currency,
            value,
            shipping_tier: shippingTier || undefined,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track payment info submission.
     */
    addPaymentInfo(items = [], value = 0, currency = 'USD', paymentType = '') {
        this.pm.track('add_payment_info', {
            currency,
            value,
            payment_type: paymentType || undefined,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track purchase (conversion event).
     * @param {Object} transaction - { id, value, tax, shipping, currency, coupon, items }
     */
    purchase(transaction = {}) {
        const { id, value, tax, shipping, currency = 'USD', coupon, items = [] } = transaction;

        this.pm.track('purchase', {
            transaction_id: id,
            value: value || 0,
            tax: tax || 0,
            shipping: shipping || 0,
            currency,
            coupon: coupon || undefined,
            items: items.map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track refund.
     */
    refund(transactionId, items = [], value = 0, currency = 'USD') {
        this.pm.track('refund', {
            transaction_id: transactionId,
            value,
            currency,
            items: items.length ? items.map((item, i) => this._normalizeItem(item, i)) : undefined,
        });
    }

    /**
     * Track promotion view.
     */
    viewPromotion(promotion = {}) {
        this.pm.track('view_promotion', {
            creative_name: promotion.creativeName,
            creative_slot: promotion.creativeSlot,
            promotion_id: promotion.id,
            promotion_name: promotion.name,
            items: (promotion.items || []).map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track promotion click.
     */
    selectPromotion(promotion = {}) {
        this.pm.track('select_promotion', {
            creative_name: promotion.creativeName,
            creative_slot: promotion.creativeSlot,
            promotion_id: promotion.id,
            promotion_name: promotion.name,
            items: (promotion.items || []).map((item, i) => this._normalizeItem(item, i)),
        });
    }

    /**
     * Track add to wishlist.
     */
    addToWishlist(item, currency = 'USD') {
        const normalized = this._normalizeItem(item);
        this.pm.track('add_to_wishlist', {
            currency,
            value: normalized.price || 0,
            items: [normalized],
        });
    }

    // ── Private: Normalize item to GA4 format ──

    _normalizeItem(item, index = 0) {
        return {
            item_id: item.id || item.item_id || item.sku || '',
            item_name: item.name || item.item_name || item.title || '',
            price: parseFloat(item.price || item.unit_price || 0),
            quantity: parseInt(item.quantity || 1, 10),
            item_brand: item.brand || item.item_brand || undefined,
            item_category: item.category || item.item_category || undefined,
            item_category2: item.category2 || item.item_category2 || undefined,
            item_variant: item.variant || item.item_variant || undefined,
            item_list_name: item.list_name || item.item_list_name || undefined,
            index: item.index ?? index,
            discount: item.discount ? parseFloat(item.discount) : undefined,
            coupon: item.coupon || undefined,
            affiliation: item.affiliation || undefined,
        };
    }
}


// ── pixelmaster.js ──
/**
 * PixelMaster JS SDK v1.0.0
 * 
 * Lightweight server-side tracking SDK (~3KB gzipped).
 * Works with PixelMaster sGTM platform.
 *
 * Usage:
 *   PixelMaster.init({
 *     transportUrl: 'https://track.yourdomain.com',
 *     measurementId: 'G-XXXXXXXXXX',
 *     containerId: 'GTM-XXXXXXX',
 *   });
 *
 *   PixelMaster.track('page_view');
 *   PixelMaster.ecommerce.purchase({ id: 'T-123', value: 99.99, items: [...] });
 *   PixelMaster.consent.grantAll();
 */

import {
    getOrCreateClientId,
    getOrCreateSessionId,
    generateEventId,
    getUtmParams,
    getClickIds,
    buildEventContext,
    sendBeacon,
    hashSHA256,
    formatPhoneE164,
    setCookie,
    getCookie,
} from './utils.js';





// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PixelMaster — Core SDK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PixelMasterSDK {
    constructor() {
        this.initialized = false;
        this.config = {};
        this.clientId = null;
        this.sessionId = null;
        this.userId = null;
        this.userTraits = {};
        this.queue = [];
        this.consent = null;
        this.ecommerce = null;
        this.engagement = null;
        this.customEvents = null;
        this.abTesting = null;
        this.debug = false;
        this._eventCount = 0;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  INIT — Initialize the SDK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Initialize PixelMaster tracking.
     *
     * @param {Object} config
     * @param {string} config.transportUrl    - sGTM tracking domain (e.g. https://track.yourdomain.com)
     * @param {string} config.measurementId   - GA4 Measurement ID (e.g. G-XXXXXXXXXX)
     * @param {string} [config.containerId]   - GTM Container ID (e.g. GTM-XXXXXXX)
     * @param {string} [config.apiKey]        - API key for server-side auth
     * @param {Object} [config.consent]       - Default consent state
     * @param {boolean} [config.autoPageView] - Auto-send page_view on init (default: true)
     * @param {boolean} [config.autoClickIds] - Auto-capture click IDs (default: true)
     * @param {boolean} [config.debug]        - Enable debug logging (default: false)
     * @param {string} [config.cookieDomain]  - Cookie domain override
     */
    init(config = {}) {
        if (this.initialized) {
            this._log('warn', 'PixelMaster already initialized');
            return this;
        }

        this.config = {
            transportUrl: '',
            measurementId: '',
            containerId: '',
            apiKey: '',
            autoPageView: true,
            autoClickIds: true,
            debug: false,
            cookieDomain: '',
            ...config,
        };

        this.debug = this.config.debug;

        // Generate client & session IDs
        this.clientId = getOrCreateClientId();
        this.sessionId = getOrCreateSessionId();

        // Initialize sub-modules
        this.consent = new ConsentManager(this);
        this.ecommerce = new EcommerceTracker(this);
        this.engagement = new EngagementTracker(this);
        this.customEvents = new CustomEvents(this);
        this.abTesting = new ABTesting(this);

        // Set consent defaults
        if (this.config.consent) {
            this.consent.setDefaults(this.config.consent);
        } else {
            this.consent.setDefaults();
        }

        // Initialize data layer
        window.dataLayer = window.dataLayer || [];

        // Start advanced trackers if configured
        if (this.config.engagement) {
            this.engagement.init(this.config.engagement);
        }
        if (this.config.customEvents) {
            this.customEvents.init(this.config.customEvents);
        }
        if (this.config.abTests) {
            this.abTesting.init(this.config.abTests);
        }

        // Capture click IDs
        if (this.config.autoClickIds) {
            this._captureClickIds();
        }

        // Inject gtag.js if transportUrl provided
        if (this.config.transportUrl && this.config.measurementId) {
            this._injectGtag();
        }

        this.initialized = true;
        this._log('info', 'PixelMaster initialized', this.config);

        // Flush queued events
        this._flushQueue();

        // Auto page_view
        if (this.config.autoPageView) {
            this.track('page_view');
        }

        return this;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  TRACK — Send a custom event
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Track a custom event.
     *
     * @param {string} eventName - Event name (e.g. 'purchase', 'sign_up', 'custom_event')
     * @param {Object} [params]  - Event parameters
     */
    track(eventName, params = {}) {
        if (!this.initialized) {
            this.queue.push({ eventName, params });
            return this;
        }

        const eventId = generateEventId();
        const context = buildEventContext();
        const utms = getUtmParams();

        // Append A/B test assigned variants
        const abData = {};
        if (this.abTesting) {
            const variants = this.abTesting.getVariants();
            Object.values(variants).forEach(v => {
                abData[`ab_` + v.name.replace(/\s+/g, '_').toLowerCase()] = v.variant;
            });
        }

        const event = {
            name: eventName,
            params: {
                ...params,
                ...context,
                ...utms,
                ...abData,
                event_id: eventId,
                client_id: this.clientId,
                session_id: this.sessionId,
                user_id: this.userId || undefined,
                engagement_time_msec: this._getEngagementTime(),
                _pm_sdk_version: '1.0.0',
            },
        };

        // Push to data layer
        window.dataLayer.push({
            event: eventName,
            ...event.params,
        });

        // Send via gtag if available
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, event.params);
        }

        // Send server-side via beacon
        if (this.config.transportUrl) {
            this._sendToServer('/mp/collect', {
                client_id: this.clientId,
                user_id: this.userId || undefined,
                events: [event],
            });
        }

        this._eventCount++;
        this._log('info', `Event: ${eventName}`, event.params);

        return this;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  IDENTIFY — Set user identity
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Identify the current user.
     *
     * @param {string} userId - User ID
     * @param {Object} [traits] - User traits (email, phone, name, etc.)
     */
    async identify(userId, traits = {}) {
        this.userId = userId;
        this.userTraits = traits;

        // Hash PII for enhanced conversions
        const hashedTraits = {};
        if (traits.email) {
            hashedTraits.sha256_email_address = await hashSHA256(traits.email);
        }
        if (traits.phone) {
            hashedTraits.sha256_phone_number = await hashSHA256(formatPhoneE164(traits.phone));
        }
        if (traits.firstName) hashedTraits.address = { ...(hashedTraits.address || {}), first_name: traits.firstName };
        if (traits.lastName) hashedTraits.address = { ...(hashedTraits.address || {}), last_name: traits.lastName };

        // Set user properties in gtag
        if (typeof window.gtag === 'function') {
            window.gtag('set', 'user_data', hashedTraits);
            window.gtag('set', 'user_id', userId);
        }

        // Push to data layer
        window.dataLayer.push({
            event: 'user_identified',
            user_id: userId,
            user_data: hashedTraits,
        });

        this._log('info', 'User identified', { userId, traits: Object.keys(traits) });

        return this;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  HELPERS — Public utility methods
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get the current client ID.
     */
    getClientId() {
        return this.clientId;
    }

    /**
     * Get the current session ID.
     */
    getSessionId() {
        return this.sessionId;
    }

    /**
     * Get the total number of events sent.
     */
    getEventCount() {
        return this._eventCount;
    }

    /**
     * Reset the SDK (for SPA navigation, etc.).
     */
    reset() {
        this.userId = null;
        this.userTraits = {};
        this.sessionId = getOrCreateSessionId();
        this._log('info', 'PixelMaster reset');
        return this;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  INTERNAL — Private methods
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Send data to the sGTM server.
     */
    _sendToServer(path, data) {
        const url = this.config.transportUrl.replace(/\/$/, '') + path;

        const headers = {};
        if (this.config.apiKey) {
            headers['X-PM-Api-Key'] = this.config.apiKey;
        }

        sendBeacon(url, data);
    }

    /**
     * Inject gtag.js script into the page.
     */
    _injectGtag() {
        const { transportUrl, measurementId } = this.config;

        // Load gtag.js from our transport URL (first-party)
        const script = document.createElement('script');
        script.async = true;
        script.src = `${transportUrl}/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            transport_url: transportUrl,
            first_party_collection: true,
            send_page_view: false, // We handle page_view ourselves
        });

        this._log('info', 'gtag.js injected', { transportUrl, measurementId });
    }

    /**
     * Capture and store click IDs from URL parameters.
     */
    _captureClickIds() {
        const clickIds = getClickIds();
        if (Object.keys(clickIds).length > 0) {
            // Store in cookie for attribution
            setCookie('_pm_click_ids', JSON.stringify(clickIds), 90);
            this._log('info', 'Click IDs captured', clickIds);
        }
    }

    /**
     * Flush queued events (sent before init completed).
     */
    _flushQueue() {
        while (this.queue.length > 0) {
            const { eventName, params } = this.queue.shift();
            this.track(eventName, params);
        }
    }

    /**
     * Get engagement time in milliseconds.
     */
    _getEngagementTime() {
        if (typeof performance !== 'undefined' && performance.now) {
            return Math.round(performance.now());
        }
        return 100;
    }

    /**
     * Debug logger.
     */
    _log(level, message, data = null) {
        if (!this.debug) return;
        const prefix = `[PixelMaster]`;
        if (data) {
            console[level](`${prefix} ${message}`, data);
        } else {
            console[level](`${prefix} ${message}`);
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  GLOBAL SINGLETON — window.PixelMaster
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PixelMaster = new PixelMasterSDK();

// Make globally available
if (typeof window !== 'undefined') {
    window.PixelMaster = PixelMaster;
}

PixelMaster;


// ── Global Registration ──
if (typeof window !== 'undefined') {
    window.PixelMaster = PixelMaster;
}

})(window, document);
