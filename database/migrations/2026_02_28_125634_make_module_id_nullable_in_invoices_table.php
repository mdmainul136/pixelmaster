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
        Schema::table('invoices', function (Blueprint $table) {
            // Drop foreign key if it exists (standard Laravel convention)
            $table->dropForeign(['module_id']);
            
            // Alter column to be nullable
            DB::statement('ALTER TABLE invoices MODIFY module_id BIGINT UNSIGNED NULL');
            
            // Re-add foreign key
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            DB::statement('ALTER TABLE invoices MODIFY module_id BIGINT UNSIGNED NOT NULL');
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
        });
    }
};
