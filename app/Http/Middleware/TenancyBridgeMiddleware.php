<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenancyBridgeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenant();

        if ($tenant) {
            // 1. Regional Strategy & Defaults (Copied from legacy IdentifyTenant)
            $regions = config('tenant_regions', []);
            $tenantRegion = strtoupper($tenant->region ?: 'GLOBAL'); 
            
            // Find region config by key or by country mapping
            if (!$tenant->region && $tenant->country) {
                foreach ($regions as $key => $config) {
                    if (isset($config['countries']) && (
                        $config['countries'] === '*' || 
                        (is_array($config['countries']) && in_array($tenant->country, $config['countries']))
                    )) {
                        $tenantRegion = $key;
                        break;
                    }
                }
            }

            $regionConfig = $regions[$tenantRegion] ?? ($regions['GLOBAL'] ?? []);
            
            // Set global app config for regional awareness
            config([
                'app.tenant_region' => $tenantRegion,
                'app.currency' => $regionConfig['currency'] ?? 'USD',
                'app.locale' => $regionConfig['locale'] ?? 'en',
                'app.timezone' => $regionConfig['timezone'] ?? 'UTC',
            ]);

            // 2. Attach tenant info to request attributes (Expected by Frontend/other middleware)
            $request->attributes->set('tenant_id', $tenant->tenant_id);
            $request->attributes->set('tenant_region', $tenantRegion);
            
            $request->merge([
                'tenant' => [
                    'id' => $tenant->tenant_id,
                    'name' => $tenant->tenant_name,
                    'database' => $tenant->database_name,
                    'region' => $tenantRegion,
                    'currency' => config('app.currency'),
                    'created_at' => $tenant->created_at,
                ],
            ]);
        }

        return $next($request);
    }
}
