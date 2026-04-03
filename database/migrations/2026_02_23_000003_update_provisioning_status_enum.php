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
            // Update enum to include all statuses used in the application code
            $table->enum('provisioning_status', [
                'queued',
                'starting',
                'creating_db',
                'migrating',
                'creating_admin',
                'activating_modules',
                'sending_email',
                'completed',
                'failed',
                'pending' // Keep for compatibility
            ])->default('queued')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->enum('provisioning_status', [
                'pending', 
                'db_created', 
                'migrated', 
                'active', 
                'failed'
            ])->default('pending')->change();
        });
    }
};
