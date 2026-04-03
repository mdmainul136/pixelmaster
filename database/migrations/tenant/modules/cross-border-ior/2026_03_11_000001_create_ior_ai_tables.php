<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. AI Quota Table (Independent from Scraper Quota)
        if (!Schema::hasTable('ior_ai_quotas')) {
            Schema::create('ior_ai_quotas', function (Blueprint $table) {
                $table->id();
                $table->integer('credits_purchased');
                $table->integer('credits_used')->default(0);
                $table->integer('credits_remaining');
                $table->decimal('cost_per_credit', 10, 4)->default(0.05); // Price in USD
                $table->string('type', 30)->default('general'); // seo | content | general
                $table->string('payment_reference')->nullable();
                $table->string('status')->default('active'); // active | expired | empty
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();

                $table->index('status');
                $table->index('type');
            });
        }

        // 2. AI Usage Logs
        if (!Schema::hasTable('ior_ai_logs')) {
            Schema::create('ior_ai_logs', function (Blueprint $table) {
                $table->id();
                $table->string('provider', 50); // gemini | openai | claude
                $table->string('feature', 50);  // seo | description | listing | translate | social | hs_inference
                $table->string('model', 100)->nullable();
                $table->integer('tokens_used')->nullable();
                $table->decimal('credit_cost', 10, 4)->default(1.0); // usually 1 credit per request or based on tokens
                $table->text('prompt_summary')->nullable();
                $table->string('status')->default('success'); // success | error
                $table->text('error_message')->nullable();
                $table->timestamps();

                $table->index('feature');
                $table->index('provider');
                $table->index('status');
                $table->index('created_at');
            });
        }
        
        // 3. New settings for AI billing
        \DB::table('ior_settings')->insertOrIgnore([
            ['key' => 'ai_cost_per_generation', 'value' => '1', 'group' => 'ai', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ai_cost_per_100_credits', 'value' => '5.0', 'group' => 'ai', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ai_use_platform_credits', 'value' => '0', 'group' => 'ai', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ior_ai_logs');
        Schema::dropIfExists('ior_ai_quotas');
        
        \DB::table('ior_settings')->whereIn('key', ['ai_cost_per_generation', 'ai_cost_per_100_credits', 'ai_use_platform_credits'])->delete();
    }
};
