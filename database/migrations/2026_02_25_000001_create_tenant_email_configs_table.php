<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_email_configs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('verified_domain')->nullable();
            $table->string('ses_identity_arn')->nullable();
            $table->enum('dkim_status', ['pending', 'success', 'failed', 'not_started'])->default('not_started');
            $table->enum('verification_status', ['pending', 'verified', 'failed', 'not_started'])->default('not_started');

            // DNS records returned by SES for domain verification
            $table->json('dns_records')->nullable();

            // Sender settings
            $table->string('from_name')->default('');
            $table->string('from_email')->default('');
            $table->string('reply_to_email')->default('');

            // Marketing-specific sender
            $table->string('marketing_from_name')->default('');
            $table->string('marketing_from_email')->default('');

            // Rate limiting
            $table->unsignedInteger('daily_send_limit')->default(200);
            $table->unsignedInteger('sends_today')->default(0);
            $table->date('sends_reset_date')->nullable();

            $table->timestamps();

            $table->unique('tenant_id');
            $table->index('verified_domain');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_email_configs');
    }
};
