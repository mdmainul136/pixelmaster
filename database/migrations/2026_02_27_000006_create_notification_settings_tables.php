<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table for Mail Provider Configurations
        Schema::create('super_admin_mail_configs', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('smtp'); // smtp, sendgrid, mailgun
            $table->text('config_data'); // Encrypted JSON
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Table for Email Templates
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('subject');
            $table->text('content'); // HTML content
            $table->timestamps();
        });

        // Table for Admin Webhooks
        Schema::create('admin_webhooks', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->string('secret')->nullable();
            $table->json('events'); // ['tenant.created', 'security.alert', etc.]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('super_admin_mail_configs');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('admin_webhooks');
    }
};
