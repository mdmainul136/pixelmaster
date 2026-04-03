<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SuperAdminAuthController extends Controller
{
    /**
     * Super admin login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $superAdmin = SuperAdmin::where('email', $request->email)->first();

        if (!$superAdmin || !Hash::check($request->password, $superAdmin->password)) {
            ActivityLogService::logFailedLogin($request->email);
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$superAdmin->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive'
            ], 403);
        }

        // Check if 2FA is enabled
        if ($superAdmin->has2FAEnabled()) {
            return response()->json([
                'success' => true,
                'requires_2fa' => true,
                'user_id' => $superAdmin->id,
                'message' => 'Two-factor authentication required'
            ]);
        }

        // Create token
        $token = $superAdmin->createToken('super-admin-token')->plainTextToken;

        // Update last login
        $superAdmin->updateLastLogin();

        // Log successful login
        ActivityLogService::logLogin();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'super_admin' => [
                    'id' => $superAdmin->id,
                    'name' => $superAdmin->name,
                    'email' => $superAdmin->email,
                    'role' => $superAdmin->role,
                ],
                'token' => $token,
            ]
        ]);
    }

    /**
     * 2FA: Verify Login Code
     */
    public function verify2FALogin(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:super_admins,id',
            'code' => 'required|digits:6',
        ]);

        $superAdmin = SuperAdmin::find($request->user_id);
        $service = app(\App\Services\TwoFactorAuthService::class);
        $secret = $service->getSecret($superAdmin->id);

        if ($service->verify($secret, $request->code)) {
            // Create token
            $token = $superAdmin->createToken('super-admin-token')->plainTextToken;

            // Update last login
            $superAdmin->updateLastLogin();

            // Log successful login
            ActivityLogService::logLogin();

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'super_admin' => [
                        'id' => $superAdmin->id,
                        'name' => $superAdmin->name,
                        'email' => $superAdmin->email,
                        'role' => $superAdmin->role,
                    ],
                    'token' => $token,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid 2FA code'
        ], 401);
    }

    /**
     * Get current super admin
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'last_login_at' => $request->user()->last_login_at,
            ]
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $superAdmin = $request->user();

        if (!Hash::check($request->current_password, $superAdmin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $superAdmin->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * 2FA: Generate Secret & QR Code
     */
    public function setup2FA(Request $request)
    {
        $service = app(\App\Services\TwoFactorAuthService::class);
        $secret = $service->generateSecret();
        $qrCodeUrl = $service->getQrCodeUrl($request->user()->email, $secret);

        return response()->json([
            'success' => true,
            'data' => [
                'secret' => $secret,
                'qr_code_url' => $qrCodeUrl
            ]
        ]);
    }

    /**
     * 2FA: Verify and Enable
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'secret' => 'required',
            'code' => 'required|digits:6',
        ]);

        $service = app(\App\Services\TwoFactorAuthService::class);
        
        if ($service->verify($request->secret, $request->code)) {
            $service->enable($request->user()->id, $request->secret);

            return response()->json([
                'success' => true,
                'message' => '2FA enabled successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid verification code'
        ], 400);
    }

    /**
     * 2FA: Disable
     */
    public function disable2FA(Request $request)
    {
        $service = app(\App\Services\TwoFactorAuthService::class);
        $service->disable($request->user()->id);

        return response()->json([
            'success' => true,
            'message' => '2FA disabled successfully'
        ]);
    }

    /**
     * Update security settings (Session timeout, etc.)
     */
    public function updateSecuritySettings(Request $request)
    {
        $request->validate([
            'session_lifetime' => 'nullable|integer|min:15|max:10080',
            'security_settings' => 'nullable|array',
        ]);

        $superAdmin = $request->user();
        $superAdmin->update($request->only(['session_lifetime', 'security_settings']));

        return response()->json([
            'success' => true,
            'message' => 'Security settings updated successfully'
        ]);
    }

    /**
     * Update Admin Profile
     */
    public function updateProfile(Request $request)
    {
        $superAdmin = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:super_admins,email,' . $superAdmin->id,
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|string', // Base64 or URL for now
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $superAdmin->update($request->only(['name', 'email', 'phone', 'profile_image']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $superAdmin
        ]);
    }

    /**
     * Update Organization Details
     */
    public function updateOrganization(Request $request)
    {
        $superAdmin = $request->user();
        
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'company_address' => 'nullable|string|max:255',
            'company_city_zip' => 'nullable|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_logo' => 'nullable|string',
            'favicon' => 'nullable|string',
            'timezone' => 'nullable|string',
            'locale' => 'nullable|string',
            'date_format' => 'nullable|string',
            'time_format' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $superAdmin->update($request->only([
            'company_name', 'company_address', 'company_city_zip', 'company_email', 'company_phone',
            'company_logo', 'favicon', 'timezone', 'locale', 'date_format', 'time_format'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Organization settings updated successfully',
            'data' => $superAdmin
        ]);
    }

    /**
     * Login History (Audit logs subset)
     */
    public function loginHistory(Request $request)
    {
        $logs = \App\Models\AuditLog::where('user_id', $request->user()->id)
            ->whereIn('event_type', ['auth', 'login', 'logout'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Get Unified Configuration (Brings organization + profile together)
     */
    public function getConfig(Request $request)
    {
        $admin = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'organization' => [
                    'company_name' => $admin->company_name,
                    'company_address' => $admin->company_address,
                    'company_city_zip' => $admin->company_city_zip,
                    'company_email' => $admin->company_email,
                    'company_phone' => $admin->company_phone,
                    'company_logo' => $admin->company_logo,
                    'favicon' => $admin->favicon,
                    'timezone' => $admin->timezone ?? 'UTC',
                    'locale' => $admin->locale ?? 'en',
                    'date_format' => $admin->date_format ?? 'Y-m-d',
                    'time_format' => $admin->time_format ?? 'H:i:s',
                ],
                'profile' => [
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'phone' => $admin->phone,
                    'profile_image' => $admin->profile_image,
                ],
                'session_lifetime' => $admin->session_lifetime,
                'security_settings' => $admin->security_settings,
                'two_factor_enabled' => $admin->has2FAEnabled(),
            ]
        ]);
    }

    /**
     * Get Notification Preferences
     */
    public function getNotificationPreferences(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->notification_preferences ?? [
                'email_notifications' => true,
                'push_notifications' => true,
                'marketing_emails' => false,
                'security_alerts' => true,
                'weekly_reports' => true,
                'campaign_analytics' => true,
            ]
        ]);
    }

    /**
     * Update Notification Preferences
     */
    public function updateNotificationPreferences(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array'
        ]);

        $admin = $request->user();
        $current = $admin->notification_preferences ?? [];
        $new = array_merge($current, $request->preferences);
        
        $admin->update(['notification_preferences' => $new]);

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated',
            'data' => $new
        ]);
    }
}
