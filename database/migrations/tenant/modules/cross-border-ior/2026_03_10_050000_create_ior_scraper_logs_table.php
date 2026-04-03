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
        if (!Schema::hasTable('ior_scraper_logs')) {
            Schema::create('ior_scraper_logs', function (Blueprint $table) {
                $table->id();
                $table->string('provider')->default('python');
                $table->string('marketplace')->index();
                $table->string('source_url')->nullable();
                $table->unsignedBigInteger('product_id')->nullable()->index();
                $table->string('status')->default('success');
                $table->decimal('cost', 10, 4)->default(0);
                $table->json('response_summary')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ior_scraper_logs');
    }
};
