<?php

namespace App\Modules\Tracking\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Tracking\Services\AudienceSyncService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AudienceSyncController extends Controller
{
    protected $syncService;

    public function __construct(AudienceSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Display the Audience Sync Overview.
     */
    public function index()
    {
        $tenantId = tenant('id') ?: \App\Models\Tenant::where('admin_email', auth()->user()->email)->firstOrFail()->id;
        $tenant = \App\Models\Tenant::findOrFail($tenantId);

        $data = $tenant->run(function () {
            return [
                'sync_status' => $this->syncService->getSyncStatus(),
                'available_platforms' => ['Facebook', 'Google', 'TikTok', 'Snapchat'],
                'segments' => ['VIP', 'At Risk', 'New Purchasers', 'Window Shoppers']
            ];
        });

        return Inertia::render('Tenant/Tracking/AudienceSync', $data);
    }

    /**
     * Trigger a manual sync for a specific segment.
     */
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'segment' => 'required|string',
            'platform' => 'required|string'
        ]);

        $tenantId = tenant('id') ?: \App\Models\Tenant::where('admin_email', auth()->user()->email)->firstOrFail()->id;
        $tenant = \App\Models\Tenant::findOrFail($tenantId);

        $result = $tenant->run(function () use ($validated) {
            return $this->syncService->syncSegment(
                $validated['segment'],
                $validated['platform']
            );
        });

        return response()->json($result);
    }
}
