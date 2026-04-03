<?php

namespace App\Traits;

trait HasPlatformAccess
{
    /**
     * Get all roles for the admin.
     */
    public function roles()
    {
        return $this->belongsToMany(\App\Models\PlatformRole::class, 'platform_admin_role', 'admin_id', 'role_id');
    }

    /**
     * Check if the admin has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    /**
     * Check if the admin has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->roles()->whereHas('permissions', function($q) use ($permission) {
            $q->where('name', $permission);
        })->exists();
    }

    /**
     * Get all permissions direct or via roles.
     */
    public function getAllPermissions()
    {
        return \App\Models\PlatformPermission::whereHas('roles', function($q) {
            $q->whereIn('id', $this->roles()->pluck('id'));
        })->get();
    }

    /**
     * Check for multiple permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) return true;
        }
        return false;
    }
}
