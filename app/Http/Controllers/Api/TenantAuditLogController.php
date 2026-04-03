<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TenantAuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs for the current tenant.
     */
    public function index(Request $request)
    {
        $tenantId = tenancy()->tenant->id;

        $query = AuditLog::with('user')
            ->where('tenant_id', $tenantId)
            ->latest();

        // Filters
        if ($request->module && $request->module !== 'all') {
            $query->where('event_type', $request->module);
        }

        if ($request->action && $request->action !== 'all') {
            $query->where('action', $request->action);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('event_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $logs = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Get statistics for the audit logs.
     */
    public function stats(Request $request)
    {
        $tenantId = tenancy()->tenant->id;

        $total = AuditLog::where('tenant_id', $tenantId)->count();
        $today = AuditLog::where('tenant_id', $tenantId)
            ->whereDate('created_at', today())
            ->count();
        $users = AuditLog::where('tenant_id', $tenantId)
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'today' => $today,
                'users' => $users
            ]
        ]);
    }
}
