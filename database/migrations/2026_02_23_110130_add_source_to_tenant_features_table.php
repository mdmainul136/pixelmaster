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
        Schema::table('tenant_features', function (Blueprint $table) {
            $table->string('source')->default('module')->after('enabled'); // plan, module, ai, manual
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_features', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
