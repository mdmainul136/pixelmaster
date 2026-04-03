<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FALaravel\Support\Authenticator;
use PragmaRX\Google2FA\Google2FA;
use Inertia\Inertia;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorController extends Controller
{
    public function __construct(private \App\Services\TwoFactorAuthService $tfa) {}

    /**
     * Show the 2FA setup page or status.
     */
    public function index()
    {
        $admin = Auth::guard('super_admin_web')->user();

        return Inertia::render('Platform/SettingsPage', [
            'twoFactorEnabled' => $admin->two_factor_enabled && $admin->two_factor_confirmed_at !== null,
        ]);
    }

    /**
     * Enable 2FA: Generate secret and QR code.
     */
    public function enable(Request $request)
    {
        $admin = Auth::guard('super_admin_web')->user();
        
        $secret = $this->tfa->getSecret($admin->id);
        
        if (!$secret) {
            $secret = $this->tfa->generateSecret();
            // Just temporarily store in session or model without enabling yet
            $admin->two_factor_secret = encrypt($secret);
            $admin->save();
        }

        $qrCodeUrl = $this->tfa->getQrCodeUrl($admin->email, $secret);

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
     * Confirm 2FA setup with a code.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $admin = Auth::guard('super_admin_web')->user();
        $secret = $this->tfa->getSecret($admin->id);

        if ($secret && $this->tfa->verify($secret, $request->code)) {
            $this->tfa->enable($admin->id, $secret);

            return back()->with('success', 'Two-factor authentication enabled successfully.');
        }

        return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
    }

    /**
     * Disable 2FA.
     */
    public function disable(Request $request)
    {
        $admin = Auth::guard('super_admin_web')->user();
        $this->tfa->disable($admin->id);

        return back()->with('success', 'Two-factor authentication has been disabled.');
    }
}
