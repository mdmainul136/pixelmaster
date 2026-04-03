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
        if (!Schema::hasTable('mkp_vendors')) {
            Schema::create('mkp_vendors', function (Blueprint $blueprint) {
                $blueprint->id();
                $blueprint->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $blueprint->string('store_name');
                $blueprint->string('slug')->unique();
                $blueprint->text('description')->nullable();
                $blueprint->string('logo_url')->nullable();
                $blueprint->string('banner_url')->nullable();
                $blueprint->decimal('commission_rate', 5, 2)->default(10.00);
                $blueprint->decimal('balance', 15, 2)->default(0.00);
                $blueprint->string('status')->default('pending'); // pending, active, suspended
                $blueprint->boolean('is_verified')->default(false);
                $blueprint->json('verification_data')->nullable(); // ID docs, certificates etc.
                $blueprint->decimal('rating', 3, 2)->default(0.00);
                $blueprint->json('settings')->nullable();
                $blueprint->timestamps();
                $blueprint->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mkp_vendors');
    }
};
