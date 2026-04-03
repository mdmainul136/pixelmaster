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
        Schema::table('ec_customers', function (Blueprint $table) {
            $table->string('sentiment_score')->nullable()->after('loyalty_tier'); // positive, neutral, negative
            $table->string('rfm_segment')->nullable()->after('sentiment_score'); // Champion, At Risk, etc.
            $table->timestamp('last_engagement_at')->nullable()->after('rfm_segment');
            $table->json('crm_metadata')->nullable()->after('last_engagement_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ec_customers', function (Blueprint $table) {
            $table->dropColumn([
                'sentiment_score',
                'rfm_segment',
                'last_engagement_at',
                'crm_metadata'
            ]);
        });
    }
};
