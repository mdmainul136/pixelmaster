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
        if (!Schema::hasTable('ior_scraper_tasks')) {
            Schema::create('ior_scraper_tasks', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('frequency'); // e.g. "Every 4 hrs", "Daily @ 12 PM"
                $table->string('marketplace')->nullable();
                $table->string('status')->default('active'); // active, paused
                $table->timestamp('last_run_at')->nullable();
                $table->timestamp('next_run_at')->nullable();
                $table->json('payload')->nullable(); // extra params for the task
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_scraper_tasks');
    }
};
