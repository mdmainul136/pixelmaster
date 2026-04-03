<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A/B experiments: define two theme configurations to test
        Schema::create('theme_experiments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('name'); // "Summer Sale Button Color Test"
            $table->text('hypothesis')->nullable();
            $table->enum('status', ['draft', 'running', 'paused', 'completed'])->default('draft');
            $table->unsignedTinyInteger('variant_a_weight')->default(50); // % of traffic
            $table->unsignedTinyInteger('variant_b_weight')->default(50);
            $table->foreignId('variant_a_theme_id')->constrained('themes');
            $table->foreignId('variant_b_theme_id')->constrained('themes');
            $table->json('variant_a_settings')->nullable(); // Override specific settings of variant A
            $table->json('variant_b_settings')->nullable(); // Override specific settings of variant B
            $table->string('goal_event', 50)->default('conversion'); // event_type to measure
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        // Stores which variant each session was assigned to
        Schema::create('experiment_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('experiment_id')->constrained('theme_experiments')->onDelete('cascade');
            $table->string('session_id', 64)->index();
            $table->enum('variant', ['a', 'b']);
            $table->boolean('converted')->default(false);
            $table->timestamp('assigned_at');
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();

            $table->unique(['experiment_id', 'session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiment_assignments');
        Schema::dropIfExists('theme_experiments');
    }
};
