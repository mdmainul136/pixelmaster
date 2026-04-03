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
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            if (!Schema::hasColumn('ec_tracking_containers', 'tenant_id')) {
                $table->string('tenant_id')->nullable()->after('id')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('tenant_id');
        });
    }
};
