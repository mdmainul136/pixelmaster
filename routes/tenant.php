<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes — sGTM Tracking Platform
|--------------------------------------------------------------------------
|
| Subdomains belong strictly to User Workspaces (Containers).
| They do NOT serve UI dashboards. They only serve tracking pixels,
| scripts (gtag.js, pixelmaster.js), and data collection API endpoints.
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {

    // ─── Tracking Script Delivery ───
    Route::get('/gtm.js', function () {
        return response("console.log('sGTM proxy script load')")->header('Content-Type', 'application/javascript');
    });

    // ─── Data Collection API ───
    Route::post('/g/collect', function() {
        return response()->json(['status' => 'success', 'message' => 'Event collected on server container']);
    });

    // ─── Health check for the specific container ───
    Route::get('/health', function () {
        $tenant = tenant();
        return response()->json([
            'status' => 'OK',
            'container_id' => $tenant->id ?? 'unknown',
            'domain' => $tenant->domain ?? 'unknown'
        ]);
    });

    // Drop any incoming request to the root or sub-paths that aren't defined
    // We do NOT redirect to a UI anymore.
    Route::get('/{any}', function() {
        return response()->json(['error' => 'Not Found. This domain is for tag manager collection only.'], 404);
    })->where('any', '.*');
});
