<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds 'ior-independent' to the tenants.plan ENUM column.
     */
    public function up(): void
    {
        DB::connection('central')->statement(
            "ALTER TABLE tenants MODIFY COLUMN plan ENUM('starter','growth','pro','ior-independent') NOT NULL DEFAULT 'starter'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::connection('central')->statement(
            "ALTER TABLE tenants MODIFY COLUMN plan ENUM('starter','growth','pro') NOT NULL DEFAULT 'starter'"
        );
    }
};
