<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Platform Admins MUST be authenticated via the super_admin_web guard.
        // We no longer allow the standard 'web' guard (Tenants) to access the platform.
        if (! auth('super_admin_web')->check()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized access. Platform Admins only.'], 403);
            }
            
            return redirect('/dashboard')->with('error', 'Access denied. You must be logged in as a Platform Admin.');
        }

        return $next($request);
    }
}
