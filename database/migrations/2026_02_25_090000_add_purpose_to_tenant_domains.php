<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add 'purpose' column to tenant_domains table.
     * Values: website, tracking, api, storefront
     * Allows distinguishing tracking subdomains from primary website domains.
     */
    public function up(): void
    {
        Schema::table('tenant_domains', function (Blueprint $table) {
            $table->string('purpose', 20)->default('website')->after('status');
            $table->index(['tenant_id', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::table('tenant_domains', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'purpose']);
            $table->dropColumn('purpose');
        });
    }
};
