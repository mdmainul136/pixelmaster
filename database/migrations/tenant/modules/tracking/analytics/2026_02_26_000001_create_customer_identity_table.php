<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Customer Identity Table
 *
 * Core of the identity resolution system.
 * Each row = one unified customer profile per tenant.
 * Multiple identifiers (anon_id, email, phone, user_id) are linked here.
 */
return new class extends Migration
{
    

    public function up(): void
    {
        Schema::create('tracking_customer_identity', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();

            // ── Deterministic Identifiers ─────────────────────────────────────
            $table->string('user_id')->nullable()->index();          // Login user ID
            $table->string('email_hash', 64)->nullable()->index();   // sha256(email)
            $table->string('phone_hash', 64)->nullable()->index();   // sha256(phone)

            // ── Probabilistic / Session Identifiers ───────────────────────────
            $table->string('primary_anonymous_id')->nullable()->index(); // First anon cookie
            $table->json('merged_anonymous_ids')->nullable();            // All linked anon IDs

            // ── Device Intelligence ───────────────────────────────────────────
            $table->json('devices')->nullable();            // [{type, ua, first_seen, last_seen}]
            $table->json('browsers')->nullable();           // [{browser, os, first_seen}]
            $table->json('ip_addresses')->nullable();       // [ip, country, city]

            // ── Purchase History ──────────────────────────────────────────────
            $table->unsignedInteger('order_count')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->decimal('avg_order_value', 10, 2)->default(0);
            $table->timestamp('first_order_at')->nullable();
            $table->timestamp('last_order_at')->nullable();
            $table->unsignedInteger('days_since_last_order')->nullable();

            // ── Segmentation ──────────────────────────────────────────────────
            // prospect | new_customer | returning | loyal | vip | churned
            $table->string('customer_segment', 20)->default('prospect')->index();
            $table->timestamp('segment_updated_at')->nullable();

            // ── UTM Attribution ───────────────────────────────────────────────
            $table->string('first_touch_source')->nullable();    // facebook / google / organic
            $table->string('first_touch_medium')->nullable();    // cpc / social / email
            $table->string('first_touch_campaign')->nullable();  // campaign name
            $table->string('last_touch_source')->nullable();
            $table->string('last_touch_medium')->nullable();

            // ── Phone/WhatsApp Order Tracking ─────────────────────────────────
            $table->unsignedInteger('phone_order_count')->default(0);
            $table->unsignedInteger('whatsapp_click_count')->default(0);
            $table->timestamp('last_whatsapp_click_at')->nullable();

            // ── Cross-device ──────────────────────────────────────────────────
            $table->unsignedTinyInteger('device_count')->default(1);
            $table->boolean('is_cross_device')->default(false);

            $table->timestamps();

            // ── Composite uniqueness — one profile per tenant + user_id ───────
            $table->unique(['tenant_id', 'user_id']);
            $table->unique(['tenant_id', 'email_hash']);
            $table->unique(['tenant_id', 'phone_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_customer_identity');
    }
};
