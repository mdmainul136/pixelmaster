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
        if (Schema::hasTable('ior_hs_codes')) {
            Schema::table('ior_hs_codes', function (Blueprint $table) {
                // Gap Fix: Specific Duty Support (weight/piece based)
                $table->decimal('specific_duty', 15, 2)->default(0)->after('at');
                $table->string('specific_duty_unit', 20)->nullable()->after('specific_duty'); // piece, kg, etc.
                
                // Gap Fix: Minimum Assessable Value
                $table->decimal('min_assessable_value', 15, 2)->default(0)->after('specific_duty_unit');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('ior_hs_codes')) {
            Schema::table('ior_hs_codes', function (Blueprint $table) {
                $table->dropColumn(['specific_duty', 'specific_duty_unit', 'min_assessable_value']);
            });
        }
    }
};
