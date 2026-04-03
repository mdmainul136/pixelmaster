<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\TotpHelper;
use Inertia\Inertia;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Str;

class TenantTwoFactorController extends Controller
{
    /**
     * Show the 2FA settings page.
     */
    public function show()
    {
        $user = Auth::user();

        return Inertia::render('Tenant/Core/Profile/TwoFactor', [
            'twoFactorEnabled' => !empty($user->two_factor_secret) && !empty($user->two_factor_confirmed_at),
        ]);
    }

    /**
     * Enable 2FA: Generate secret and QR code.
     */
    public function enable(Request $request)
    {
        $user = Auth::user();
        
        $secret = $user->two_factor_secret ? decrypt($user->two_factor_secret) : null;
        
        if (!$secret) {
            $secret = TotpHelper::generateSecret();
            $user->two_factor_secret = encrypt($secret);
            $user->save();
        }

        $appName = config('app.name', 'Platform');
        $qrCodeUrl = TotpHelper::getQrCodeUrl($user->email, $secret, $appName);

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return response()->json([
            'secret' => $secret,
            'qr_code' => $qrCodeSvg,
        ]);
    }

    /**
     * Confirm 2FA setup with a code and generate recovery codes.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();
        $secret = $user->two_factor_secret ? decrypt($user->two_factor_secret) : null;

        if ($secret && TotpHelper::verify($secret, $request->code)) {
            // Generate 8 recovery codes if they don't already exist
            $recoveryCodes = collect(range(1, 8))->map(function () {
                return Str::random(10) . '-' . Str::random(10);
            })->toArray();

            $user->two_factor_confirmed_at = now();
            $user->two_factor_recovery_codes = encrypt(json_encode($recoveryCodes));
            $user->save();

            return redirect()->back()->with('success', 'Two-factor authentication enabled successfully.');
        }

        return redirect()->back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
    }

    /**
     * Get or Re-generate Recovery Codes.
     */
    public function recoveryCodes(Request $request)
    {
        $user = Auth::user();

        if (empty($user->two_factor_secret) || empty($user->two_factor_confirmed_at)) {
            return response()->json(['error' => '2FA is not enabled.'], 403);
        }

        if ($request->isMethod('post')) {
            // Generate new codes
            $recoveryCodes = collect(range(1, 8))->map(function () {
                return Str::random(10) . '-' . Str::random(10);
            })->toArray();
            
            $user->two_factor_recovery_codes = encrypt(json_encode($recoveryCodes));
            $user->save();
            
            return response()->json(['recovery_codes' => $recoveryCodes]);
        }

        // Get existing codes
        $codes = $user->two_factor_recovery_codes ? json_decode(decrypt($user->two_factor_recovery_codes), true) : [];
        return response()->json(['recovery_codes' => $codes]);
    }

    /**
     * Disable 2FA.
     */
    public function disable(Request $request)
    {
        $user = Auth::user();
        
        $user->two_factor_secret = null;
        $user->two_factor_confirmed_at = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return redirect()->back()->with('success', 'Two-factor authentication has been disabled.');
    }
}
