<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mysql';

    public function up(): void
    {
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            // Auto-renewal tracking (others added in previous migration)
            $table->timestamp('notified_renewal_failed_at')->nullable()->after('payment_id');
            $table->timestamp('last_renewed_at')->nullable()->after('notified_renewal_failed_at');
        });
    }

    public function down(): void
    {
        Schema::connection('mysql')->table('tenant_modules', function (Blueprint $table) {
            $table->dropColumn([
                'notified_renewal_failed_at', 'last_renewed_at',
            ]);
        });
    }
};
