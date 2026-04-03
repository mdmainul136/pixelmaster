/**
 * PixelMaster JS SDK — Engagement Tracker
 * Handles scroll depth, time on page, and file downloads.
 */

export class EngagementTracker {
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
