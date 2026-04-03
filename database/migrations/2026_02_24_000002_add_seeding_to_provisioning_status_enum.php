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
            $table->enum('provisioning_status', [
                'queued',
                'starting',
                'creating_db',
                'migrating',
                'seeding',
                'creating_admin',
                'activating_modules',
                'sending_email',
                'completed',
                'failed',
                'pending'
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
                'queued',
                'starting',
                'creating_db',
                'migrating',
                'creating_admin',
                'activating_modules',
                'sending_email',
                'completed',
                'failed',
                'pending'
            ])->default('queued')->change();
        });
    }
};
