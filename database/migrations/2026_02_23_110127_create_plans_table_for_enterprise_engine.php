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
        Schema::connection('mysql')->create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // free, pro, enterprise
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->json('allowed_modules')->nullable(); // ['ecommerce', 'crm']
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('plans');
    }
};
