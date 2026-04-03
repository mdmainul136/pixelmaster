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
        Schema::table('docker_nodes', function (Blueprint $table) {
            $table->string('provisioning_token')->nullable()->after('metadata');
            $table->index('provisioning_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('docker_nodes', function (Blueprint $table) {
            $table->dropColumn('provisioning_token');
        });
    }
};
