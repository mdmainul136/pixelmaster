# PixelMaster sGTM — Shopify Integration

Server-side Google Tag Manager integration for Shopify stores.

## Features

- **Multi-platform tracking**: GA4 + Meta Pixel + TikTok Pixel
- **All e-commerce events**: view_item, add_to_cart, view_cart, begin_checkout, purchase
- **Geo-aware consent**: GDPR (opt-in), CCPA (opt-out), auto-grant for others
- **Consent Mode v2**: Google Consent Mode v2 with wait_for_update
- **AJAX Cart intercept**: Captures Shopify AJAX /cart/add calls via fetch override
- **Server-side purchase**: Via Shopify webhooks → Laravel → sGTM
- **Two install methods**: Theme App Extension (no code) or manual snippet

## Structure

```
shopify/
├── shopify.app.toml                    # Shopify app configuration
├── theme-extension/
│   ├── shopify.extension.toml          # Extension settings (7 fields)
│   ├── blocks/
│   │   ├── tracking.liquid             # Head block (GA4+Meta+TikTok+consent)
│   │   └── checkout.liquid             # Thank you page block (purchase events)
│   └── snippets/
│       ├── pixelmaster-tracking.liquid  # Manual snippet version of tracking
│       └── pixelmaster-checkout.liquid  # Manual snippet version of checkout
└── README.md
```

## Install Options

### Option 1: Theme App Extension (recommended)
1. Install the PixelMaster app from Shopify App Store
2. Go to Online Store → Themes → Customize
3. Add "PixelMaster Tracking" block to head
4. Add "PixelMaster Checkout" block to checkout
5. Enter Transport URL and pixel IDs
6. Save

### Option 2: Manual Snippet
1. Copy `snippets/pixelmaster-tracking.liquid` to your theme's `snippets/` folder
2. Copy `snippets/pixelmaster-checkout.liquid` to your theme's `snippets/` folder
3. Add `{% render 'pixelmaster-tracking' %}` in `theme.liquid` `<head>`
4. Add `{% render 'pixelmaster-checkout' %}` in thank-you template
5. Set metafields via Shopify API or app

## Configuration

### Via Theme Editor (blocks)
| Setting | Description |
|---|---|
| Transport URL | Your sGTM domain (https://...) |
| GA4 Measurement ID | G-XXXXXXXXXX |
| GTM Container ID | GTM-XXXXXXX |
| Meta Pixel ID | 123456789012345 |
| TikTok Pixel ID | CXXXXXXXXXXXXXXXXX |
| Enable Consent Mode v2 | Default: true |
| Show consent banner | Default: true |

### Via Metafields (snippets)
Set via Shopify Admin API under `shop.metafields.pixelmaster`:
- `transport_url`
- `measurement_id`
- `container_id`
- `meta_pixel_id`
- `tiktok_pixel_id`

## Consent Banner Behavior

| Visitor Region | Behavior |
|---|---|
| EU/UK/BR/CA/ZA/TH/JP/KR/CN | Opt-in banner — tracking denied until Accept |
| US (California) | Opt-out — tracking granted, "Do Not Sell" link |
| Others | No banner — tracking auto-granted |

## Server-Side Events

Shopify order webhooks are handled by the Laravel backend at:
```
POST /api/tracking/shopify/webhooks
```
Events processed: `orders/create`, `orders/paid`, `refunds/create`
