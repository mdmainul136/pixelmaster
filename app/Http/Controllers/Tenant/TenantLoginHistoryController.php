<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\LoginHistory;

class TenantLoginHistoryController extends Controller
{
    /**
     * Show the login history paginated view.
     */
    public function index(Request $request)
    {
        $loginHistories = LoginHistory::where('user_id', Auth::id())
            ->orderBy('login_at', 'desc')
            ->paginate(10)
            ->through(function ($history) use ($request) {
                return [
                    'id' => $history->id,
                    'ip_address' => $history->ip_address,
                    'device' => $history->device,
                    'browser' => $history->browser,
                    'location' => $history->location ?? 'Unknown',
                    'login_at' => $history->login_at->format('M d, Y h:i A'),
                    'login_at_human' => $history->login_at->diffForHumans(),
                    'is_current_device' => $history->ip_address === $request->ip() && $history->user_agent === $request->userAgent(),
                ];
            });

        return Inertia::render('Tenant/Core/Profile/LoginHistory', [
            'loginHistories' => $loginHistories
        ]);
    }
}
