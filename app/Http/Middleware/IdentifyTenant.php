<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Services\DatabaseManager;
use Illuminate\Support\Facades\DB;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 0. PLATFORM BYPASS:

        // 0.1 AUTH EXCLUSIONS (Only for non-tenant identification routes)
        $path = $request->path();
        $exclusions = [
            '/', 'login', 'register', 'auth', 'email/verify',
            'api/auth/login', 'api/auth/register',
            // Note: api/v1/auth/login is NOT excluded so it can identify tenant
        ];

        foreach ($exclusions as $exclusion) {
            if ($request->is($exclusion) || $request->is($exclusion . '/*')) {
                return $next($request);
            }
        }

        // 1. Identification Logic
        $tenant = null;
        $host = $request->getHost();

        // DEV FALLBACK: Localhost testing source resolution
        if (in_array($host, ['localhost', '127.0.0.1', '::1'])) {
            $origin = $request->headers->get('Origin');
            $referer = $request->headers->get('Referer');
            $source = $origin ?: $referer;
            if ($source) {
                $parsedHost = parse_url($source, PHP_URL_HOST);
                if ($parsedHost && $parsedHost !== 'localhost' && $parsedHost !== '127.0.0.1' && $parsedHost !== '::1') {
                    $host = $parsedHost;
                }
            }
        }

        // Strategy A: Identify from domain metadata
        $domain = TenantDomain::on('central')->where('domain', $host)->first();
        if ($domain) {
            $tenant = Tenant::on('central')->find($domain->tenant_id);
        }

        // Strategy B: Header-based identification
        if (!$tenant) {
            $tenantId = $request->header('X-Tenant-ID') ?: $request->header('X-Frontend-API-Key');
            if ($tenantId) {
                $tenant = Tenant::on('central')->find($tenantId);
            }
        }

        // Strategy C: Query/Body params
        if (!$tenant) {
            $tenantId = $request->query('tenant_id') ?: $request->input('tenant_id');
            if ($tenantId) {
                $tenant = Tenant::on('central')->find($tenantId);
            }
        }

        // Strategy D: Localhost Fallback (Agrees with local Dashboard/dev flow)
        if (!$tenant && in_array($request->getHost(), ['localhost', '127.0.0.1', '::1'])) {
            // Priority 1: Identify based on User's primary tenant (if they have multiple, usually we'd use domain/header)
            $user = auth('web')->user() ?: auth('sanctum')->user();
            if ($user) {
                // First check if they ARE the owner of any tenant
                $tenant = Tenant::on('central')->where('admin_email', $user->email)->first();
                
                // If not owner, check memberships for this user
                if (!$tenant) {
                    $membership = \App\Models\TenantMembership::on('central')
                        ->where('user_id', $user->id)
                        ->where('status', 'active')
                        ->first();
                    
                    if ($membership) {
                        $tenant = Tenant::on('central')->find($membership->tenant_id);
                    }
                }
            }

            // Priority 2: Simply give the first tenant so the dashboard works
            if (!$tenant) {
                $tenant = Tenant::on('central')->first();
            }
        }

        if (!$tenant) {
            \Log::warning("Tenant Identification Failed", ['host' => $host, 'path' => $path]);
            
            if ($request->expectsJson() || $request->inertia()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant not identified.',
                ], 404);
            }

            return redirect()->guest('/login')->with('error', 'Please log in to continue.');
        }

        // 2. Initialize Tenancy
        if (!tenancy()->initialized || tenancy()->tenant->id !== $tenant->id) {
            $beforeDb = DB::connection('mysql')->getDatabaseName();
            tenancy()->initialize($tenant);
            
            app(DatabaseManager::class)->switchToTenantDatabase($tenant->id);

            $afterDb = DB::connection('mysql')->getDatabaseName();

            if ($afterDb === $beforeDb && $afterDb === config('database.connections.central.database')) {
                \Log::info("Force-swapping mysql connection for: " . $tenant->id);
                
                $tenantDb = $tenant->tenancy_db_name ?: Tenant::generateDatabaseName($tenant->id);
                config(['database.connections.mysql.database' => $tenantDb]);
                config(['database.connections.tenant_dynamic.database' => $tenantDb]);
                config(['database.connections.tenant.database' => $tenantDb]);
                
                DB::purge('mysql');
                DB::purge('tenant_dynamic');
                DB::purge('tenant');
                
                DB::reconnect('mysql');
                DB::reconnect('tenant_dynamic');
                DB::reconnect('tenant');
                
                DB::setDefaultConnection('tenant_dynamic');
                
                $afterDb = DB::connection('mysql')->getDatabaseName();
            }

            \Log::info("Tenancy Initialized. Active DB: " . $afterDb);

            \Illuminate\Support\Facades\Auth::forgetGuards();
        }

        // 3. Regional Strategy & Defaults
        $regions = config('tenant_regions', []);
        $tenantRegion = 'GLOBAL'; 
        
        foreach ($regions as $key => $config) {
            if (isset($config['countries']) && ($config['countries'] === '*' || 
                (is_array($config['countries']) && in_array($tenant->country, $config['countries'])))) {
                $tenantRegion = $key;
                break;
            }
        }

        $regionConfig = $regions[$tenantRegion] ?? ($regions['GLOBAL'] ?? []);
        
        config([
            'app.tenant_region' => $tenantRegion,
            'app.currency' => $tenant->currency_code ?: ($regionConfig['currency'] ?? 'USD'),
            'app.locale' => $tenant->locale ?: ($regionConfig['locale'] ?? 'en'),
            'app.timezone' => $tenant->timezone ?: ($regionConfig['timezone'] ?? 'UTC'),
            'app.date_format' => $tenant->date_format ?: 'Y-m-d',
        ]);

        // 4. Attach attributes & Bind to container
        app()->instance('tenant', $tenant);
        app()->instance(\App\Models\Tenant::class, $tenant);
        
        $request->attributes->set('tenant', $tenant);
        $request->attributes->set('tenant_id', $tenant->id);
        $request->attributes->set('tenant_region', $tenantRegion);
        
        $request->merge([
            'tenant' => $tenant,
            'tenant_id' => $tenant->id,
            'tenant_data' => [
                'id' => $tenant->id,
                'name' => $tenant->tenant_name,
                'database' => $tenant->database_name,
                'region' => $tenantRegion,
                'currency' => config('app.currency'),
                'created_at' => $tenant->created_at,
            ],
        ]);

        $response = $next($request);

        if ($tenant) {
            $response->headers->set('X-Tenant-Id', $tenant->id);
        }

        return $response;
    }
}
