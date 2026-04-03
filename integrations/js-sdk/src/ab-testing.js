/**
 * PixelMaster JS SDK — A/B Testing
 * Handles deterministic variant assignment and data injection.
 */

import { getCookie, setCookie } from './utils.js';

export class ABTesting {
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
