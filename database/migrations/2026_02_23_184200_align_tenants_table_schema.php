<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Dynamically find all foreign keys referencing 'tenants'
        $dbName = DB::connection()->getDatabaseName();
        $existingConstraints = DB::select("
            SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_NAME = 'tenants' 
              AND TABLE_SCHEMA = ?
              AND CONSTRAINT_NAME != 'PRIMARY'
        ", [$dbName]);

        $tablesToUpdate = [];
        foreach ($existingConstraints as $ec) {
            echo "Dropping constraint {$ec->CONSTRAINT_NAME} on {$ec->TABLE_NAME}...\n";
            Schema::table($ec->TABLE_NAME, function (Blueprint $tableShell) use ($ec) {
                $tableShell->dropForeign($ec->CONSTRAINT_NAME);
            });
            
            // Track which tables need their tenant_id column updated
            if ($ec->REFERENCED_COLUMN_NAME === 'id') {
                $tablesToUpdate[] = $ec->TABLE_NAME;
            }
        }

        // 2. Migrate data in tables that used BigInt IDs (referencing the old auto-increment PK)
        // Note: Some tables might have 'id' as type but aren't in the FK list if the constraint was already dropped.
        // We'll use our audited list just in case.
        $bigIntTables = array_unique(array_merge($tablesToUpdate, [
            'invoices', 'payment_methods', 'payments', 
            'tenant_activity_logs', 'tenant_backups', 
            'tenant_database_stats', 'tenant_features', 
            'tenant_modules', 'tenant_subscriptions'
        ]));

        foreach ($bigIntTables as $table) {
            // Only update if it's still a bigint (check column type first for idempotency)
            $colInfo = DB::select("SHOW COLUMNS FROM `{$table}` LIKE 'tenant_id'");
            if ($colInfo && str_contains($colInfo[0]->Type, 'bigint')) {
                echo "Converting {$table}.tenant_id to string and mapping IDs...\n";
                
                // Change column type to varchar
                DB::statement("ALTER TABLE `{$table}` MODIFY tenant_id VARCHAR(255) NOT NULL");
                
                // Update numeric IDs to string tenant_ids (e.g., '1' -> 'pstore')
                DB::statement("
                    UPDATE `{$table}` t 
                    JOIN tenants ten ON t.tenant_id = CAST(ten.id AS CHAR) 
                    SET t.tenant_id = ten.tenant_id
                ");
            }
        }

        // 3. Align tenants table
        echo "Aligning tenants table schema...\n";
        // Check if 'id' is still the PK and bigint
        $tenantsPK = DB::select("SHOW KEYS FROM tenants WHERE Key_name = 'PRIMARY'");
        if ($tenantsPK && $tenantsPK[0]->Column_name === 'id') {
            DB::statement('ALTER TABLE tenants MODIFY id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE tenants DROP PRIMARY KEY');
            DB::statement('ALTER TABLE tenants DROP COLUMN id');
            
            DB::statement('ALTER TABLE tenants CHANGE tenant_id id VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE tenants ADD PRIMARY KEY (id)');
        }

        // 4. Restore foreign keys
        $allReferencingTables = array_unique(array_merge($bigIntTables, ['domain_orders', 'tenant_ai_settings']));
        foreach ($allReferencingTables as $table) {
            if (Schema::hasTable($table)) {
                echo "Restoring foreign key on {$table}...\n";
                Schema::table($table, function (Blueprint $tableShell) {
                    $tableShell->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing this is extremely high-risk and usually not required for a breaking schema alignment
        // But for safety, we'll implement a basic rollback if possible (omitted for brevity in this critical fix)
    }
};
