<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('shopify_shops')) {
            return; // Table already exists — possibly created outside migrations
        }

        Schema::create('shopify_shops', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('shop_domain')->unique();          // myshop.myshopify.com
            $table->string('shop_name')->nullable();
            $table->text('access_token');                      // Encrypted OAuth token
            $table->string('scope')->nullable();               // Granted scopes
            $table->string('nonce')->nullable();                // OAuth state nonce
            $table->unsignedBigInteger('tracking_container_id')->nullable(); // Linked container
            $table->json('settings')->nullable();               // measurement_id, container_id, etc.
            $table->boolean('script_installed')->default(false);
            $table->string('script_tag_id')->nullable();        // Shopify ScriptTag ID
            $table->boolean('webhooks_registered')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('installed_at')->nullable();
            $table->timestamp('uninstalled_at')->nullable();
            $table->timestamps();

            $table->foreign('tracking_container_id')
                  ->references('id')->on('ec_tracking_containers')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopify_shops');
    }
};
