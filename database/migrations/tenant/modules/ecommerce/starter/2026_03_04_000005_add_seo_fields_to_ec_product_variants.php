<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add SEO fields to ec_product_variants.
     * This is THE Shopify Killer — each variation becomes a standalone SEO asset.
     */
    public function up(): void
    {
        Schema::table('ec_product_variants', function (Blueprint $table) {
            // ── URL & Indexing ──
            $table->string('seo_slug', 300)->nullable()->after('is_active');
            $table->boolean('is_indexable')->default(false)->after('seo_slug');
            $table->unsignedBigInteger('canonical_to')->nullable()->after('is_indexable');
            $table->tinyInteger('seo_priority')->default(5)->after('canonical_to');   // 1-10

            // ── Meta Tags ──
            $table->string('meta_title', 200)->nullable()->after('seo_priority');
            $table->text('meta_description')->nullable()->after('meta_title');

            // ── Keywords ──
            $table->string('primary_keyword', 100)->nullable()->after('meta_description');
            $table->json('secondary_keywords')->nullable()->after('primary_keyword');
            $table->json('long_tail_keywords')->nullable()->after('secondary_keywords');
            $table->json('semantic_keywords')->nullable()->after('long_tail_keywords');

            // ── Content ──
            $table->text('short_description')->nullable()->after('semantic_keywords');
            $table->json('bullet_features')->nullable()->after('short_description');
            $table->string('use_case', 200)->nullable()->after('bullet_features');

            // ── Image SEO ──
            $table->string('image_alt', 300)->nullable()->after('use_case');
            $table->string('image_title', 200)->nullable()->after('image_alt');

            // ── Social ──
            $table->string('og_title', 200)->nullable()->after('image_title');
            $table->text('og_description')->nullable()->after('og_title');

            // ── Schema ──
            $table->json('schema_data')->nullable()->after('og_description');

            // ── CTR Boost ──
            $table->string('badge_text', 50)->nullable()->after('schema_data');
            $table->string('offer_snippet', 100)->nullable()->after('badge_text');
            $table->string('delivery_snippet', 100)->nullable()->after('offer_snippet');

            // ── Score ──
            $table->unsignedTinyInteger('seo_score')->default(0)->after('delivery_snippet');

            // ── Indexes ──
            $table->index('seo_slug');
            $table->index('is_indexable');
            $table->index('seo_priority');
            $table->index('seo_score');
        });
    }

    public function down(): void
    {
        Schema::table('ec_product_variants', function (Blueprint $table) {
            $table->dropColumn([
                'seo_slug', 'is_indexable', 'canonical_to', 'seo_priority',
                'meta_title', 'meta_description',
                'primary_keyword', 'secondary_keywords', 'long_tail_keywords', 'semantic_keywords',
                'short_description', 'bullet_features', 'use_case',
                'image_alt', 'image_title',
                'og_title', 'og_description',
                'schema_data',
                'badge_text', 'offer_snippet', 'delivery_snippet',
                'seo_score',
            ]);
        });
    }
};
