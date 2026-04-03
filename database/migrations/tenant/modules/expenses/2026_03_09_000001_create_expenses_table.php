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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->string('category'); // e.g., rent, utilities, salaries, marketing, supplies, logistics, other
            $table->string('payment_method')->default('cash'); // e.g., cash, bank, mobile
            $table->enum('status', ['pending', 'approved', 'paid'])->default('pending');
            $table->string('branch_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('transaction_id')->nullable(); // Link to finance ledger if needed
            $table->json('metadata')->nullable(); // For receipt URLs, etc.
            $table->timestamps();

            $table->index('category');
            $table->index('status');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
