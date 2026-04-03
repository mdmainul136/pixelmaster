<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Wrap the root route so it only intercepts requests on the central platform domains
foreach (config('tenancy.central_domains', ['localhost', '127.0.0.1']) as $domain) {
    Route::domain($domain)->group(function () {
        Route::get('/', function () {
            // Default to the Central/Auth landing page instead of the Filament admin
            return Inertia::render('Central/Auth');
        });

        Route::get('/auth', function () {
            return Inertia::render('Central/Auth');
        })->name('central.auth');

        Route::get('/login', function () {
            return Inertia::render('Central/Auth', [
                'google_login_enabled' => (bool) \App\Models\GlobalSetting::get('google_login_enabled', false),
                'facebook_login_enabled' => (bool) \App\Models\GlobalSetting::get('facebook_login_enabled', false),
            ]);
        })->name('central.login');

        Route::get('/onboarding', function () {
            return Inertia::render('Central/Onboarding', [
                'google_login_enabled' => (bool) \App\Models\GlobalSetting::get('google_login_enabled', false),
                'facebook_login_enabled' => (bool) \App\Models\GlobalSetting::get('facebook_login_enabled', false),
            ]);
        })->name('central.onboarding');

        Route::get('/register', function () {
            return Inertia::render('Central/Onboarding', [
                'google_login_enabled' => (bool) \App\Models\GlobalSetting::get('google_login_enabled', false),
                'facebook_login_enabled' => (bool) \App\Models\GlobalSetting::get('facebook_login_enabled', false),
            ]);
        })->name('central.register');

        Route::post('/register', [\App\Http\Controllers\Api\TenantController::class, 'register'])->name('central.register.submit');

        // Social Auth
        Route::get('/auth/google', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirectToGoogle'])->name('auth.google');
        Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
        Route::get('/auth/facebook', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirectToFacebook'])->name('auth.facebook');
        Route::get('/auth/facebook/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'handleFacebookCallback'])->name('auth.facebook.callback');

        // Dynamic Legal Pages
        Route::get('/terms', function () {
            return Inertia::render('Central/LegalPage', [
                'title'   => 'Terms of Use',
                'content' => \App\Models\GlobalSetting::get('terms_of_use', '<h1>Terms of Use</h1><p>Terms of Use content not yet configured.</p>'),
            ]);
        })->name('central.terms');

        Route::get('/privacy-notice', function () {
            return Inertia::render('Central/LegalPage', [
                'title'   => 'Privacy Notice',
                'content' => \App\Models\GlobalSetting::get('privacy_policy', '<h1>Privacy Notice</h1><p>Privacy Policy content not yet configured.</p>'),
            ]);
        })->name('central.privacy');

        // Email Verification
        Route::get('/email/verify', function () {
            return Inertia::render('Central/VerifyEmail', [
                'status' => session('status'),
            ]);
        })->middleware('auth')->name('verification.notice');

        Route::get('/email/verify/{id}/{hash}', function (\Illuminate\Foundation\Auth\EmailVerificationRequest $request) {
            $request->fulfill();
            return redirect('/dashboard');
        })->middleware(['auth', 'signed'])->name('verification.verify');

        Route::post('/email/verification-notification', function (\Illuminate\Http\Request $request) {
            $request->user()->sendEmailVerificationNotification();
            return back()->with('status', 'verification-link-sent');
        })->middleware(['auth', 'throttle:6,1'])->name('verification.send');
        // User / Client Dashboard
        Route::middleware(['auth', 'tenant.identify'])->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\User\DashboardController::class, 'index'])->name('user.dashboard');
            Route::get('/billing', fn() => redirect()->route('user.settings.billing'));
            
            // ─── Tracking Pages (sGTM Platform) ───
            Route::get('/containers', fn() => Inertia::render('Tenant/Tracking/ContainersPage'))->name('user.containers');
            Route::get('/domains', fn() => Inertia::render('Tenant/Tracking/DomainsPage'))->name('user.domains');
            Route::get('/destinations', fn() => Inertia::render('Tenant/Tracking/DestinationsPage'))->name('user.destinations');
            Route::get('/power-ups', fn() => Inertia::render('Tenant/Tracking/PowerUpsPage'))->name('user.power-ups');
            Route::prefix('analytics')->group(function () {
                Route::get('/', fn() => Inertia::render('Tenant/Tracking/AnalyticsPage'))->name('user.analytics');
                Route::get('/overview', fn() => Inertia::render('Tenant/Tracking/AnalyticsPage'))->name('user.analytics.overview');
                Route::get('/realtime', fn() => Inertia::render('Tenant/Tracking/AnalyticsPage'))->name('user.analytics.realtime');
            });
            Route::get('/event-logs', fn() => Inertia::render('Tenant/Tracking/EventLogsPage'))->name('user.event-logs');
            Route::get('/embed', fn() => Inertia::render('Tenant/Tracking/EmbedCodePage'))->name('user.embed');
            Route::get('/tracking/debugger', fn() => redirect()->route('user.sgtm.debugger', ['container_id' => 'main']));

            // ── Advanced sGTM Power-Ups ──
            Route::prefix('sgtm')->group(function () {
                Route::get('/debugger/{container_id}', [\App\Modules\Tracking\Controllers\AdvancedSgtmController::class, 'debugger'])->name('user.sgtm.debugger');
                Route::get('/attribution/{container_id}', [\App\Modules\Tracking\Controllers\AdvancedSgtmController::class, 'attribution'])->name('user.sgtm.attribution');
                Route::get('/cdp/{container_id}', [\App\Modules\Tracking\Controllers\CustomerInsightsController::class, 'index'])->name('user.sgtm.cdp');
                Route::get('/cdp/{container_id}/{identity_id}', [\App\Modules\Tracking\Controllers\CustomerInsightsController::class, 'show'])->name('user.sgtm.cdp.show');
                Route::get('/ai-insights', [\App\Modules\Tracking\Controllers\AdvancedSgtmController::class, 'aiInsights'])->name('user.sgtm.ai-insights');
                Route::get('/audience-sync', [\App\Modules\Tracking\Controllers\AudienceSyncController::class, 'index'])->name('user.sgtm.audience-sync');
                Route::post('/audience-sync', [\App\Modules\Tracking\Controllers\AudienceSyncController::class, 'sync'])->name('user.sgtm.audience-sync.trigger');
            });

            // ─── Settings ───
            Route::prefix('settings')->group(function () {
                Route::get('/', [\App\Http\Controllers\Tenant\TenantSettingsController::class, 'showGeneral'])->name('user.settings');
                Route::post('/', [\App\Http\Controllers\Tenant\TenantSettingsController::class, 'update'])->name('tenant.settings.update');
                Route::post('/rotate-secret', [\App\Http\Controllers\Tenant\TenantSettingsController::class, 'rotateSecret'])->name('tenant.settings.rotate-secret');

                // Billing — overview page with usage + history
                Route::get('/billing', fn() => Inertia::render('Tenant/Core/BillingSettingsPage'))->name('user.settings.billing');

                // Team — manage memberships and shared access
                Route::get('/team', fn() => Inertia::render('Tenant/Core/Settings/Team'))->name('user.settings.team');

                // Plans — full 5-tier pricing + comparison table
                Route::get('/plans', fn() => Inertia::render('Tenant/Core/PricingPage'))->name('user.billing.plans');
            });

            // ─── Profile ───
            Route::prefix('profile')->group(function () {
                Route::get('/', [\App\Http\Controllers\Tenant\TenantProfileController::class, 'show'])->name('tenant.profile');
                Route::get('/edit', [\App\Http\Controllers\Tenant\TenantProfileController::class, 'edit'])->name('tenant.profile.edit');
                Route::patch('/update', [\App\Http\Controllers\Tenant\TenantProfileController::class, 'update'])->name('tenant.profile.update');
                Route::put('/password', [\App\Http\Controllers\Tenant\TenantProfileController::class, 'updatePassword'])->name('tenant.profile.password');
                
                // Browser Sessions
                Route::get('/browser-sessions', [\App\Http\Controllers\Tenant\TenantBrowserSessionsController::class, 'show'])->name('tenant.profile.browser-sessions');
                Route::delete('/browser-sessions', [\App\Http\Controllers\Tenant\TenantBrowserSessionsController::class, 'destroy'])->name('tenant.profile.browser-sessions.destroy');

                // Login History
                Route::get('/login-history', [\App\Http\Controllers\Tenant\TenantLoginHistoryController::class, 'index'])->name('tenant.profile.login-history');

                // Two-Factor Auth
                Route::get('/two-factor', [\App\Http\Controllers\Tenant\TenantTwoFactorController::class, 'show'])->name('tenant.profile.two-factor');
                Route::post('/two-factor/enable', [\App\Http\Controllers\Tenant\TenantTwoFactorController::class, 'enable'])->name('tenant.profile.two-factor.enable');
                Route::post('/two-factor/confirm', [\App\Http\Controllers\Tenant\TenantTwoFactorController::class, 'confirm'])->name('tenant.profile.two-factor.confirm');
                Route::delete('/two-factor/disable', [\App\Http\Controllers\Tenant\TenantTwoFactorController::class, 'disable'])->name('tenant.profile.two-factor.disable');
                Route::match(['get', 'post'], '/two-factor/recovery-codes', [\App\Http\Controllers\Tenant\TenantTwoFactorController::class, 'recoveryCodes'])->name('tenant.profile.two-factor.recovery-codes');
            });
        });
        Route::post('/logout', function (\Illuminate\Http\Request $request) {
            \Illuminate\Support\Facades\Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect('/login');
        })->name('central.logout');

        Route::post('/auth/logout', function (\Illuminate\Http\Request $request) {
            \Illuminate\Support\Facades\Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect('/login');
        })->name('auth.logout');
    });
}
