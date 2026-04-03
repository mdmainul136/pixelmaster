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
            // Check if server_location doesn't exist before adding
            if (!Schema::hasColumn('ec_tracking_containers', 'server_location')) {
                $table->string('server_location')->nullable()->after('domain')->comment('global, eu, etc');
            }
            
            // deployment_type was found to already exist in some environments, but let's ensure it has the correct type
            // If it doesn't exist, add it.
            if (!Schema::hasColumn('ec_tracking_containers', 'deployment_type')) {
                $table->string('deployment_type')->default('docker_vps')->after('server_location')->comment('docker_vps, kubernetes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn(['server_location', 'deployment_type']);
        });
    }
};
