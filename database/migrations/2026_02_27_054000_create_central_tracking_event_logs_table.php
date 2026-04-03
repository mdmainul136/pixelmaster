<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_event_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->unsignedBigInteger('container_id')->index();

            // ── Event Identification ──────────────────────────────────────────
            $table->string('event_id', 100)->nullable()->index();
            $table->string('event_name', 100)->index();
            $table->string('client_id')->nullable();

            // ── Source ───────────────────────────────────────────────────────
            $table->string('source_ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('page_url')->nullable();
            $table->string('referer')->nullable();

            // ── User Identity ─────────────────────────────────────────────────
            $table->string('user_hash', 64)->nullable()->index();
            $table->string('phone_hash', 64)->nullable();
            $table->string('anonymous_id')->nullable()->index();
            $table->unsignedBigInteger('identity_id')->nullable();

            // ── Conversion Data ───────────────────────────────────────────────
            $table->decimal('value', 12, 2)->nullable();
            $table->string('currency', 10)->nullable();
            $table->string('order_id')->nullable();

            // ── Geo Enrichment ────────────────────────────────────────────────
            $table->string('country', 5)->nullable();
            $table->string('city')->nullable();
            $table->string('region')->nullable();

            // ── UTM Attribution ───────────────────────────────────────────────
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();

            // ── Processing ────────────────────────────────────────────────────
            $table->string('status', 30)->default('received')->index();
            $table->unsignedSmallInteger('status_code')->nullable();
            $table->string('request_id', 100)->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);

            // ── Fan-out Results ───────────────────────────────────────────────
            $table->json('destinations_result')->nullable();

            // ── Payload snapshot ─────────────────────────────────────────────
            $table->json('payload')->nullable();

            $table->timestamp('processed_at')->nullable()->useCurrent()->index();
            $table->timestamps();

            $table->index(['container_id', 'processed_at']);
            $table->index(['container_id', 'event_name', 'processed_at']);
            $table->index(['container_id', 'status', 'processed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_event_logs');
    }
};
