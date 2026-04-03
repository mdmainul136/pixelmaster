<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Staff Activity Logs
        Schema::create('staff_activity_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->default('System');
            $table->string('action', 100);
            $table->string('module', 100);
            $table->string('resource', 100)->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('action');
            $table->index('module');
            $table->index('created_at');

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        // 2FA columns on users table
        if (!Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('two_factor_secret')->nullable();
                $table->boolean('two_factor_enabled')->default(false);
                $table->timestamp('two_factor_confirmed_at')->nullable();
            });
        }

        // Enhance roles table
        if (!Schema::hasColumn('roles', 'description')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->string('description', 500)->nullable();
                $table->boolean('is_system')->default(false);
            });
        }

        // Enhance permissions table
        if (!Schema::hasColumn('permissions', 'description')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->string('description', 500)->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_activity_logs');

        if (Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['two_factor_secret', 'two_factor_enabled', 'two_factor_confirmed_at']);
            });
        }

        if (Schema::hasColumn('roles', 'description')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn(['description', 'is_system']);
            });
        }

        if (Schema::hasColumn('permissions', 'description')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
};
