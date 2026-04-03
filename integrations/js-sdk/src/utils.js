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
export function generateClientId() {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 2147483647);
    return `${timestamp}.${random}`;
}

/**
 * Generate a unique session ID.
 */
export function generateSessionId() {
    return Math.floor(Date.now() / 1000).toString();
}

/**
 * Generate a unique event ID for deduplication.
 */
export function generateEventId() {
    return 'pm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Set a cookie with configurable expiry.
 */
export function setCookie(name, value, days = PM_COOKIE_DAYS) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax;Secure`;
}

/**
 * Get a cookie value by name.
 */
export function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Delete a cookie.
 */
export function deleteCookie(name) {
    setCookie(name, '', -1);
}

/**
 * Get or create a persistent client ID (first-party cookie).
 */
export function getOrCreateClientId() {
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
export function getOrCreateSessionId() {
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
export function getUtmParams() {
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
export function getClickIds() {
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
export async function hashSHA256(value) {
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
export function formatPhoneE164(phone, countryCode = '1') {
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
export function buildEventContext() {
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
export function sendBeacon(url, data) {
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
