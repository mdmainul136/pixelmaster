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
            $table->string('company_address')->nullable()->after('favicon');
            $table->string('company_city_zip')->nullable()->after('company_address');
            $table->string('company_email')->nullable()->after('company_city_zip');
            $table->string('company_phone')->nullable()->after('company_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->dropColumn([
                'company_address',
                'company_city_zip',
                'company_email',
                'company_phone',
            ]);
        });
    }
};
