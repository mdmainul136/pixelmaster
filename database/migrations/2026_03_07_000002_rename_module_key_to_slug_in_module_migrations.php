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
        Schema::connection('mysql')->table('module_migrations', function (Blueprint $table) {
            if (Schema::connection('mysql')->hasColumn('module_migrations', 'module_key')) {
                $table->renameColumn('module_key', 'slug');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->table('module_migrations', function (Blueprint $table) {
            if (Schema::connection('mysql')->hasColumn('module_migrations', 'slug')) {
                $table->renameColumn('slug', 'module_key');
            }
        });
    }
};
