<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PlatformAuthController extends Controller
{
    /**
     * Show the platform login view.
     * If already authenticated via super_admin_web guard, redirect straight to dashboard.
     */
    public function showLogin()
    {
        if (Auth::guard('super_admin_web')->check()) {
            return redirect()->route('platform.dashboard');
        }

        return Inertia::render('Platform/Auth/Login');
    }

    /**
     * Handle the platform login request.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::guard('super_admin_web')->validate($request->only('email', 'password'))) {
            $admin = \App\Models\SuperAdmin::where('email', $request->email)->first();

            if ($admin->has2FAEnabled()) {
                $request->session()->put('platform.auth.2fa_admin_id', $admin->id);
                $request->session()->put('platform.auth.remember', $request->boolean('remember'));
                
                return redirect(route('platform.auth.2fa', [], false));
            }

            Auth::guard('super_admin_web')->login($admin, $request->boolean('remember'));
            $request->session()->regenerate();
            
            // Generate a relative URL to prevent Inertia hard reloads on host/proxy mismatches
            return redirect(route('platform.dashboard', [], false));
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    /**
     * Show the two-factor authentication challenge view.
     */
    public function showTwoFactorChallenge(Request $request)
    {
        if (!$request->session()->has('platform.auth.2fa_admin_id')) {
            return redirect()->route('platform.login');
        }

        return Inertia::render('Platform/Auth/TwoFactorChallenge');
    }

    /**
     * Handle the two-factor authentication challenge.
     */
    public function handleTwoFactorChallenge(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $adminId = $request->session()->get('platform.auth.2fa_admin_id');
        if (!$adminId) {
            return redirect()->route('platform.login');
        }

        $admin = \App\Models\SuperAdmin::findOrFail($adminId);
        $tfa = app(\App\Services\TwoFactorAuthService::class);
        $secret = $tfa->getSecret($admin->id);

        if ($secret && $tfa->verify($secret, $request->code)) {
            Auth::guard('super_admin_web')->login($admin, $request->session()->get('platform.auth.remember', false));
            
            $request->session()->put('2fa_verified', true);
            $request->session()->forget(['platform.auth.2fa_admin_id', 'platform.auth.remember']);
            $request->session()->regenerate();

            return redirect(route('platform.dashboard', [], false));
        }

        throw ValidationException::withMessages([
            'code' => ['The provided two-factor authentication code was invalid.'],
        ]);
    }

    /**
     * Log the super admin out.
     */
    public function logout(Request $request)
    {
        Auth::guard('super_admin_web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect(route('platform.login', [], false));
    }
}
