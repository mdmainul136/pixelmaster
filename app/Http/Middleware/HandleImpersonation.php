<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class HandleImpersonation
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Session::has('impersonated_by')) {
            // We are in impersonation mode.
            // Inertia or global views might need to know we are impersonating
            view()->share('isImpersonating', true);
            view()->share('originalAdminId', Session::get('impersonated_by'));
        }

        return $next($request);
    }
}
