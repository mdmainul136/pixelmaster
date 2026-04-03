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
            $table->string('deployment_type', 30)->default('docker_vps')->after('is_active')
                  ->comment('Used by orchestrator: docker_vps or kubernetes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('deployment_type');
        });
    }
};
