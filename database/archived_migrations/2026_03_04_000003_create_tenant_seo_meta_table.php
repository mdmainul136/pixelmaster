<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 50)->index();     // product, category, page, blog
            $table->unsignedBigInteger('entity_id')->index();
            $table->string('language', 10)->default('en');

            // Meta tags
            $table->string('meta_title', 200)->nullable();
            $table->text('meta_description')->nullable();
            $table->string('focus_keyword', 100)->nullable();
            $table->json('secondary_keywords')->nullable();

            // OpenGraph
            $table->string('og_title', 200)->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image', 500)->nullable();

            // Twitter
            $table->string('twitter_title', 200)->nullable();
            $table->text('twitter_description')->nullable();
            $table->string('twitter_image', 500)->nullable();
            $table->string('twitter_card_type', 50)->default('summary_large_image');

            // Technical
            $table->string('canonical_url', 500)->nullable();
            $table->string('robots', 50)->default('index, follow');

            // Scoring
            $table->tinyInteger('seo_score')->unsigned()->default(0);
            $table->json('seo_analysis')->nullable();  // {"title": 12, "description": 10, ...}
            $table->timestamp('last_audited_at')->nullable();

            $table->timestamps();

            $table->unique(['entity_type', 'entity_id', 'language'], 'unique_entity_lang');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_meta');
    }
};
