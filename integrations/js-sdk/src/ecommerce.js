/**
 * PixelMaster JS SDK — E-Commerce Event Helpers
 * GA4-compatible e-commerce events with automatic data layer population.
 */

/**
 * EcommerceTracker — Handles all e-commerce tracking events.
 * Follows GA4 e-commerce event specification.
 */
export class EcommerceTracker {
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
