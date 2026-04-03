<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Helpers\TotpHelper;
use App\Models\ActivityLog; // Assuming ActivityLog exists or I can use AuditLog

/**
 * TwoFactorAuthService
 *
 * Manages TOTP-based Two-Factor Authentication for staff accounts.
 * Now uses internal TotpHelper to avoid external dependency issues.
 */
class TwoFactorAuthService
{
    /**
     * Generate a new 2FA secret for a user.
     */
    public function generateSecret(): string
    {
        return TotpHelper::generateSecret();
    }

    /**
     * Generate the QR code provisioning URI.
     */
    public function getQrCodeUrl(string $email, string $secret): string
    {
        $appName = config('app.name', 'MultiTenant');
        return TotpHelper::getQrCodeUrl($email, $secret, $appName);
    }

    /**
     * Verify a TOTP code against the user's secret.
     */
    public function verify(string $secret, string $code): bool
    {
        return TotpHelper::verify($secret, $code);
    }

    /**
     * Enable 2FA for a user.
     */
    public function enable(int $userId, string $secret): void
    {
        // Using SuperAdmin table for these settings since this is for SaaS Admin
        DB::table('super_admins')->where('id', $userId)->update([
            'two_factor_secret'     => encrypt($secret),
            'two_factor_enabled'    => true,
            'two_factor_confirmed_at' => now(),
            'updated_at'            => now(),
        ]);
        
        // Log activity if needed
    }

    /**
     * Disable 2FA for a user.
     */
    public function disable(int $userId): void
    {
        DB::table('super_admins')->where('id', $userId)->update([
            'two_factor_secret'       => null,
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
            'updated_at'              => now(),
        ]);
    }

    /**
     * Check if a user has 2FA enabled.
     */
    public function isEnabled(int $userId): bool
    {
        return (bool) DB::table('super_admins')
            ->where('id', $userId)
            ->value('two_factor_enabled');
    }

    /**
     * Get the decrypted secret for verification.
     */
    public function getSecret(int $userId): ?string
    {
        $encrypted = DB::table('super_admins')
            ->where('id', $userId)
            ->value('two_factor_secret');

        return $encrypted ? decrypt($encrypted) : null;
    }
}
