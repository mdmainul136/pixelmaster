<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('business_category')->nullable()->after('business_type');
            $table->index('business_category');
        });

        // Data migration: move current industry-like values from business_type to business_category
        // Note: business_type is currently an enum in some migrations, but we'll treat it cautiously.
        \DB::table('tenants')->get()->each(function ($tenant) {
            $industries = [
                'ecommerce', 'retail', 'wholesale', 'fashion', 'grocery', 'electronics', 
                'dropshipping', 'handmade', 'restaurant', 'cafe', 'bakery', 'catering', 
                'hotel', 'salon', 'healthcare', 'dental', 'pharmacy', 'freelancer', 
                'consulting', 'agency', 'legal', 'education', 'coaching', 'online_courses', 
                'fitness', 'yoga', 'real_estate', 'property_management', 'manufacturing', 
                'construction', 'automotive', 'logistics', 'travel', 'events', 'cross-border-ior'
            ];

            if (in_array($tenant->business_type, $industries)) {
                \DB::table('tenants')->where('id', $tenant->id)->update([
                    'business_category' => $tenant->business_type,
                    'business_type' => 'llc' // Fallback to a safe default legal type
                ]);
            } else {
                // If it's already a legal type, set a default category
                \DB::table('tenants')->where('id', $tenant->id)->update([
                    'business_category' => 'business-website' 
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('business_category');
        });
    }
};
