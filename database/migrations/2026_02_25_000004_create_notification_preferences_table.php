<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('marketing_emails')->default(false);
            $table->boolean('security_alerts')->default(true);
            $table->boolean('weekly_reports')->default(false);
            $table->boolean('campaign_analytics')->default(true);
            $table->timestamps();

            $table->unique('tenant_id');
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
