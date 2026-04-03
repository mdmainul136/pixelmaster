<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dropping all legacy tables from the MASTER (LANDLORD) database.
     * This fully transforms the platform into an sGTM-exclusive infrastructure.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Marketplace & Subscription Tables
        Schema::dropIfExists('theme_subscriptions');
        Schema::dropIfExists('vendor_payouts');
        Schema::dropIfExists('paddle_transactions');
        Schema::dropIfExists('marketplace_theme_category');
        Schema::dropIfExists('theme_categories');
        Schema::dropIfExists('theme_support_replies');
        Schema::dropIfExists('theme_support_tickets');
        Schema::dropIfExists('theme_reviews');
        Schema::dropIfExists('theme_purchases');
        Schema::dropIfExists('marketplace_themes');
        Schema::dropIfExists('theme_vendors');

        // 2. IOR Landlord Tables
        Schema::dropIfExists('landlord_ior_hs_codes');
        Schema::dropIfExists('landlord_ior_governance_rules');
        Schema::dropIfExists('landlord_ior_proxies');
        Schema::dropIfExists('landlord_ior_couriers');
        Schema::dropIfExists('landlord_ior_api_configs');

        // 3. Legacy Middle East Payment Tables
        Schema::dropIfExists('bnpl_transactions');
        Schema::dropIfExists('cod_risk_profiles');
        Schema::dropIfExists('cod_orders');

        // 4. WhatsApp Automation & Analytics, AB Testing
        Schema::dropIfExists('whatsapp_automation_configs');
        Schema::dropIfExists('theme_analytics_views');
        Schema::dropIfExists('theme_analytics_events');
        Schema::dropIfExists('ab_events');
        Schema::dropIfExists('ab_variants');
        Schema::dropIfExists('ab_experiments');

        // 5. Cleanup Master Tables Columns
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                if (Schema::hasColumn('payments', 'gateway_driver')) {
                    $table->dropColumn([
                        'gateway_driver', 'country', 'gateway_transaction_id',
                        'vat_amount', 'vat_rate', 'refunded_amount', 'refund_method', 'refunded_at'
                    ]);
                }
            });
        }

        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                if (Schema::hasColumn('invoices', 'country')) {
                    $table->dropColumn(['country', 'vat_rate', 'vat_amount', 'trn_number', 'zatca_qr']);
                }
            });
        }

        if (Schema::hasTable('tenant_modules')) {
            Schema::table('tenant_modules', function (Blueprint $table) {
                if (Schema::hasColumn('tenant_modules', 'grace_period_ends_at')) {
                    $table->dropColumn([
                        'grace_period_ends_at', 'soft_suspended_at', 'suspended_at',
                        'day3_reminder_sent_at', 'data_notice_sent_at'
                    ]);
                }
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // No rollback — intentional destructive cleanup.
    }
};
