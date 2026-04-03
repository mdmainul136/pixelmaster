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
        // 1. Tenant sGTM Configurations
        if (!Schema::hasTable('tenant_sgtm_configs')) {
            Schema::create('tenant_sgtm_configs', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('container_id')->unique(); // e.g., GTM-XXXXXX
                $table->string('api_key')->unique();
                $table->string('custom_domain')->nullable();
                $table->boolean('is_active')->default(true);
                $table->json('settings')->nullable(); // pool, rate limits, etc.
                $table->timestamps();

                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            });
        }

        // 2. High-throughput sGTM Event Logs
        if (!Schema::hasTable('sgtm_event_logs')) {
            Schema::create('sgtm_event_logs', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('container_id')->index();
                $table->string('event_name');
                $table->string('event_id')->nullable()->index(); // For deduplication
                $table->timestamp('event_time')->nullable();
                $table->string('source_ip', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->json('payload');
                $table->integer('status_code')->default(200);
                $table->string('request_id')->unique();
                $table->timestamp('processed_at')->useCurrent();
                $table->timestamps();

                // Index for fast cleanups and dashboarding
                $table->index(['tenant_id', 'processed_at']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sgtm_event_logs');
        Schema::dropIfExists('tenant_sgtm_configs');
    }
};
