<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('db_region', 30)->nullable()->after('db_port')
                  ->comment('Regional server group: mena, europe, south_asia, americas, global');
            $table->index('db_region');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['db_region']);
            $table->dropColumn('db_region');
        });
    }
};
