<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Raw storefront events from Next.js (Web Vitals, page views, clicks)
        Schema::create('theme_analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->string('session_id', 64)->nullable()->index();
            $table->enum('event_type', ['page_view', 'section_view', 'click', 'conversion', 'bounce', 'vitals']);
            $table->string('page_slug', 100)->nullable();
            $table->string('section_type', 100)->nullable(); // which section type was interacted with
            // Web Vitals payload
            $table->decimal('lcp', 8, 2)->nullable(); // Largest Contentful Paint (ms)
            $table->decimal('fid', 8, 2)->nullable(); // First Input Delay (ms)
            $table->decimal('cls', 8, 4)->nullable(); // Cumulative Layout Shift (score)
            $table->decimal('ttfb', 8, 2)->nullable(); // Time to First Byte (ms)
            $table->string('device_type', 20)->nullable(); // desktop/tablet/mobile
            $table->string('country_code', 2)->nullable();
            $table->json('meta')->nullable(); // extra key-value pairs
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });

        // Aggregated daily summary per theme + tenant (computed from raw events)
        Schema::create('theme_analytics_daily', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->date('date')->index();
            $table->unsignedInteger('page_views')->default(0);
            $table->unsignedInteger('unique_sessions')->default(0);
            $table->unsignedInteger('conversions')->default(0);
            $table->unsignedInteger('bounces')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->decimal('avg_lcp', 8, 2)->nullable();
            $table->decimal('avg_fid', 8, 2)->nullable();
            $table->decimal('avg_cls', 8, 4)->nullable();
            $table->decimal('avg_ttfb', 8, 2)->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'theme_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_analytics_daily');
        Schema::dropIfExists('theme_analytics_events');
    }
};
