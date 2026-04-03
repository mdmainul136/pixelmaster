<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackTenantActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only track if tenant is identified
        $tenantId = $request->attributes->get('tenant_id');
        
        if ($tenantId) {
            try {
                // We need the numeric ID. IdentifyTenant might have stored the whole model in some internal attribute?
                // Let's find it or fetch it.
                $tenant = \App\Models\Tenant::find($tenantId);
                
                if ($tenant) {
                    $hourWindow = now()->startOfHour();
                    
                    /* 
                    // Temporarily disabled due to missing TenantActivityLog model
                    \App\Models\TenantActivityLog::updateOrCreate(
                        [
                            'tenant_id'   => $tenant->id,
                            'hour_window' => $hourWindow,
                        ],
                        [
                            'request_count' => \Illuminate\Support\Facades\DB::raw('request_count + 1'),
                        ]
                    );
                    */
                }
            } catch (\Throwable $e) {
                // Fail silently to not break the request
                \Illuminate\Support\Facades\Log::warning("Activity tracking failed for tenant $tenantId: " . $e->getMessage());
            }
        }

        return $response;
    }
}
