<?php

use App\Http\Controllers\RbacController;
use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| RBAC & Security API Routes (Included in api.php under v1 prefix)
|--------------------------------------------------------------------------
*/

// These routes require tenant identification and auth (handled in api.php group)

Route::prefix('admin')->group(function () {
    
    // ── Team & Memberships ────────────────────────────────
    Route::prefix('team')->controller(TeamController::class)->group(function () {
        Route::get('/',                 'index');          // List members
        Route::post('/invite',          'invite');         // Invite a member
        Route::delete('/members/{id}',  'removeMember');   // Remove member or cancel invite
        Route::post('/transfer-owner',  'transferOwnership'); // Transfer ownership
    });

    // ── Roles & Permissions ───────────────────────────────
    Route::prefix('rbac')->group(function () {
        Route::get('/roles',           [RbacController::class, 'roles']);
        Route::post('/roles',          [RbacController::class, 'createRole']);
        Route::put('/roles/{id}',      [RbacController::class, 'updateRole']);
        Route::delete('/roles/{id}',   [RbacController::class, 'deleteRole']);
        
        Route::get('/permissions',     [RbacController::class, 'permissions']);
        
        Route::post('/users/{userId}/roles',       [RbacController::class, 'assignUserRoles']);
        Route::post('/users/{userId}/permissions', [RbacController::class, 'assignUserPermissions']);
        
        Route::get('/activity-logs',   [RbacController::class, 'activityLogs']);
    });
});

Route::prefix('auth/2fa')->group(function () {
    Route::post('/setup',    [RbacController::class, 'setup2FA']);
    Route::post('/confirm',  [RbacController::class, 'confirm2FA']);
    Route::post('/verify',   [RbacController::class, 'verify2FA']);
    Route::post('/disable',  [RbacController::class, 'disable2FA']);
});
