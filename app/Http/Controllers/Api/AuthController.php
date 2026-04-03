<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        try {
            // Check if user exists (Explicitly use CENTRAL database)
            $existingUser = User::on('central')->where('email', $validated['email'])->first();

            if ($existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User already exists with this email',
                ], 400);
            }

            // Create user using Eloquent (FORCED TO CENTRAL)
            $user = User::on('central')->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'], // Removed Hash::make() to avoid double-hashing with model cast
                'role' => 'admin', // Default to admin for the first user/owner
                'status' => 'active',
            ]);

            // Create Sanctum Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'token' => $token,
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('User registration error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error registering user',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Login user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        try {
            // Get user using Eloquent (Explicitly use CENTRAL database)
            $user = User::on('central')->where('email', $validated['email'])->first();

            if (!$user) {
                ActivityLogService::logFailedLogin($validated['email']);
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found. Would you like to create one?',
                    'requires_onboarding' => true,
                    'email' => $validated['email']
                ], 404);
            }

            // Check password
            if (!Hash::check($validated['password'], $user->password)) {
                ActivityLogService::logFailedLogin($validated['email']);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            // Check email verification
            if (config('tenant_email.require_email_verification', true) && !$user->email_verified_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your email address is not verified.',
                    'requires_verification' => true,
                    'email' => $user->email,
                ], 403);
            }

            // Generate Sanctum Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Log successful login
            ActivityLogService::logLogin($user);

            // Establish Web Session for Inertia/Dashboard compatibility
            Auth::login($user, true);

            // Find associated tenant (for redirection handover)
            $explicitTenantId = $request->input('tenant_id');
            if ($request->filled('tenant_id')) {
                $tenant = \App\Models\Tenant::on('central')->find($explicitTenantId);
                if (!$tenant) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid Store ID'
                    ], 400);
                }
            } else {
                $tenant = \App\Models\Tenant::on('central')->where('admin_email', $user->email)->first();
            }

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'token' => $token,
                    'tenant_id' => $tenant ? $tenant->id : null,
                    'tenant_domain' => $tenant ? ($tenant->domain ?? $tenant->id . '.localhost') : null,
                    'redirect_url' => '/dashboard',
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error logging in',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Verify email with OTP code.
     */
    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        try {
            $user = User::on('central')->where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            if ($user->email_verified_at) {
                return response()->json(['success' => true, 'message' => 'Email already verified']);
            }

            if ($user->email_verification_code !== $validated['code']) {
                return response()->json(['success' => false, 'message' => 'Invalid verification code'], 422);
            }

            if (now()->gt($user->email_verification_expires_at)) {
                return response()->json(['success' => false, 'message' => 'Verification code has expired'], 422);
            }

            $user->update([
                'email_verified_at' => now(),
                'email_verification_code' => null,
                'email_verification_expires_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully. You can now log in.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Verification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error verifying email'], 500);
        }
    }

    /**
     * Resend verification OTP code.
     */
    public function resendVerification(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $user = User::on('central')
                ->where('email', $validated['email'])
                ->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            if ($user->email_verified_at) {
                return response()->json(['success' => true, 'message' => 'Email already verified']);
            }

            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $expiry = now()->addMinutes(config('tenant_email.verification_code_expiry_minutes', 30));

            $user->update([
                'email_verification_code' => $otp,
                'email_verification_expires_at' => $expiry,
            ]);

            // Get tenant from context (IdentifyTenant middleware adds it)
            $tenantId = $request->input('tenant')['id'];
            $tenant = \App\Models\Tenant::find($tenantId);

            if ($tenant) {
                \Illuminate\Support\Facades\Mail::to($user->email)
                    ->send(new \App\Mail\EmailVerification(
                        $tenant->tenant_name,
                        $user->email,
                        $otp,
                        'http://' . $tenant->domain . '/verify-email'
                    ));
                
                \Illuminate\Support\Facades\Log::info("Verification OTP resent for {$user->email} (Tenant: {$tenantId}): {$otp}");
            }

            return response()->json([
                'success' => true,
                'message' => 'A new verification code has been sent to your email.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error resending verification code'], 500);
        }
    }

    /**
     * Check verification status.
     */
    public function checkVerificationStatus(Request $request)
    {
        $email = $request->query('email');
        if (!$email) {
            return response()->json(['success' => false, 'message' => 'Email required'], 400);
        }

        try {
            $user = User::on('central')
                ->where('email', $email)
                ->first();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            return response()->json([
                'success' => true,
                'is_verified' => !is_null($user->email_verified_at),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error checking status'], 500);
        }
    }

    /**
     * Logout user (revoke token).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Attempt to get user manually via sanctum guard to avoid middleware 401 trap
            $user = $request->user('sanctum');
            
            if ($user && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'message' => 'Session cleared locally',
            ]);
        }
    }

    /**
     * Get current authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Get user error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching user',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }


}
