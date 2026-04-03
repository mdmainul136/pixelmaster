<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dropping all legacy module tables from the TENANT database.
     * This fully transforms the platform into an sGTM-exclusive infrastructure.
     * 
     * We preserve 'catalog_products' as it's required for POAS and product tracking,
     * but we clean it up from any legacy 'ec_product_id' dependencies.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Drop Ecommerce Module Tables
        Schema::dropIfExists('ec_reviews');
        Schema::dropIfExists('ec_coupons');
        Schema::dropIfExists('ec_carts');
        Schema::dropIfExists('ec_order_items');
        Schema::dropIfExists('ec_orders');
        Schema::dropIfExists('ec_product_variants');
        Schema::dropIfExists('ec_product_images');
        Schema::dropIfExists('ec_categories');
        Schema::dropIfExists('ec_customers');
        Schema::dropIfExists('ec_suppliers');
        Schema::dropIfExists('ec_purchase_order_items');
        Schema::dropIfExists('ec_purchase_orders');
        Schema::dropIfExists('ec_returns');
        Schema::dropIfExists('ec_return_items');
        Schema::dropIfExists('ec_tax_configs');
        Schema::dropIfExists('ec_currencies');
        Schema::dropIfExists('ec_attribute_values');
        Schema::dropIfExists('ec_attributes');
        Schema::dropIfExists('ec_products');

        // 2. Drop POS Module Tables
        Schema::dropIfExists('pos_held_sales');
        Schema::dropIfExists('pos_payments');
        Schema::dropIfExists('pos_shift_logs');
        Schema::dropIfExists('pos_sessions');
        Schema::dropIfExists('pos_sale_items');
        Schema::dropIfExists('pos_sales');
        Schema::dropIfExists('pos_products');

        // 3. Drop CRM Module Tables
        Schema::dropIfExists('crm_activities');
        Schema::dropIfExists('crm_deals');
        Schema::dropIfExists('crm_contacts');
        Schema::dropIfExists('crm_interactions');

        // 4. Drop HRM Module Tables
        Schema::dropIfExists('ec_leave_requests');
        Schema::dropIfExists('ec_attendance');
        Schema::dropIfExists('ec_staff');
        Schema::dropIfExists('ec_departments');
        Schema::dropIfExists('payroll_payslips');
        Schema::dropIfExists('payroll_items');

        // 5. Drop Inventory Module Tables
        Schema::dropIfExists('inv_manufacturing_orders');
        Schema::dropIfExists('inv_sequences');
        Schema::dropIfExists('inv_stock_logs');
        Schema::dropIfExists('inv_products');
        Schema::dropIfExists('inv_suppliers');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('warehouses');

        // 6. Drop Cross-Border (IOR) Module Tables (Except catalog_products)
        Schema::dropIfExists('ior_scrape_tasks');
        Schema::dropIfExists('ior_scraper_logs');
        Schema::dropIfExists('ior_scraping_quotas');
        Schema::dropIfExists('ior_scraper_settings');
        Schema::dropIfExists('ior_price_anomalies');
        Schema::dropIfExists('ior_order_milestones');
        Schema::dropIfExists('ior_shipment_batches');
        Schema::dropIfExists('ior_tenant_webhooks');
        Schema::dropIfExists('ior_competitor_sources');
        Schema::dropIfExists('ior_price_history');
        Schema::dropIfExists('ior_product_sources');
        Schema::dropIfExists('ior_billing_alerts');
        Schema::dropIfExists('ior_hs_lookup_logs');
        Schema::dropIfExists('ior_wallet_transactions');
        Schema::dropIfExists('ior_wallets');
        Schema::dropIfExists('ior_logs');
        Schema::dropIfExists('ior_exchange_rate_logs');
        Schema::dropIfExists('ior_carts');
        Schema::dropIfExists('ior_cart_items');
        Schema::dropIfExists('ior_foreign_orders');
        Schema::dropIfExists('ior_settings');
        Schema::dropIfExists('ior_hs_codes');

        // 7. Drop Other Legacy Tables
        Schema::dropIfExists('re_property_viewings');
        Schema::dropIfExists('re_agents');
        Schema::dropIfExists('re_agencies');
        Schema::dropIfExists('re_property_leads');
        Schema::dropIfExists('re_properties');
        Schema::dropIfExists('tenant_whatsapp_configs');
        Schema::dropIfExists('whatsapp_templates');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_automations');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('seo_audits');
        Schema::dropIfExists('seo_keywords');
        Schema::dropIfExists('tenant_seo_meta');
        Schema::dropIfExists('tenant_seo_redirects');

        // 8. Final Polish for catalog_products
        if (Schema::hasTable('catalog_products')) {
            Schema::table('catalog_products', function (Blueprint $table) {
                if (Schema::hasColumn('catalog_products', 'ec_product_id')) {
                    $table->dropColumn('ec_product_id');
                }
                // Ensure common tracking fields exist if they were missed
                if (!Schema::hasColumn('catalog_products', 'cost')) {
                    $table->decimal('cost', 12, 2)->default(0)->after('price');
                }
                if (!Schema::hasColumn('catalog_products', 'stock_quantity')) {
                    $table->integer('stock_quantity')->default(0)->after('cost');
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
