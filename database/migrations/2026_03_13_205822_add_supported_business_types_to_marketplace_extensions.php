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
        Schema::connection('central')->table('marketplace_extensions', function (Blueprint $table) {
            $table->json('supported_business_types')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->table('marketplace_extensions', function (Blueprint $table) {
            $table->dropColumn('supported_business_types');
        });
    }
};
