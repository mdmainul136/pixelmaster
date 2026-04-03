<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

/**
 * ActivityLogService
 *
 * Logs staff actions for audit purposes.
 * Stores in tenant's `staff_activity_logs` table.
 */
class ActivityLogService
{
    /**
     * Log an activity.
     *
     * @param string $action   e.g. 'created', 'updated', 'deleted', 'login', 'export'
     * @param string $module   e.g. 'ecommerce', 'pos', 'crm'
     * @param string $resource e.g. 'product', 'order', 'sale'
     * @param int|null $resourceId
     * @param array  $details  Extra metadata
     */
    public static function log(
        string $action,
        string $module,
        string $resource = '',
        ?int $resourceId = null,
        array $details = []
    ): void {
        $user = auth()->user();

        try {
            DB::table('staff_activity_logs')->insert([
                'user_id'      => $user?->id,
                'user_name'    => $user?->name ?? 'System',
                'action'       => $action,
                'module'       => $module,
                'resource'     => $resource,
                'resource_id'  => $resourceId,
                'details'      => json_encode($details),
                'ip_address'   => Request::ip(),
                'user_agent'   => Request::userAgent(),
                'created_at'   => now(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Tenant Activity Log Failed: " . $e->getMessage());
        }

        // Also log to central AuditLog
        AuditLog::create([
            'tenant_id'  => tenancy()->tenant?->id,
            'user_id'    => $user?->id,
            'event_type' => $module,
            'action'     => $action,
            'payload'    => array_merge($details, [
                'resource'    => $resource,
                'resource_id' => $resourceId,
            ]),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Log a login event.
     */
    public static function logLogin(?\App\Models\User $user = null): void
    {
        $user = $user ?: auth()->user();
        
        $details = [
            'method' => 'web',
            'status' => 'success'
        ];

        // Ensure we have a user to log even if auth() isn't hydrated yet (e.g. during login process)
        if ($user) {
            try {
                DB::table('staff_activity_logs')->insert([
                    'user_id'      => $user->id,
                    'user_name'    => $user->name,
                    'action'       => 'login',
                    'module'       => 'auth',
                    'resource'     => 'session',
                    'details'      => json_encode($details),
                    'ip_address'   => Request::ip(),
                    'user_agent'   => Request::userAgent(),
                    'created_at'   => now(),
                ]);
            } catch (\Exception $e) {
                \Log::warning("Tenant Login Activity Log Failed: " . $e->getMessage());
            }

            AuditLog::create([
                'tenant_id'  => tenancy()->tenant?->id,
                'user_id'    => $user->id,
                'event_type' => 'auth',
                'action'     => 'login',
                'payload'    => $details,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        }
    }

    /**
     * Log a logout event.
     */
    public static function logLogout(): void
    {
        self::log('logout', 'auth', 'session');
    }

    /**
     * Log a failed login attempt.
     */
    public static function logFailedLogin(string $email): void
    {
        try {
            DB::table('staff_activity_logs')->insert([
                'user_id'    => null,
                'user_name'  => $email,
                'action'     => 'failed_login',
                'module'     => 'auth',
                'resource'   => 'session',
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Tenant Failed Login Activity Log Failed: " . $e->getMessage());
        }

        // Also log to central AuditLog
        AuditLog::create([
            'tenant_id'  => tenancy()->tenant?->id,
            'user_id'    => null,
            'event_type' => 'auth',
            'action'     => 'failed_login',
            'payload'    => ['email' => $email],
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
