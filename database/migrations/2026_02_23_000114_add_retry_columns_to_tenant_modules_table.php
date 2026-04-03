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
        Schema::table('tenant_modules', function (Blueprint $table) {
            $table->integer('retry_count')->default(0)->after('auto_renew');
            $table->timestamp('last_failed_at')->nullable()->after('retry_count');
        });
    }

    public function down(): void
    {
        Schema::table('tenant_modules', function (Blueprint $table) {
            $table->dropColumn(['retry_count', 'last_failed_at']);
        });
    }
};
