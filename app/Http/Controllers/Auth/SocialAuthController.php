<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use App\Models\GlobalSetting;

class SocialAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirectToGoogle()
    {
        if (!GlobalSetting::get('google_login_enabled', false)) {
            return redirect()->route('central.login')->with('error', 'Google login is currently disabled.');
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google Callback.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Find or Create user in Central DB
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Auto-create user if approved in plan
                $user = User::create([
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'password'          => Hash::make(Str::random(24)),
                    'google_id'         => $googleUser->getId(),
                    'google_token'      => $googleUser->token,
                    'avatar'            => $googleUser->getAvatar(),
                    'email_verified_at' => now(), // Socialite users are verified by Google
                ]);
            } else {
                // Update existing user with Google info
                $user->update([
                    'google_id'    => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'avatar'       => $googleUser->getAvatar(),
                ]);
            }

            Auth::login($user);

            // Redirect logic: Check if user has an associated tenant/workspace
            // For now, if no tenant, redirect to onboarding, else to dashboard
            $tenantId = $user->tenant_id ?? session('tenant_id');
            
            if ($tenantId && Tenant::where('id', $tenantId)->exists()) {
                $tenant = Tenant::find($tenantId);
                return redirect()->to(route('platform.dashboard')); // Simplified for now
            }

            return redirect()->route('central.onboarding');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Social Auth Error: " . $e->getMessage());
            return redirect()->route('central.login')->with('error', 'Authentication failed.');
        }
    }

    /**
     * Redirect to Facebook OAuth.
     */
    public function redirectToFacebook()
    {
        if (!GlobalSetting::get('facebook_login_enabled', false)) {
            return redirect()->route('central.login')->with('error', 'Facebook login is currently disabled.');
        }

        return Socialite::driver('facebook')->redirect();
    }

    /**
     * Handle Facebook Callback.
     */
    public function handleFacebookCallback()
    {
        try {
            $facebookUser = Socialite::driver('facebook')->user();
            
            $user = User::where('email', $facebookUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name'              => $facebookUser->getName(),
                    'email'             => $facebookUser->getEmail(),
                    'password'          => Hash::make(Str::random(24)),
                    'email_verified_at' => now(),
                    'avatar'            => $facebookUser->getAvatar(),
                ]);
            }

            Auth::login($user);
            return redirect()->route('central.onboarding');

        } catch (\Exception $e) {
            return redirect()->route('central.login')->with('error', 'Authentication failed.');
        }
    }
}
