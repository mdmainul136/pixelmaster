<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('to_email');
            $table->string('from_email');
            $table->string('subject');
            $table->enum('status', ['queued', 'sent', 'delivered', 'bounced', 'complained', 'failed'])->default('queued');
            $table->string('ses_message_id')->nullable();
            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->string('bounce_type')->nullable();         // Permanent, Transient, Undetermined
            $table->string('complaint_type')->nullable();      // abuse, auth-failure, fraud, etc.
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();              // Extra data (tags, headers, etc.)
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('bounced_at')->nullable();
            $table->timestamp('complained_at')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('ses_message_id');
            $table->index('campaign_id');
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'to_email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
