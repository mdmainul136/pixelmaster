<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_programmatic_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('entity_type', 50)->default('product');
            
            // Templates
            $table->string('title_template', 255);
            $table->text('desc_template')->nullable();
            $table->string('slug_template', 255);
            $table->json('schema_template')->nullable();
            
            // Source & Query logic
            $table->string('data_source')->default('manual'); // manual, query, ai
            $table->json('data_query')->nullable(); // For dynamic pulling
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('seo_virtual_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('seo_programmatic_campaigns')->onDelete('cascade');
            
            $table->string('slug', 255)->unique()->index();
            $table->string('meta_title', 255);
            $table->text('meta_description')->nullable();
            
            $table->json('variables'); // Resolved variables for this page
            $table->string('canonical_url', 500)->nullable();
            
            $table->unsignedInteger('hits')->default(0);
            $table->boolean('is_indexed')->default(true);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_virtual_pages');
        Schema::dropIfExists('seo_programmatic_campaigns');
    }
};
