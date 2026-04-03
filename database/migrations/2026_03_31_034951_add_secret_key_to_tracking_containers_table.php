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
            $table->string('secret_key', 64)->nullable()->unique()->after('container_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('secret_key');
        });
    }
};
