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
        if (!Schema::hasColumn('ec_tracking_containers', 'metabase_type')) {
            Schema::table('ec_tracking_containers', function (Blueprint $table) {
                $table->enum('metabase_type', ['local', 'cloud'])->default('local')->after('is_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('metabase_type');
        });
    }
};
