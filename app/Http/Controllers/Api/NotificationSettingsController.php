<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuperAdminMailConfig;
use App\Models\EmailTemplate;
use App\Models\AdminWebhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationSettingsController extends Controller
{
    /**
     * Mail Configs
     */
    public function getMailConfigs()
    {
        return response()->json([
            'success' => true,
            'data' => SuperAdminMailConfig::all()
        ]);
    }

    public function updateMailConfig(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'provider' => 'required|string|in:smtp,sendgrid,mailgun',
            'config_data' => 'required|array',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $config = SuperAdminMailConfig::updateOrCreate(
            ['provider' => $request->provider],
            [
                'config_data' => $request->config_data,
                'is_active' => $request->is_active ?? true
            ]
        );

        if ($config->is_active) {
            SuperAdminMailConfig::where('provider', '!=', $request->provider)->update(['is_active' => false]);
        }

        return response()->json(['success' => true, 'data' => $config]);
    }

    /**
     * Email Templates
     */
    public function getTemplates()
    {
        return response()->json([
            'success' => true,
            'data' => EmailTemplate::all()
        ]);
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'subject' => 'string|max:255',
            'content' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $template->update($request->only(['subject', 'content']));

        return response()->json(['success' => true, 'data' => $template]);
    }

    /**
     * Admin Webhooks
     */
    public function getWebhooks()
    {
        return response()->json([
            'success' => true,
            'data' => AdminWebhook::all()
        ]);
    }

    public function storeWebhook(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'events' => 'required|array',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $webhook = AdminWebhook::create([
            'url' => $request->url,
            'events' => $request->events,
            'secret' => bin2hex(random_bytes(16)),
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json(['success' => true, 'data' => $webhook]);
    }

    public function deleteWebhook($id)
    {
        AdminWebhook::destroy($id);
        return response()->json(['success' => true, 'message' => 'Webhook deleted']);
    }

    public function testWebhook($id)
    {
        $webhook = AdminWebhook::findOrFail($id);
        \App\Services\WebhookService::trigger('webhook.test', [
            'message' => 'This is a test event from your SaaS Admin Dashboard',
            'triggered_at' => now()->toIso8601String()
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Test event dispatched to queue'
        ]);
    }
}
