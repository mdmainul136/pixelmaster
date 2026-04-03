<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * TenantAuth — Replaces auth:sanctum for tenant-scoped routes.
 *
 * WHY THIS EXISTS:
 * Laravel Sanctum's default middleware treats *.localhost as "stateful",
 * which forces session/cookie authentication instead of Bearer token auth.
 * After IdentifyTenant swaps the DB connection, the session guard looks
 * up cookies/sessions on the central DB → fails → returns 401.
 *
 * This middleware directly uses Auth::guard('sanctum')->user() which
 * only does token-based auth (no stateful session check), which works
 * perfectly after IdentifyTenant swaps the DB.
 */
class TenantAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // A request is for a tenant if the IdentifyTenant middleware successfully initialized a tenant
        // or if the request attributes have a tenant_id set.
        $isTenantRequest = tenancy()->initialized || $request->attributes->has('tenant_id');

        // Use sanctum for tenant requests, super_admin for central/platform requests
        $guard = $isTenantRequest ? 'sanctum' : 'super_admin';
        
        \Log::info("TenantAuth Check", [
            'host' => $request->getHost(),
            'is_tenant' => $isTenantRequest,
            'guard' => $guard,
            'has_token' => $request->hasHeader('Authorization')
        ]);
        
        $user = Auth::guard($guard)->user();

        if ($user) {
            \Log::info("TenantAuth: User authenticated successfully.", [
                'user_id' => $user->id,
                'email' => $user->email,
                'connection' => $user->getConnectionName()
            ]);
        } else {
            \Log::warning("TenantAuth: Authentication failed.", [
                'guard' => $guard,
                'token_present' => !!$request->bearerToken(),
                'host' => $request->getHost(),
            ]);
        }

        // 🛸 SPAs & LOCAL DEV FALLBACK: 
        // If on localhost/central and super_admin fails, try sanctum (User) as a fallback.
        // This allows developers to log in as a Tenant Admin on localhost without subdomains.
        if (!$user && !$isTenantRequest && ($request->getHost() === 'localhost' || $request->getHost() === '127.0.0.1')) {
            \Log::info("TenantAuth: SuperAdmin failed on localhost, trying Sanctum fallback...");
            $user = Auth::guard('sanctum')->user();
            if ($user) {
                \Log::info("TenantAuth: Sanctum fallback SUCCESS.");
            }
        }

        // 🛡️ INERTIA SESSION FALLBACK
        // If Bearer token auth via Sanctum failed, try resolving via Web Session cookies.
        // On localhost, we even try this if tenancy isn't initialized yet to bridge identification.
        if (!$user && ($isTenantRequest || $request->getHost() === 'localhost' || $request->getHost() === '127.0.0.1')) {
            $user = Auth::guard('web')->user();
            if ($user) {
                \Log::info("TenantAuth: Web session cookie fallback SUCCESS.");
            }
        }

        if (!$user) {
            \Log::warning("TenantAuth Unauthenticated", ['guard' => $guard, 'host' => $request->getHost()]);
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated (Guard: '.$guard.').',
                    'success' => false,
                ], 401);
            }

            return redirect()->guest(route('tenant.auth'));
        }

        // Set the authenticated user on the request
        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
