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
export class ConsentManager {
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
