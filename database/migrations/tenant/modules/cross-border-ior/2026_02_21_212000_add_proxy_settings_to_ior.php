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
        Schema::table('ior_scraper_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('ior_scraper_settings', 'use_proxy')) {
                $table->boolean('use_proxy')->default(false)->after('is_active');
                $table->string('proxy_type')->default('shared'); // shared, dedicated, rotating
                $table->string('proxy_host')->nullable();
                $table->string('proxy_port')->nullable();
                $table->string('proxy_user')->nullable();
                $table->string('proxy_password')->nullable();
                $table->timestamp('proxy_expires_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ior_scraper_settings', function (Blueprint $table) {
            $table->dropColumn([
                'use_proxy',
                'proxy_type',
                'proxy_host',
                'proxy_port',
                'proxy_user',
                'proxy_password',
                'proxy_expires_at'
            ]);
        });
    }
};
