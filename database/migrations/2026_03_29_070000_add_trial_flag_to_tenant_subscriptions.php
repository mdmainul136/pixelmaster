<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'central';

    public function up(): void
    {
        Schema::connection('central')->table('tenant_subscriptions', function (Blueprint $table) {
            // Explicit trial flag — separate from status for clarity
            $table->boolean('trial')->default(false)->after('billing_cycle');
            // Track dunning attempts for past_due recovery
            $table->unsignedTinyInteger('dunning_attempts')->default(0)->after('auto_renew');
            // When the trial was explicitly started
            $table->timestamp('trial_started_at')->nullable()->after('trial_ends_at');
        });
    }

    public function down(): void
    {
        Schema::connection('central')->table('tenant_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['trial', 'dunning_attempts', 'trial_started_at']);
        });
    }
};
