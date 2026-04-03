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
        Schema::create('ior_scrape_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('batch_id')->nullable()->index(); // For Laravel Bus Batch tracking
            $table->string('type')->default('amazon_scrape');
            $table->integer('total_urls')->default(0);
            $table->integer('completed_urls')->default(0);
            $table->integer('failed_urls')->default(0);
            $table->string('status')->default('pending')->comment('pending, processing, completed, failed');
            $table->json('options')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_scrape_tasks');
    }
};
