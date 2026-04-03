<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TenantAuthController extends Controller
{
    /**
     * Show the tenant auth page (login/register).
     */
    public function showAuth()
    {
        // If already authenticated, redirect to dashboard
        if (Auth::check()) {
            return redirect()->route('tenant.dashboard');
        }

        return Inertia::render('Tenant/Core/Auth');
    }

    /**
     * Handle tenant login via web session (for Inertia).
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = User::on('central')->where('email', $validated['email'])->first();

            if (!$user) {
                return back()->withErrors([
                    'email' => 'No account found with this email. Please sign up first.',
                ])->withInput(['email' => $validated['email']]);
            }

            if (!Hash::check($validated['password'], $user->password)) {
                return back()->withErrors([
                    'password' => 'Invalid credentials. Please check your password.',
                ])->withInput(['email' => $validated['email']]);
            }

            // Log the user in via web session
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            Log::info("Tenant login successful", ['user_id' => $user->id, 'email' => $user->email]);

            // Sanitize intended URL — skip asset/sourcemap requests
            $intended = session()->pull('url.intended');
            $isValidPage = $intended
                && !str_contains($intended, '.map')
                && !str_contains($intended, '.js')
                && !str_contains($intended, '.css')
                && !str_contains($intended, '.png')
                && !str_contains($intended, '.ico')
                && !str_contains($intended, '__vite')
                && str_starts_with($intended, url('/'));

            return redirect($isValidPage ? $intended : route('tenant.dashboard'));

        } catch (\Exception $e) {
            Log::error('Tenant login error: ' . $e->getMessage());
            return back()->withErrors(['email' => 'An error occurred during login. Please try again.']);
        }
    }

    /**
     * Handle tenant registration via web session (for Inertia).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        try {
            // Check if user already exists
            $existingUser = User::on('central')->where('email', $validated['email'])->first();

            if ($existingUser) {
                return back()->withErrors([
                    'email' => 'An account with this email already exists. Please sign in.',
                ])->withInput(['email' => $validated['email'], 'name' => $validated['name']]);
            }

            // Create user on central database
            $user = User::on('central')->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'admin',
                'status' => 'active',
            ]);

            // Log the user in via web session
            Auth::login($user);
            $request->session()->regenerate();

            Log::info("Tenant registration successful", ['user_id' => $user->id, 'email' => $user->email]);

            // Redirect to onboarding for new users
            return redirect()->route('tenant.onboarding');

        } catch (\Exception $e) {
            Log::error('Tenant registration error: ' . $e->getMessage());
            return back()->withErrors(['email' => 'An error occurred during registration. Please try again.']);
        }
    }

    /**
     * Logout the tenant user.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return \Inertia\Inertia::location(route('tenant.auth'));
    }
}
