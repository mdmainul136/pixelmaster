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
        Schema::table('super_admins', function (Blueprint $table) {
            // Organization Settings
            $table->string('company_name')->nullable()->after('name');
            $table->string('company_logo')->nullable()->after('company_name');
            $table->string('favicon')->nullable()->after('company_logo');
            
            // Profile Settings
            $table->string('phone')->nullable()->after('email');
            $table->string('profile_image')->nullable()->after('phone');
            
            // Locale & Format Settings
            $table->string('timezone')->default('UTC')->after('security_settings');
            $table->string('locale')->default('en')->after('timezone');
            $table->string('date_format')->default('Y-m-d')->after('locale');
            $table->string('time_format')->default('H:i:s')->after('date_format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'company_logo', 'favicon',
                'phone', 'profile_image',
                'timezone', 'locale', 'date_format', 'time_format'
            ]);
        });
    }
};
