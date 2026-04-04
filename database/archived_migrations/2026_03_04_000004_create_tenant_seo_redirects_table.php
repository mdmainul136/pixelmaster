<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_url', 500);
            $table->string('to_url', 500);
            $table->smallInteger('type')->default(301);          // 301 or 302
            $table->unsignedInteger('hits')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->boolean('auto_generated')->default(false);
            $table->string('note', 255)->nullable();
            $table->timestamps();
            $table->timestamp('expires_at')->nullable();

            $table->unique('from_url');
            $table->index('hits');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_redirects');
    }
};
