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
        Schema::table('tenant_whatsapp_configs', function (Blueprint $table) {
            $table->json('workflow_data')->nullable()->after('support_instructions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_whatsapp_configs', function (Blueprint $table) {
            $table->dropColumn('workflow_data');
        });
    }
};
