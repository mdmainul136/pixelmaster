<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_whatsapp_configs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique();
            $table->string('provider')->default('official'); // official (Meta), twilio, or unofficial_node
            
            // Credentials
            $table->text('api_token')->nullable();
            $table->string('phone_number_id')->nullable();
            $table->string('whatsapp_business_account_id')->nullable();
            $table->string('webhook_verify_token')->nullable();

            // Automation Toggles
            $table->boolean('auto_order_confirmation')->default(false);
            $table->boolean('abandoned_cart_recovery')->default(false);
            $table->boolean('ai_support_enabled')->default(false);
            
            // AI Context
            $table->text('support_instructions')->nullable();
            
            $table->timestamps();
            
            // $table->foreign('tenant_id')->references('tenant_id')->on('tenants')->onDelete('cascade');
        });

        // Store WhatsApp Conversations / History
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('customer_phone');
            $table->text('message');
            $table->enum('direction', ['inbound', 'outbound']);
            $table->boolean('is_ai_replied')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'customer_phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('tenant_whatsapp_configs');
    }
};
