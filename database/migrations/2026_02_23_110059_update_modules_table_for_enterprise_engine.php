<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mysql')->table('modules', function (Blueprint $table) {
            // Rename keys only if they still exist with old names
            if (Schema::connection('mysql')->hasColumn('modules', 'module_key')) {
                $table->renameColumn('module_key', 'slug');
            }
            if (Schema::connection('mysql')->hasColumn('modules', 'module_name')) {
                $table->renameColumn('module_name', 'name');
            }

            // Add metadata for Enterprise Engine (check each to be safe)
            if (!Schema::connection('mysql')->hasColumn('modules', 'group')) {
                $table->string('group')->nullable()->after('name');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'business_types')) {
                $table->json('business_types')->nullable()->after('group');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'plans')) {
                $table->json('plans')->nullable()->after('business_types');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'depends_on')) {
                $table->json('depends_on')->nullable()->after('plans');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'conflicts_with')) {
                $table->json('conflicts_with')->nullable()->after('depends_on');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'is_core')) {
                $table->boolean('is_core')->default(false)->after('conflicts_with');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'is_marketplace')) {
                $table->boolean('is_marketplace')->default(true)->after('is_core');
            }
            if (!Schema::connection('mysql')->hasColumn('modules', 'features')) {
                $table->json('features')->nullable()->after('is_marketplace');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->table('modules', function (Blueprint $table) {
            $cols = ['group', 'business_types', 'plans', 'depends_on', 'conflicts_with', 'is_core', 'is_marketplace', 'features'];
            foreach ($cols as $col) {
                if (Schema::connection('mysql')->hasColumn('modules', $col)) {
                    $table->dropColumn($col);
                }
            }
            
            if (Schema::connection('mysql')->hasColumn('modules', 'slug')) {
                $table->renameColumn('slug', 'module_key');
            }
            if (Schema::connection('mysql')->hasColumn('modules', 'name')) {
                $table->renameColumn('name', 'module_name');
            }
        });
    }
};
