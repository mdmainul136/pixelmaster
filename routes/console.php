<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Modules\Tracking\Commands\SgtmCheckQuotasCommand;
use App\Modules\Tracking\Jobs\CheckUsageQuotasJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Scheduled Tasks ────────────────────────────────────────────────────────

// Automated daily backup for all active tenant databases
Schedule::command('tenants:backup')->dailyAt('02:00');

// Process abandoned carts for WhatsApp Recovery (every 5 mins)
Schedule::command('ecommerce:process-abandoned-carts')->everyFiveMinutes();

// Collect database usage stats for all tenants every hour
Schedule::command('tenant:collect-db-stats')->hourly();

// Daily billing enforcement check (overdue invoices → billing_failed)
Schedule::call(function () {
    app(\App\Services\BillingEnforcementService::class)->enforceForAll();
})->dailyAt('00:00');

// Subscription lifecycle automation: trials → expired, active → past_due (runs at 00:05)
Schedule::command('subscriptions:check')->dailyAt('00:05');

// Process auto-renewals (runs at 01:00 — charges cards for expiring subscriptions)
Schedule::command('subscriptions:renew')->dailyAt('01:00');

// Send expiry warning + renewal-failed notification emails (runs at 08:00)
Schedule::command('subscriptions:notify-expiry')->dailyAt('08:00');

// Inventory Expiry Check (runs at 07:30 AM daily)
Schedule::command('inventory:check-expiry')->dailyAt('07:30');

// IOR: Refresh USD→BDT exchange rate daily at 02:00 AM
// Keeps BDT pricing accurate for new quotes and order calculations
Schedule::command('ior:update-exchange-rate')->dailyAt('02:00');

// IOR: Bulk recalculate pending order prices after exchange rate refresh (02:30 AM)
Schedule::command('ior:recalculate-prices')->dailyAt('02:30');

// IOR: Sync foreign product prices from source marketplaces (03:00 AM)
Schedule::command('ior:sync-products')->dailyAt('03:00');

// IOR: Sync shipment tracking status hourly
// Polling courier APIs (FedEx, DHL, Pathao, etc.) for updates
Schedule::command('ior:sync-tracking')->hourly();

// sGTM: Monitor container health every 5 minutes
// Auto-heals crashed or stopped containers
Schedule::command('sgtm:monitor')->everyFiveMinutes();

// sGTM: Automated billing quota enforcement (threshold: 110%)
Schedule::command('sgtm:check-quotas')->twiceDaily(3, 15);

// sGTM: Custom Product Logs Retention Cleanup
Schedule::command('tracking:cleanup-logs')->dailyAt('04:00');

// ── Tracking Module: Infrastructure Commands ─────────────────────────────

// Process DLQ retry queue every minute (picks up events past their backoff window)
Schedule::command('tracking:process-retry-queue --batch=50')->everyMinute();

// sGTM: Sync high-scale usage counts from ClickHouse to MySQL for billing
Schedule::job(new \App\Modules\Tracking\Jobs\SyncClickHouseUsageJob)->hourly();

// sGTM: Periodically verify DNS for pending custom tracking domains
Schedule::job(new \App\Modules\Tracking\Jobs\VerifyTrackingDomainJob)->everyFifteenMinutes();

// Generate channel health report every 15 minutes (alerts for degraded channels)
Schedule::command('tracking:health-report --alert-only')->everyFifteenMinutes();

// Expire old DLQ entries daily at 02:30 AM (marks entries > 7 days as expired)
Schedule::command('tracking:expire-dlq --days=7 --purge')->dailyAt('02:30');

// Purge expired consent records daily at 03:30 AM (GDPR compliance)
Schedule::command('tracking:purge-consent')->dailyAt('03:30');

// Daily billing quota alert check — fires email/in-app at 80% and 100% quota
// Runs at 08:30 AM (after subscriptions:notify-expiry at 08:00)
Schedule::command('tracking:check-billing-alerts')->dailyAt('08:30');

// Monthly reset of billing alert Redis flags — runs at midnight on the 1st
// Clears 80% / 100% alert locks so tenants receive fresh alerts next cycle
Schedule::command('tracking:check-billing-alerts --reset')->monthlyOn(1, '00:05');

// GA4 deferred queue drain — runs every minute
// Sends events that were buffered due to GA4's 10 events/sec rate limit
Schedule::command('tracking:drain-ga4-queue --limit=200')->everyMinute();

// TikTok deferred queue drain — runs every minute
// TikTok rate limit is per-minute (900 req/min), so drain frequently
Schedule::command('tracking:drain-tiktok-queue --limit=250')->everyMinute();

// Meta CAPI deferred queue drain — runs every 5 minutes
// Meta rate limit is per-hour (180 req/hr), no need to drain every minute
Schedule::command('tracking:drain-meta-queue --limit=500')->everyFiveMinutes();

// Snapchat CAPI deferred queue drain — runs every minute (2000 req/min limit)
Schedule::command('tracking:drain-snap-queue --limit=500')->everyMinute();

// Pinterest Conversions API deferred queue drain — runs every minute (120 req/min)
Schedule::command('tracking:drain-pinterest-queue --limit=100')->everyMinute();

// LinkedIn Conversions API deferred queue drain — runs every minute (500 req/min)
Schedule::command('tracking:drain-linkedin-queue --limit=200')->everyMinute();

// Google Ads Conversion upload drain — runs hourly (5000 req/day quota)
Schedule::command('tracking:drain-gads-queue --limit=200')->hourly();

// Twitter/X Conversions API deferred queue drain — runs every minute
Schedule::command('tracking:drain-twitter-queue --limit=200')->everyMinute();

// Generic Webhook deferred queue drain — runs every minute
Schedule::command('tracking:drain-webhook-queue --limit=500')->everyMinute();

// ── Phase 2: Docker Node Monitor & Auto-Scaling (every 5 mins) ──────────
Schedule::command('tracking:monitor-nodes')->everyFiveMinutes();
Schedule::command('tracking:health')->everyFiveMinutes();

// ── Theme Engine: Vendor Payouts ──────────────────────────────────────────
// Process automated vendor payouts every Monday at 09:00 AM
Schedule::command('theme:payout-vendors')->weeklyOn(1, '09:00');

// ── Theme Engine: Analytics Daily Aggregation ─────────────────────────────
// Roll up yesterday's raw events into daily summaries (01:00 AM)
Schedule::call(function () {
    app(\App\Services\ThemeAnalyticsService::class)->aggregateYesterday();
})->dailyAt('01:00');

// ── Stripe Metered Billing: Overage Usage Reporting ───────────────────────
// Report event overage counts to Stripe for all Pro/Business tenants.
// Runs daily at 23:00 (end of day) to capture full-day usage snapshot.
Schedule::command('billing:report-stripe-usage')->dailyAt('23:00');
