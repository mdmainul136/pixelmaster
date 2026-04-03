<?php

namespace App\Services;

use App\Models\AdminWebhook;
use App\Jobs\DispatchAdminWebhookJob;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /**
     * Dispatch a system event to all registered and active webhooks.
     * 
     * @param string $event The event name (e.g., 'tenant.created')
     * @param array $payload The data to send
     */
    public static function trigger(string $event, array $payload)
    {
        $webhooks = AdminWebhook::where('is_active', true)
            ->where(function ($query) use ($event) {
                $query->whereJsonContains('events', $event)
                      ->orWhereJsonContains('events', '*');
            })
            ->get();

        foreach ($webhooks as $webhook) {
            DispatchAdminWebhookJob::dispatch($webhook, $event, $payload);
        }
    }
}
