<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Get tenant's notification preferences.
     */
    public function show(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $prefs = NotificationPreference::firstOrCreate(
            ['tenant_id' => $tenantId],
            NotificationPreference::defaults()
        );

        return response()->json([
            'success' => true,
            'data'    => $prefs,
        ]);
    }

    /**
     * Update tenant's notification preferences.
     * Accepts partial updates — only send the fields you want to change.
     */
    public function update(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'email_notifications' => 'sometimes|boolean',
            'push_notifications'  => 'sometimes|boolean',
            'marketing_emails'    => 'sometimes|boolean',
            'security_alerts'     => 'sometimes|boolean',
            'weekly_reports'      => 'sometimes|boolean',
            'campaign_analytics'  => 'sometimes|boolean',
        ]);

        $prefs = NotificationPreference::updateOrCreate(
            ['tenant_id' => $tenantId],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated.',
            'data'    => $prefs,
        ]);
    }

    /**
     * Toggle a single preference by key.
     * POST /api/notification-preferences/toggle  { "key": "marketing_emails" }
     */
    public function toggle(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');

        $validated = $request->validate([
            'key' => 'required|string|in:email_notifications,push_notifications,marketing_emails,security_alerts,weekly_reports,campaign_analytics',
        ]);

        $prefs = NotificationPreference::firstOrCreate(
            ['tenant_id' => $tenantId],
            NotificationPreference::defaults()
        );

        $key = $validated['key'];
        $prefs->$key = !$prefs->$key;
        $prefs->save();

        return response()->json([
            'success' => true,
            'message' => ucfirst(str_replace('_', ' ', $key)) . ($prefs->$key ? ' enabled.' : ' disabled.'),
            'data'    => $prefs,
        ]);
    }
}
