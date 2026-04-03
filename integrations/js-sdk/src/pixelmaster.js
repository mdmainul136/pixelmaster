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
import { ConsentManager } from './consent.js';
import { EcommerceTracker } from './ecommerce.js';
import { EngagementTracker } from './engagement.js';
import { CustomEvents } from './custom-events.js';
import { ABTesting } from './ab-testing.js';

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

export default PixelMaster;
