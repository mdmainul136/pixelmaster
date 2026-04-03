/**
 * PixelMaster JS SDK — Custom Events automation
 * Binds delegated click listeners based on CSS selectors.
 */

export class CustomEvents {
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
