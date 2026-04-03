# PixelMaster JS SDK

> Lightweight server-side tracking SDK for any website. Works with PixelMaster sGTM.

## Quick Start

```html
<script src="https://cdn.pixelmaster.io/sdk/v1/pixelmaster.min.js"></script>
<script>
  PixelMaster.init({
    transportUrl: 'https://track.yourdomain.com',
    measurementId: 'G-XXXXXXXXXX',
  });
</script>
```

## NPM Install

```bash
npm install @pixelmaster/js-sdk
```

```javascript
import PixelMaster from '@pixelmaster/js-sdk';

PixelMaster.init({
  transportUrl: 'https://track.yourdomain.com',
  measurementId: 'G-XXXXXXXXXX',
  containerId: 'GTM-XXXXXXX',
  debug: true,
});
```

## API Reference

### `PixelMaster.init(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `transportUrl` | string | `''` | Your sGTM tracking domain |
| `measurementId` | string | `''` | GA4 Measurement ID |
| `containerId` | string | `''` | GTM Container ID |
| `apiKey` | string | `''` | API key for server auth |
| `autoPageView` | boolean | `true` | Auto-send page_view on init |
| `autoClickIds` | boolean | `true` | Auto-capture gclid/fbclid/etc |
| `debug` | boolean | `false` | Enable console logging |
| `consent` | object | `{}` | Default consent state |

### `PixelMaster.track(eventName, params)`

```javascript
PixelMaster.track('sign_up', { method: 'Google' });
PixelMaster.track('search', { search_term: 'shoes' });
PixelMaster.track('generate_lead', { value: 50, currency: 'USD' });
```

### `PixelMaster.identify(userId, traits)`

```javascript
await PixelMaster.identify('user_123', {
  email: 'john@example.com',
  phone: '+1234567890',
  firstName: 'John',
  lastName: 'Doe',
});
```

PII is automatically hashed (SHA-256) for Enhanced Conversions.

### E-Commerce Events

```javascript
// View product
PixelMaster.ecommerce.viewItem({ id: 'SKU-001', name: 'Air Max', price: 129.99 });

// Add to cart
PixelMaster.ecommerce.addToCart({ id: 'SKU-001', name: 'Air Max', price: 129.99 }, 2);

// Begin checkout
PixelMaster.ecommerce.beginCheckout(cartItems, 259.98, 'USD');

// Purchase
PixelMaster.ecommerce.purchase({
  id: 'T-12345',
  value: 259.98,
  tax: 25.00,
  shipping: 5.99,
  currency: 'USD',
  items: [
    { id: 'SKU-001', name: 'Air Max', price: 129.99, quantity: 2 }
  ]
});
```

### Consent Mode v2

```javascript
// Grant all
PixelMaster.consent.grantAll();

// Analytics only
PixelMaster.consent.grantAnalyticsOnly();

// Custom
PixelMaster.consent.update({
  analytics_storage: 'granted',
  ad_storage: 'denied',
});

// Check state
PixelMaster.consent.isGranted('analytics_storage'); // true
PixelMaster.consent.hasConsented(); // true/false
```

## License

MIT
