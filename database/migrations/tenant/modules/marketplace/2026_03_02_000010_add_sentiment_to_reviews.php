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
        Schema::table('mkp_reviews', function (Blueprint $table) {
            $table->decimal('sentiment_score', 3, 2)->nullable()->after('rating');
            $table->string('sentiment_label')->nullable()->after('sentiment_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mkp_reviews', function (Blueprint $table) {
            $table->dropColumn(['sentiment_score', 'sentiment_label']);
        });
    }
};
