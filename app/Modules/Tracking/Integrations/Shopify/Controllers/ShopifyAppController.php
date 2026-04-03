<?php

namespace App\Modules\Tracking\Integrations\Shopify\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\Integrations\Shopify\Models\ShopifyShop;
use App\Modules\Tracking\Integrations\Shopify\Services\ShopifyService;
use App\Models\Tracking\TrackingContainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ShopifyAppController (Integrations Identity)
 * 
 * Handles Admin UI actions for the Shopify integration.
 */
class ShopifyAppController extends Controller
{
    public function __construct(
        private ShopifyService $shopifyService
    ) {}

    /**
     * Complete the setup for a Shopify shop.
     * POST /api/tracking/admin/shops/{id}/setup
     */
    public function setup(int $id)
    {
        $shop = ShopifyShop::findOrFail($id);
        
        $results = $this->shopifyService->completeSetup($shop);

        return response()->json([
            'success'   => true,
            'message'   => 'Shop setup completed',
            'details'   => $results
        ]);
    }

    /**
     * Manually trigger product catalog sync from Shopify Admin.
     * POST /api/tracking/admin/shops/{id}/sync-products
     */
    public function syncProducts(int $id)
    {
        $shop = ShopifyShop::findOrFail($id);
        
        if (!$shop->isFullyConfigured()) {
            return response()->json(['error' => 'Shop is not fully configured'], 400);
        }

        $result = $this->shopifyService->syncProducts($shop);

        return response()->json([
            'success' => true,
            'message' => "Successfully synced {$result['count']} products from Shopify",
            'count'   => $result['count']
        ]);
    }

    /**
     * Get the current status of the Shopify integration.
     * GET /api/tracking/admin/shops/{id}/status
     */
    public function status(int $id)
    {
        $shop = ShopifyShop::findOrFail($id);

        return response()->json([
            'is_active' => $shop->is_active,
            'scripts'   => $shop->script_installed,
            'webhooks'  => $shop->webhooks_registered,
            'container_id' => $shop->tracking_container_id,
            'last_sync' => $shop->updated_at->toRfc3339String(),
        ]);
    }

    /**
     * Disconnect the shop from the tracking system.
     * DELETE /api/tracking/admin/shops/{id}
     */
    public function disconnect(int $id)
    {
        $shop = ShopifyShop::findOrFail($id);
        $shop->markUninstalled();

        return response()->json([
            'success' => true,
            'message' => 'Shop disconnected successfully'
        ]);
    }

    /**
     * Show the Shopify App dashboard (Embedded).
     * GET /api/tracking/shopify/dashboard
     */
    public function index(Request $request)
    {
        $shopDomain = $request->get('shop');
        $shop = ShopifyShop::where('shop_domain', $shopDomain)->firstOrFail();

        return \Inertia\Inertia::render('Tracking/Integrations/Shopify/ShopifyDashboard', [
            'shop' => [
                'id'            => $shop->id,
                'domain'        => $shop->shop_domain,
                'is_active'     => $shop->is_active,
                'last_sync'     => $shop->updated_at->diffForHumans(),
                'container_id'  => $shop->tracking_container_id,
            ]
        ]);
    }

    /**
     * Handle Shopify OAuth callback.
     * GET /api/tracking/shopify/callback
     */
    public function callback(Request $request)
    {
        $shopDomain = $request->get('shop');
        $code       = $request->get('code');
        $state      = $request->get('state');

        if (!$shopDomain || !$code) {
            return redirect()->route('dashboard')->with('error', 'Invalid Shopify callback');
        }

        // Exchange the authorization code for a permanent access token
        $tokenResponse = \Illuminate\Support\Facades\Http::post("https://{$shopDomain}/admin/oauth/access_token", [
            'client_id'     => config('services.shopify.api_key'),
            'client_secret' => config('services.shopify.api_secret'),
            'code'          => $code,
        ]);

        if (!$tokenResponse->successful()) {
            Log::error('[Shopify OAuth] Token exchange failed', [
                'shop'   => $shopDomain,
                'status' => $tokenResponse->status(),
                'body'   => $tokenResponse->body(),
            ]);
            return redirect()->route('dashboard')->with('error', 'Shopify authorization failed');
        }

        $accessToken = $tokenResponse->json('access_token');

        // Save or update the shop with the real access token
        $shop = ShopifyShop::updateOrCreate(
            ['shop_domain' => $shopDomain],
            [
                'access_token' => $accessToken,
                'is_active'    => true,
            ]
        );

        // Complete background setup: install webhooks, scripts, metafields
        $this->shopifyService->completeSetup($shop);

        // Redirect to the embedded app URL in Shopify Admin
        $appUrl = "https://{$shopDomain}/admin/apps/" . config('services.shopify.app_handle', 'pixelmaster-sgtm');

        return redirect()->away($appUrl);
    }
}
