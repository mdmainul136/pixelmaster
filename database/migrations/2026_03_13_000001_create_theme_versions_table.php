<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Theme Versioning — stores full snapshots of tenant storefront configs.
     * Each time a tenant publishes a theme change, a version is saved here
     * so they can roll back to any previous state.
     */
    public function up(): void
    {
        Schema::create('theme_versions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->unsignedBigInteger('theme_id')->nullable();
            $table->integer('version_number');
            $table->json('snapshot')->comment('Full config_json snapshot at time of publish');
            $table->string('created_by')->nullable()->comment('User who published this version');
            $table->text('change_notes')->nullable();
            $table->timestamps();

            $table->foreign('theme_id')->references('id')->on('themes')->onDelete('set null');
            $table->unique(['tenant_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_versions');
    }
};
