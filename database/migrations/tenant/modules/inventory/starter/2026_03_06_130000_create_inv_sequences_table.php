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
        Schema::create('inv_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., 'serial_number', 'batch_number'
            $table->string('prefix')->nullable(); // e.g., 'SN-'
            $table->string('suffix')->nullable();
            $table->integer('padding')->default(4); // e.g., 0001
            $table->bigInteger('last_value')->default(0);
            $table->string('template')->default('{PREFIX}{NUMBER}'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inv_sequences');
    }
};
