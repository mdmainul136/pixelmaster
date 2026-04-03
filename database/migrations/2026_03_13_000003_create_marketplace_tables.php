<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Theme vendors
        Schema::create('theme_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('website')->nullable();
            $table->string('support_email');
            $table->decimal('commission_rate', 5, 2)->default(30.00);
            $table->json('payout_details')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Marketplace themes
        Schema::create('marketplace_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theme_id')->constrained()->onDelete('cascade');
            $table->foreignId('vendor_id')->references('id')->on('theme_vendors');
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('pricing_type', ['free', 'one_time', 'subscription'])->default('free');
            $table->decimal('subscription_monthly', 10, 2)->nullable();
            $table->text('demo_url')->nullable();
            $table->json('screenshots')->nullable();
            $table->json('features')->nullable();
            $table->json('changelog')->nullable();
            $table->integer('downloads')->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        // 3. Theme purchases
        Schema::create('theme_purchases', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('marketplace_theme_id')->constrained();
            $table->foreignId('vendor_id')->references('id')->on('theme_vendors');
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->decimal('commission', 10, 2);
            $table->decimal('vendor_earnings', 10, 2);
            $table->enum('payment_status', ['pending', 'completed', 'refunded'])->default('pending');
            $table->timestamp('purchased_at');
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('paid_out_at')->nullable();
            $table->timestamps();
        });

        // 4. Theme reviews
        Schema::create('theme_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_theme_id')->constrained()->onDelete('cascade');
            $table->string('tenant_id')->index();
            $table->integer('rating');
            $table->text('review')->nullable();
            $table->text('vendor_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->timestamps();
            $table->unique(['marketplace_theme_id', 'tenant_id']);
        });

        // 5. Theme support tickets
        Schema::create('theme_support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_theme_id')->constrained();
            $table->string('tenant_id')->index();
            $table->string('subject');
            $table->text('message');
            $table->enum('status', ['open', 'answered', 'closed'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamps();
        });

        // 6. Support ticket replies
        Schema::create('theme_support_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->references('id')->on('theme_support_tickets')->onDelete('cascade');
            $table->morphs('author');
            $table->text('message');
            $table->timestamps();
        });

        // 7. Theme categories
        Schema::create('theme_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // 8. Pivot: marketplace themes ↔ categories
        Schema::create('marketplace_theme_category', function (Blueprint $table) {
            $table->foreignId('marketplace_theme_id')->constrained()->onDelete('cascade');
            $table->foreignId('theme_category_id')->constrained()->onDelete('cascade');
            $table->primary(['marketplace_theme_id', 'theme_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_theme_category');
        Schema::dropIfExists('theme_categories');
        Schema::dropIfExists('theme_support_replies');
        Schema::dropIfExists('theme_support_tickets');
        Schema::dropIfExists('theme_reviews');
        Schema::dropIfExists('theme_purchases');
        Schema::dropIfExists('marketplace_themes');
        Schema::dropIfExists('theme_vendors');
    }
};
