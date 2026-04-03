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
        Schema::connection('central')->table('users', function (Blueprint $table) {
            // Email Verification
            if (!Schema::connection('central')->hasColumn('users', 'email_verification_code')) {
                $table->string('email_verification_code', 6)->nullable()->after('email');
            }
            if (!Schema::connection('central')->hasColumn('users', 'email_verification_expires_at')) {
                $table->timestamp('email_verification_expires_at')->nullable()->after('email_verification_code');
            }

            // Role & Status
            if (!Schema::connection('central')->hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'manager', 'user'])->default('user')->after('password');
            }
            if (!Schema::connection('central')->hasColumn('users', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('role');
            }

            // POS / Branch Fields
            if (!Schema::connection('central')->hasColumn('users', 'pin_code')) {
                $table->string('pin_code', 4)->nullable()->after('status');
            }
            if (!Schema::connection('central')->hasColumn('users', 'branch_id')) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('pin_code');
            }
            
            // Sync 2FA defaults (some versions have YES null, tenant has NO null)
            $table->boolean('two_factor_enabled')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('central')->table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verification_code',
                'email_verification_expires_at',
                'role',
                'status',
                'pin_code',
                'branch_id'
            ]);
        });
    }
};
