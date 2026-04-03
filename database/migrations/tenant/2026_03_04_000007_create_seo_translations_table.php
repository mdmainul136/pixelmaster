<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_translations', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 50)->index();     // product, category, page, blog, variant
            $table->unsignedBigInteger('entity_id')->index();
            $table->string('locale', 10)->index();           // bn, ar, tr, fr, etc.

            // Translated slug (URL handle)
            $table->string('translated_slug', 500)->nullable();

            // Translated meta tags
            $table->string('meta_title', 200)->nullable();
            $table->text('meta_description')->nullable();

            // Translated OpenGraph
            $table->string('og_title', 200)->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image', 500)->nullable();

            // Translated keywords
            $table->string('focus_keyword', 100)->nullable();
            $table->json('secondary_keywords')->nullable();

            // Alt text for translated content
            $table->string('translated_alt_text', 255)->nullable();

            // Translated name (used in hreflang and storefront)
            $table->string('translated_name', 255)->nullable();
            $table->text('translated_description')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->tinyInteger('translation_quality')->unsigned()->default(0); // 0-100 score
            $table->enum('translation_source', ['manual', 'ai', 'import'])->default('manual');

            $table->timestamps();

            $table->unique(['entity_type', 'entity_id', 'locale'], 'unique_entity_locale');
            $table->index(['locale', 'entity_type'], 'idx_locale_entity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_translations');
    }
};
