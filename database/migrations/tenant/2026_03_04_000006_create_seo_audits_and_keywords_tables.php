<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * SEO Audits — weekly site health check history.
     */
    public function up(): void
    {
        Schema::create('seo_audits', function (Blueprint $table) {
            $table->id();
            $table->string('audit_type', 30)->default('full');   // full, product, category, variation
            $table->unsignedInteger('total_pages')->default(0);
            $table->unsignedInteger('issues_critical')->default(0);
            $table->unsignedInteger('issues_warning')->default(0);
            $table->unsignedInteger('issues_info')->default(0);
            $table->unsignedTinyInteger('overall_score')->default(0);
            $table->json('results');                              // detailed audit findings
            $table->json('summary')->nullable();                 // quick summary stats
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 20)->default('pending');    // pending, running, completed, failed
            $table->timestamps();

            $table->index('audit_type');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('seo_keywords', function (Blueprint $table) {
            $table->id();
            $table->string('keyword', 200);
            $table->string('entity_type', 50)->nullable();       // product, variation, category
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('language', 10)->default('en');
            $table->string('keyword_type', 20)->default('primary'); // primary, secondary, long_tail, semantic
            $table->unsignedSmallInteger('search_volume')->nullable();
            $table->decimal('keyword_difficulty', 4, 1)->nullable(); // 0-100
            $table->unsignedTinyInteger('current_rank')->nullable();
            $table->unsignedTinyInteger('previous_rank')->nullable();
            $table->string('serp_feature', 50)->nullable();      // featured_snippet, people_also_ask, etc.
            $table->decimal('cpc', 6, 2)->nullable();
            $table->json('trend_data')->nullable();               // monthly search volume trend
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();

            $table->unique(['keyword', 'entity_type', 'entity_id', 'language'], 'unique_keyword_entity');
            $table->index(['entity_type', 'entity_id']);
            $table->index('keyword_type');
            $table->index('search_volume');
            $table->index('current_rank');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_keywords');
        Schema::dropIfExists('seo_audits');
    }
};
