<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Theme Subscriptions (recurring billing for paid themes)
        Schema::create('theme_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('marketplace_theme_id')->constrained()->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('theme_vendors')->onDelete('cascade');
            $table->enum('provider', ['stripe', 'paddle'])->default('stripe');
            $table->string('provider_subscription_id')->nullable()->index();
            $table->string('provider_customer_id')->nullable();
            $table->enum('status', ['active', 'cancelled', 'past_due', 'trialing'])->default('active');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('interval', ['monthly', 'yearly'])->default('monthly');
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        // Vendor payouts (automated batch payouts via Stripe Connect / Paddle)
        Schema::create('vendor_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('theme_vendors')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('provider', ['stripe', 'paddle'])->default('stripe');
            $table->string('provider_transfer_id')->nullable()->unique();
            $table->enum('status', ['pending', 'processing', 'paid', 'failed'])->default('pending');
            $table->date('period_start');
            $table->date('period_end');
            $table->text('failure_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_id', 'status']);
        });

        // Paddle transactions (separate from Stripe; tracks Paddle-specific payload)
        Schema::create('paddle_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('paddle_transaction_id')->unique();
            $table->string('paddle_subscription_id')->nullable()->index();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('tax', 10, 2)->default(0);
            $table->string('country_code', 2)->nullable(); // Paddle handles tax per country
            $table->enum('status', ['completed', 'refunded', 'partially_refunded'])->default('completed');
            $table->json('payload'); // Full Paddle webhook payload
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paddle_transactions');
        Schema::dropIfExists('vendor_payouts');
        Schema::dropIfExists('theme_subscriptions');
    }
};
