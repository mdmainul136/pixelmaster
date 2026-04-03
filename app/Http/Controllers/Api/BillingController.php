<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Modules\Tracking\Services\TrackingUsageService;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class BillingController extends Controller
{
    /**
     * Find the Tenant record for a given User.
     *
     * NOTE: The `users` table does NOT have a `tenant_id` column.
     * Tenants are linked by: tenants.admin_email = users.email
     */
    private function tenantForUser($user): ?Tenant
    {
        if (!$user) return null;

        // Primary link: admin_email
        $tenant = Tenant::on('central')->where('admin_email', $user->email)->first();
        if ($tenant) return $tenant;

        // Optional fallback for custom setups
        if (isset($user->tenant_id) && $user->tenant_id) {
            return Tenant::on('central')->find($user->tenant_id);
        }

        return null;
    }

    /**
     * Multi-strategy tenant resolver.
     * Handles the session/API boundary gap for the Inertia dashboard.
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        // Strategy 1: IdentifyTenant middleware already set it
        $tenant = $request->attributes->get('tenant');
        if ($tenant instanceof Tenant) {
            \Log::debug('BillingController: tenant from middleware', ['id' => $tenant->id]);
            return $tenant;
        }

        // Strategy 2: Standard auth guards
        foreach (['web', 'sanctum', 'super_admin'] as $guard) {
            try {
                $user = auth($guard)->user();
                if ($user) {
                    $tenant = $this->tenantForUser($user);
                    if ($tenant) {
                        \Log::debug("BillingController: tenant via guard [{$guard}]", ['tenant' => $tenant->id]);
                        $this->bootTenantContext($tenant);
                        return $tenant;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        // Strategy 3: Parse `token` cookie the browser sends on every request
        $rawToken = $request->cookie('token') ?: $request->bearerToken();
        if ($rawToken && str_contains($rawToken, '|')) {
            [$tokenId, $tokenPlain] = explode('|', $rawToken, 2);
            $accessToken = PersonalAccessToken::find((int) $tokenId);
            if ($accessToken && hash_equals($accessToken->token, hash('sha256', $tokenPlain))) {
                $user = $accessToken->tokenable;
                $tenant = $this->tenantForUser($user);
                if ($tenant) {
                    \Log::debug('BillingController: tenant via token cookie', ['tenant' => $tenant->id]);
                    $this->bootTenantContext($tenant);
                    return $tenant;
                }
            }
        }

        // Strategy 4: Explicit tenant_id query/body param
        $tenantId = $request->query('tenant_id') ?: $request->input('tenant_id');
        if ($tenantId) {
            $tenant = Tenant::on('central')->find($tenantId);
            if ($tenant) {
                \Log::debug('BillingController: tenant via query param', ['tenant' => $tenant->id]);
                $this->bootTenantContext($tenant);
                return $tenant;
            }
        }

        \Log::warning('BillingController: all strategies failed', [
            'host'           => $request->getHost(),
            'has_token_cookie' => $request->hasCookie('token'),
            'has_bearer'     => !!$request->bearerToken(),
        ]);

        return null;
    }

    /**
     * Initialize tenancy and switch the DB connection for a tenant.
     */
    private function bootTenantContext(Tenant $tenant): void
    {
        try {
            if (!tenancy()->initialized || tenancy()->tenant?->id !== $tenant->id) {
                tenancy()->initialize($tenant);
            }
            app(\App\Services\DatabaseManager::class)->switchToTenantDatabase($tenant->id);
        } catch (\Exception $e) {
            \Log::warning('BillingController: bootTenantContext failed', [
                'tenant_id' => $tenant->id,
                'error'     => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get real-time usage stats for the current tenant.
     */
    public function usage(Request $request, TrackingUsageService $usageService)
    {
        try {
            $tenant = $this->resolveTenant($request);

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active workspace context found. Please ensure you are logged in to a valid workspace.'
                ], 401);
            }

            // Plan configuration
            $planKey    = $tenant->plan ?: 'free';
            $planConfig = config("plans.{$planKey}");
            $limit      = $planConfig['request_limit'] ?? 10000;

            // Monthly event usage from tenant DB (sum across all containers)
            $usageAccumulated = DB::connection('tenant_dynamic')
                ->table('ec_tracking_usage')
                ->where('date', '>=', now()->startOfMonth()->toDateString())
                ->sum('events_received');

            $suspensionThreshold = config('tracking.suspension_threshold', 1.5);
            $dropLimit = $limit * $suspensionThreshold;

            $status = 'ok';
            if ($limit > 0) {
                if ($usageAccumulated >= $dropLimit) {
                    $status = 'dropped';
                } elseif ($usageAccumulated >= $limit) {
                    $status = 'overage';
                }
            }

            $percent = $limit > 0 ? round(($usageAccumulated / $limit) * 100, 2) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'plan'          => ucfirst($planKey),
                    'usage'         => (int) $usageAccumulated,
                    'limit'         => (int) $limit,
                    'drop_limit'    => (int) $dropLimit,
                    'status'        => $status, // 'ok', 'overage', 'dropped'
                    'percent'       => $percent,
                    'tenant_id'     => $tenant->id,
                    'is_over_limit' => $usageAccumulated >= $limit,
                    'remaining'     => max(0, $limit - $usageAccumulated),
                    'reset_date'    => now()->addMonth()->startOfMonth()->toDateString(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('BillingController@usage error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch usage analytics',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
