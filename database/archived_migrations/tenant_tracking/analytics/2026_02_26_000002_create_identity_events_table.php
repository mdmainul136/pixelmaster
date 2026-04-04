<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Identity Events Table
 *
 * Append-only log of identity merge events.
 * Records every time an anonymous_id was linked to a known identifier.
 *
 * Examples:
 *   ANON_abc → email:sha256(x@y.com)   [type: email, source: purchase]
 *   ANON_def → phone:sha256(017xxx)    [type: phone, source: otp_verify]
 *   ANON_abc → user_id:USR_123         [type: login, source: login]
 */
return new class extends Migration
{
    

    public function up(): void
    {
        Schema::create('tracking_identity_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();

            // The anonymous/unlinked identifier being resolved
            $table->string('from_id')->index();

            // The known identifier it was linked to
            $table->string('to_id')->index();

            // How the link was established
            // email | phone | user_id | probabilistic_ip | whatsapp
            $table->string('link_type', 30);

            // What event triggered the link
            // purchase | login | otp_verify | newsletter_signup | whatsapp_click
            $table->string('source_event', 60)->nullable();

            // Event that triggered the link
            $table->string('event_id')->nullable();

            // Resulting identity record
            $table->unsignedBigInteger('identity_id')->nullable();

            // Confidence: 100 = deterministic, < 100 = probabilistic
            $table->unsignedTinyInteger('confidence')->default(100);

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('linked_at')->useCurrent();

            $table->index(['tenant_id', 'from_id']);
            $table->index(['tenant_id', 'to_id']);
            $table->index(['tenant_id', 'linked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_identity_events');
    }
};
