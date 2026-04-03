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
        // 1. Roles Table
        Schema::create('platform_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'super-admin', 'editor', 'financial-manager'
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Permissions Table
        Schema::create('platform_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'manage-tenants', 'view-billing'
            $table->string('group'); // e.g., 'tenants', 'users', 'billing'
            $table->string('display_name');
            $table->timestamps();
        });

        // 3. Pivot: Role -> Permission
        Schema::create('platform_role_permission', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('platform_roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('platform_permissions')->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        // 4. Pivot: SuperAdmin -> Role
        Schema::create('platform_admin_role', function (Blueprint $table) {
            $table->foreignId('admin_id')->constrained('super_admins')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('platform_roles')->onDelete('cascade');
            $table->primary(['admin_id', 'role_id']);
        });

        // 5. Teams
        Schema::create('platform_teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 6. Departments
        Schema::create('platform_departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('platform_teams')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        // Update super_admins to follow team/department structure
        Schema::table('super_admins', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable()->constrained('platform_teams')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('platform_departments')->onDelete('set null');
            $table->string('status')->default('active'); // active, suspended, pending
        });

        // 7. Invitations
        Schema::create('super_admin_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('token')->unique();
            $table->foreignId('role_id')->constrained('platform_roles');
            $table->foreignId('team_id')->nullable()->constrained('platform_teams');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
            $table->dropForeign(['department_id']);
            $table->dropColumn(['team_id', 'department_id', 'status']);
        });
        
        Schema::dropIfExists('super_admin_invitations');
        Schema::dropIfExists('platform_departments');
        Schema::dropIfExists('platform_teams');
        Schema::dropIfExists('platform_admin_role');
        Schema::dropIfExists('platform_role_permission');
        Schema::dropIfExists('platform_permissions');
        Schema::dropIfExists('platform_roles');
    }
};
