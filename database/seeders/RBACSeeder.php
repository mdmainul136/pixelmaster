<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformRole;
use App\Models\PlatformPermission;
use App\Models\SuperAdmin;

class RBACSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            ['name' => 'manage-tenants', 'display_name' => 'Manage Tenants', 'group' => 'Core'],
            ['name' => 'view-analytics', 'display_name' => 'View Analytics', 'group' => 'Core'],
            ['name' => 'manage-users', 'display_name' => 'Manage Platform Users', 'group' => 'Security'],
            ['name' => 'manage-roles', 'display_name' => 'Manage Roles & Permissions', 'group' => 'Security'],
            ['name' => 'manage-settings', 'display_name' => 'Manage System Settings', 'group' => 'System'],
            ['name' => 'view-logs', 'display_name' => 'View Audit Logs', 'group' => 'System'],
        ];

        foreach ($permissions as $p) {
            PlatformPermission::updateOrCreate(['name' => $p['name']], $p);
        }

        // 2. Create Super Admin Role
        $superAdminRole = PlatformRole::updateOrCreate(
            ['name' => 'super-admin'],
            ['display_name' => 'Super Administrator', 'description' => 'Full access to the entire platform.']
        );

        // Assign all permissions to Super Admin role
        $allPermissions = PlatformPermission::all();
        $superAdminRole->permissions()->sync($allPermissions->pluck('id'));

        // 3. Assign Role to existing Admin(s)
        $admins = SuperAdmin::all();
        foreach ($admins as $admin) {
            $admin->roles()->syncWithoutDetaching([$superAdminRole->id]);
            $admin->update(['status' => 'active']);
        }
    }
}
