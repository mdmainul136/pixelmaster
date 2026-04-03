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
            // Localization
            $table->string('timezone', 50)->default('UTC')->after('store_status');
            $table->string('date_format', 20)->default('DD/MM/YYYY')->after('timezone');
            $table->enum('measurement_unit', ['metric', 'imperial'])->default('metric')->after('date_format');
            
            // Financial
            $table->unsignedTinyInteger('fiscal_year_start')->default(1)->after('measurement_unit'); // 1-12
            $table->string('invoice_prefix', 20)->nullable()->after('fiscal_year_start');
            
            // Logistics
            $table->decimal('shipping_origin_lat', 10, 8)->nullable()->after('invoice_prefix');
            $table->decimal('shipping_origin_lng', 11, 8)->nullable()->after('shipping_origin_lat');
            $table->string('default_courier', 50)->nullable()->after('shipping_origin_lng');
            
            // AI Automation
            $table->string('rfm_frequency', 20)->default('weekly')->after('default_courier'); // daily, weekly, monthly
            $table->string('sentiment_threshold', 20)->default('medium')->after('rfm_frequency'); // low, medium, high
            $table->unsignedInteger('stockout_buffer')->default(5)->after('sentiment_threshold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'timezone', 'date_format', 'measurement_unit',
                'fiscal_year_start', 'invoice_prefix',
                'shipping_origin_lat', 'shipping_origin_lng', 'default_courier',
                'rfm_frequency', 'sentiment_threshold', 'stockout_buffer'
            ]);
        });
    }
};
