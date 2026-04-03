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
        Schema::create('region_module_overrides', function (Blueprint $table) {
            $table->id();
            $table->string('region_code', 50)->index();         // e.g. SOUTH_ASIA, NORTH_AMERICA
            $table->string('module_slug', 100)->index();         // e.g. ecommerce, pos, ior
            $table->enum('status', ['core', 'addon', 'na'])->default('na');
            $table->decimal('addon_price', 8, 2)->nullable();    // Monthly price override if addon
            $table->boolean('is_active')->default(true);         // Soft flag to disable override
            $table->foreignId('updated_by')->nullable();         // SuperAdmin who last modified
            $table->timestamps();

            $table->unique(['region_code', 'module_slug']);      // One override per region+module
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('region_module_overrides');
    }
};
