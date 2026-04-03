<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to change ENUM to STRING/VARCHAR for flexibility
        // or just expand the ENUM. In multi-tenant, string is safer.
        $connection = DB::connection();
        
        // Check if we are using MySQL
        $driver = $connection->getDriverName();
        
        if ($driver === 'mysql') {
            $connection->statement("ALTER TABLE ec_orders MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'");
            $connection->statement("ALTER TABLE ec_orders MODIFY COLUMN payment_status VARCHAR(50) DEFAULT 'pending'");
        } else {
            Schema::table('ec_orders', function (Blueprint $table) {
                $table->string('status', 50)->default('pending')->change();
                $table->string('payment_status', 50)->default('pending')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if ($driver === 'mysql') {
            $connection->statement("ALTER TABLE ec_orders MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending'");
            $connection->statement("ALTER TABLE ec_orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'");
        }
    }
};
