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
            if (!Schema::hasColumn('ec_tracking_containers', 'metabase_type')) {
                $table->enum('metabase_type', ['self_hosted', 'cloud'])->default('self_hosted')->after('container_id');
            }
            if (!Schema::hasColumn('ec_tracking_containers', 'clickhouse_type')) {
                $table->enum('clickhouse_type', ['self_hosted', 'cloud'])->default('self_hosted')->after('metabase_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_tracking_containers', function (Blueprint $table) {
            $table->dropColumn('clickhouse_type');
        });
    }
};
