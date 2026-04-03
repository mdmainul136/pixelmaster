<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Properties — core listing table
        if (!Schema::hasTable('re_properties')) {
            Schema::create('re_properties', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->string('type', 20)->index();                // sale, rent, lease
                $table->string('property_type', 50)->index();       // apartment, villa, office, land, warehouse
                $table->text('description')->nullable();
                $table->decimal('price', 14, 2);
                $table->string('currency', 3)->default('USD');
                $table->decimal('area_sqft', 10, 2)->nullable();
                $table->integer('bedrooms')->nullable();
                $table->integer('bathrooms')->nullable();
                $table->integer('parking_spaces')->nullable();
                $table->integer('floors')->nullable();
                $table->integer('year_built')->nullable();
                $table->string('address', 500);
                $table->string('city', 100)->index();
                $table->string('state', 100)->nullable();
                $table->string('country', 3)->default('BD');
                $table->string('postal_code', 20)->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->string('featured_image', 500)->nullable();
                $table->json('gallery')->nullable();                // array of image URLs
                $table->json('amenities')->nullable();              // pool, gym, garden, etc.
                $table->json('features')->nullable();               // AC, elevator, balcony, etc.
                $table->string('status', 20)->default('draft');     // draft, active, sold, rented, archived
                $table->boolean('is_featured')->default(false);
                $table->boolean('is_active')->default(true);
                $table->unsignedBigInteger('agent_id')->nullable()->index();
                $table->unsignedBigInteger('agency_id')->nullable()->index();
                $table->string('meta_title', 255)->nullable();
                $table->string('meta_description', 500)->nullable();
                $table->integer('views_count')->default(0);
                $table->timestamps();
                $table->softDeletes();

                $table->index(['type', 'status', 'city']);
                $table->index(['price', 'area_sqft']);
            });
        }

        // 2. Property Leads — CRM integration
        if (!Schema::hasTable('re_property_leads')) {
            Schema::create('re_property_leads', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('property_id')->nullable()->index();
                $table->unsignedBigInteger('agent_id')->nullable()->index();
                $table->string('name');
                $table->string('email');
                $table->string('phone', 30)->nullable();
                $table->text('message')->nullable();
                $table->string('source', 50)->default('website');   // website, referral, social, walk-in
                $table->string('status', 30)->default('new');       // new, contacted, qualified, proposal, negotiation, converted, lost
                $table->integer('score')->default(0);               // lead score 0-100
                $table->json('metadata')->nullable();               // extra context
                $table->timestamp('contacted_at')->nullable();
                $table->timestamp('converted_at')->nullable();
                $table->timestamps();

                $table->index(['status', 'score']);
                if (Schema::hasTable('re_properties')) {
                    $table->foreign('property_id')->references('id')->on('re_properties')->nullOnDelete();
                }
            });
        }

        // 3. Agencies
        if (!Schema::hasTable('re_agencies')) {
            Schema::create('re_agencies', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('license_number', 100)->nullable();
                $table->string('email')->nullable();
                $table->string('phone', 30)->nullable();
                $table->text('address')->nullable();
                $table->string('city', 100)->nullable();
                $table->string('logo', 500)->nullable();
                $table->decimal('commission_rate', 5, 2)->default(5.00); // percentage
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 4. Agents
        if (!Schema::hasTable('re_agents')) {
            Schema::create('re_agents', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->unsignedBigInteger('agency_id')->nullable()->index();
                $table->string('name');
                $table->string('email');
                $table->string('phone', 30)->nullable();
                $table->string('license_number', 100)->nullable();
                $table->json('specializations')->nullable();        // residential, commercial, land
                $table->text('bio')->nullable();
                $table->string('avatar', 500)->nullable();
                $table->integer('total_deals')->default(0);
                $table->decimal('total_commission', 14, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                if (Schema::hasTable('re_agencies')) {
                    $table->foreign('agency_id')->references('id')->on('re_agencies')->nullOnDelete();
                }
            });
        }

        // 5. Property Viewings
        if (!Schema::hasTable('re_property_viewings')) {
            Schema::create('re_property_viewings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('property_id')->index();
                $table->unsignedBigInteger('lead_id')->nullable()->index();
                $table->unsignedBigInteger('agent_id')->nullable()->index();
                $table->timestamp('scheduled_at');
                $table->string('status', 20)->default('scheduled'); // scheduled, completed, cancelled, no_show
                $table->text('notes')->nullable();
                $table->integer('rating')->nullable();              // 1-5 post-viewing rating
                $table->text('feedback')->nullable();
                $table->timestamps();

                if (Schema::hasTable('re_properties')) {
                    $table->foreign('property_id')->references('id')->on('re_properties')->cascadeOnDelete();
                }
                if (Schema::hasTable('re_property_leads')) {
                    $table->foreign('lead_id')->references('id')->on('re_property_leads')->nullOnDelete();
                }
                if (Schema::hasTable('re_agents')) {
                    $table->foreign('agent_id')->references('id')->on('re_agents')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('re_property_viewings');
        Schema::dropIfExists('re_agents');
        Schema::dropIfExists('re_agencies');
        Schema::dropIfExists('re_property_leads');
        Schema::dropIfExists('re_properties');
    }
};
