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
        // 1. Attributes Table (e.g., Color, Size, Material, Wood Type)
        Schema::create('ec_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Display name
            $table->string('slug')->unique(); // For API/Logic
            $table->string('type')->default('dropdown'); // dropdown, color, image, button
            $table->boolean('is_filterable')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 2. Attribute Options (e.g., Red, Blue, XL, Leather, Oak)
        Schema::create('ec_attribute_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained('ec_attributes')->onDelete('cascade');
            $table->string('value'); // Display value
            $table->string('code')->nullable(); // Hex code for color type
            $table->string('image')->nullable(); // Image path for image type
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // 3. Variant - Option Mapping (Pivot)
        // Links a specific ProductVariant to its selected options
        Schema::create('ec_variant_attribute_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('ec_product_variants')->onDelete('cascade');
            $table->foreignId('option_id')->constrained('ec_attribute_options')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['variant_id', 'option_id'], 'variant_option_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ec_variant_attribute_options');
        Schema::dropIfExists('ec_attribute_options');
        Schema::dropIfExists('ec_attributes');
    }
};
