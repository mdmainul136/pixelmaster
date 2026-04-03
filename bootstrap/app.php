<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/platform.php'));
        },
    )
    ->withCommands([
        \App\Modules\Tracking\Commands\SgtmCheckQuotasCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function ($request) {
            // For platform routes, only redirect to login if NOT authenticated via super_admin_web guard
            if ($request->is('platform/*')) {
                return '/platform/login';
            }
            return '/login';
        });

        $middleware->redirectUsersTo(function ($request) {
            // If logged in via SUPER ADMIN guard, always go to Platform
            if (auth('super_admin_web')->check()) {
                return '/platform/dashboard';
            }

            // If logged in via standard WEB guard, always go to Tenant Dashboard
            if (auth('web')->check()) {
                return '/dashboard';
            }

            // Default fallback based on path if somehow no guard identifies
            return $request->is('platform/*') ? '/platform/dashboard' : '/dashboard';
        });

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\HandleImpersonation::class,
            \App\Http\Middleware\DynamicMailConfiguration::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'settings/*',
            'ior/public/*',
            'api/v1/auth/*',
            'api/v1/super-admin/login',
            'api/v1/stripe/webhook',
        ]);

        // Dynamic CORS for tenant subdomains and custom domains
        $middleware->prepend(\App\Http\Middleware\DynamicCors::class);

        // Stateful API middleware for Sanctum integration with Inertia Cookies
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Alias for billing, quota & RBAC
        $middleware->alias([
            'tenant.auth'        => \App\Http\Middleware\TenantAuth::class,
            'module.access'      => \App\Http\Middleware\FeatureEnforcementMiddleware::class,
            'quota.enforce'      => \App\Http\Middleware\EnforceDatabaseQuota::class,
            'tenant.permission'  => \App\Http\Middleware\AuthorizeTenantPermission::class,
            'permission'         => \App\Http\Middleware\RequirePermission::class,
            'role'               => \App\Http\Middleware\RequireRole::class,
            'module.rbac'        => \App\Http\Middleware\RequireModuleAccess::class,
            '2fa'                => \App\Http\Middleware\Enforce2FA::class,
            'log.activity'       => \App\Http\Middleware\LogStaffActivity::class,
            'tenant.url'         => \App\Http\Middleware\IdentifyTenantByUrl::class,
            'advanced_quota'     => \App\Http\Middleware\EnforceAdvancedQuota::class,
            'track_activity'     => \App\Http\Middleware\TrackTenantActivity::class,
            'feature.enforce'    => \App\Http\Middleware\FeatureEnforcementMiddleware::class,
            'tenancy.domain'     => \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            'tenancy.subdomain'  => \Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain::class,
            'tenancy.bridge'     => \App\Http\Middleware\TenancyBridgeMiddleware::class,
            'db.quota'           => \App\Http\Middleware\DbQuotaMiddleware::class,
            'tenant.identify'    => \App\Http\Middleware\IdentifyTenant::class,
            'tenant.payment'     => \App\Http\Middleware\CheckPayment::class,
            'firewall'           => \App\Http\Middleware\FirewallMiddleware::class,
            'enforce.quota'      => \App\Http\Middleware\EnforceResourceQuota::class,
            'performance.monitor' => \App\Http\Middleware\PerformanceMonitoring::class,
            'compress.api'        => \App\Http\Middleware\CompressApiResponse::class,
            'rate-limit'          => \App\Http\Middleware\GlobalRateLimitMiddleware::class,
            'impersonate'         => \App\Http\Middleware\HandleImpersonation::class,
            'platform.admin'      => \App\Http\Middleware\EnsurePlatformAdmin::class,
            'tracking.quota'      => \App\Modules\Tracking\Middleware\EnforceTrackingQuota::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please provide a valid Bearer Token.',
                ], 401);
            }

            // Redirect platform routes to the platform login page
            if ($request->is('platform/*')) {
                return redirect()->guest('/platform/login');
            }

            // Default: let Laravel handle other web routes
            return null;
        });
    })->create();
