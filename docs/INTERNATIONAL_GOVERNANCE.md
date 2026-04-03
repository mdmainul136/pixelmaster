# International Business Governance & Module Standards

This document defines the global standards for how all modules (Ecommerce, Inventory, POS, CRM, Finance, Logistics, etc.) must utilize the centralized Tenant Settings for International Business operations.

## 1. Centralized Identity (Single Source of Truth)
All core business metadata is stored in the central `tenants` table. Modules must **never** create separate columns for these in their local tenant databases. 

| Setting | Laravel Config Key | Usage in Modules |
|---------|-------------------|------------------|
| Timezone | `app.timezone` | All timestamps, scheduled tasks, and CRM contact times. |
| Date Format | `app.date_format` | All UI displays, PDF invoices, and reports. |
| Measurement Unit | `app.measurement_unit` | Weight/Dimensions in Inventory, Logistics, and Shipping. |
| Currency Code | `app.currency.code` | Pricing, multicurrency checkout, and financial ledgers. |
| Invoice Prefix | `app.invoice_prefix` | Unique numbering for Invoices, Receipts, and Orders. |
| Fiscal Year Start | `app.fiscal_year_start` | Financial reports, Profit/Loss, and Tax cycles. |

## 2. Module Connections & Logic
### Ecommerce, Inventory & POS
- **Logistics Integration**: Use `shipping_origin_lat/lng` from settings to calculate real-time distance-based shipping rates via the Logistics module.
- **Stock Governance**: Respect the `stockout_buffer` setting. AI should trigger "Low Stock" alerts in the Command Center when inventory hits this buffer.

### CRM & Marketing
- **AI Analytics**: The `rfm_frequency` (Recency, Frequency, Monetary) setting controls how often the AI engine re-scores customers.
- **Sentiment-Driven CRM**: All customer reviews and support tickets must be analyzed against the `sentiment_threshold`. If a customer's sentiment score falls below this (e.g., 'Medium' sensitivity), it must auto-trigger a CRM Follow-up task.

### Finance & Logistics
- **Taxation**: Use `tax_regions` JSON field for dynamic tax calculation at checkout.
- **Logistics**: The `default_courier` setting must be the primary choice in the fulfillment dropdown but allow overrides based on the `available_countries` whitelist.

## 3. Global Synchronization
Platform-wide synchronization is handled by the `TenantConfig` feature in `config/tenancy.php`. This maps central metadata directly into the system configuration at runtime.

---
*Standardized on: 2026-03-02*
*Scope: All 40+ Modules (Blueprint & Marketplace)*
