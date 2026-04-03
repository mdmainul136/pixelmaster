<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Module Classification System:
     * - platform:    Always active for ALL tenants (security, notifications, pages, analytics, seo, app-marketplace)
     * - blueprint:   Auto-activated by business_category (ecommerce, crm, pos, finance, etc.)
     * - marketplace: Optional add-on from marketplace (loyalty, whatsapp, marketing, branches, etc.)
     * - regional:    Auto-activated by tenant country/region (zatca, maroof, sadad, national-address)
     * - usage_based: Available to all, metered by events (tracking)
     */
    public function up(): void
    {
        // 1. Add module_type to modules table
        Schema::connection('mysql')->table('modules', function (Blueprint $table) {
            if (!Schema::connection('mysql')->hasColumn('modules', 'module_type')) {
                $table->enum('module_type', ['platform', 'blueprint', 'marketplace', 'regional', 'usage_based'])
                      ->default('blueprint')
                      ->after('is_marketplace');
            }
        });

        // 2. Create tenant_usage_quotas for tracking event metering
        if (!Schema::connection('mysql')->hasTable('tenant_usage_quotas')) {
            Schema::connection('mysql')->create('tenant_usage_quotas', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id');
                $table->string('module_slug', 100);
                $table->integer('quota_limit')->default(10000);      // Events per billing period
                $table->integer('used_count')->default(0);           // Current period usage
                $table->decimal('overage_rate', 10, 2)->default(0);  // Price per 10K overage events
                $table->date('billing_period_start');
                $table->date('billing_period_end');
                $table->timestamps();

                $table->unique(['tenant_id', 'module_slug', 'billing_period_start'], 'uq_tenant_module_period');
                $table->index('tenant_id');
                $table->index('module_slug');
            });
        }

        // 3. Classify all 40 modules
        $classifications = [
            // Platform Core (always active, free)
            'security'          => 'platform',
            'notifications'     => 'platform',
            'pages'             => 'platform',
            'analytics'         => 'platform',
            'seo-manager'       => 'platform',
            'app-marketplace'   => 'platform',

            // Blueprint (business_category based)
            'ecommerce'         => 'blueprint',
            'pos'               => 'blueprint',
            'crm'               => 'blueprint',
            'inventory'         => 'blueprint',
            'finance'           => 'blueprint',
            'hrm'               => 'blueprint',
            'manufacturing'     => 'blueprint',
            'expenses'          => 'blueprint',
            'cross-border-ior'  => 'blueprint',

            // Vertical Blueprints (industry-specific)
            'automotive'        => 'blueprint',
            'healthcare'        => 'blueprint',
            'education'         => 'blueprint',
            'lms'               => 'blueprint',
            'fitness'           => 'blueprint',
            'restaurant'        => 'blueprint',
            'salon'             => 'blueprint',
            'realestate'        => 'blueprint',
            'landlord'          => 'blueprint',
            'travel'            => 'blueprint',
            'freelancer'        => 'blueprint',
            'events'            => 'blueprint',

            // Marketplace (optional add-ons)
            'loyalty'           => 'marketplace',
            'whatsapp'          => 'marketplace',
            'marketing'         => 'marketplace',
            'branches'          => 'marketplace',
            'flash-sales'       => 'marketplace',
            'marketplace'       => 'marketplace',
            'reviews'           => 'marketplace',
            'contracts'         => 'marketplace',

            // Regional (country-based compliance)
            'zatca'             => 'regional',
            'maroof'            => 'regional',
            'national-address'  => 'regional',
            'sadad'             => 'regional',

            // Usage-based (metered)
            'tracking'          => 'usage_based',
        ];

        foreach ($classifications as $slug => $type) {
            DB::connection('mysql')->table('modules')
                ->where('slug', $slug)
                ->update(['module_type' => $type]);
        }

        // 4. Fix is_core and prices for platform modules
        DB::connection('mysql')->table('modules')
            ->where('module_type', 'platform')
            ->update(['is_core' => true, 'is_marketplace' => false, 'price' => 0]);

        // 5. Fix notifications price (was $19, should be free as platform core)
        DB::connection('mysql')->table('modules')
            ->where('slug', 'notifications')
            ->update(['price' => 0]);

        // 6. Ensure marketplace modules have is_marketplace=true
        DB::connection('mysql')->table('modules')
            ->where('module_type', 'marketplace')
            ->update(['is_marketplace' => true, 'is_core' => false]);

        // 7. Ensure blueprint modules have correct flags
        DB::connection('mysql')->table('modules')
            ->where('module_type', 'blueprint')
            ->update(['is_marketplace' => false]);

        // 8. Usage-based modules: active for all, not core, not marketplace
        DB::connection('mysql')->table('modules')
            ->where('module_type', 'usage_based')
            ->update(['is_core' => false, 'is_marketplace' => false, 'price' => 0]);
    }

    public function down(): void
    {
        Schema::connection('mysql')->table('modules', function (Blueprint $table) {
            $table->dropColumn('module_type');
        });
        Schema::connection('mysql')->dropIfExists('tenant_usage_quotas');
    }
};
