<?php

namespace App\Jobs;

use App\Models\AdminWebhook;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchAdminWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 60, 300];

    protected $webhook;
    protected $event;
    protected $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(AdminWebhook $webhook, string $event, array $payload)
    {
        $this->webhook = $webhook;
        $this->event = $event;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $payload = [
            'event' => $this->event,
            'timestamp' => now()->toIso8601String(),
            'data' => $this->payload,
        ];

        $jsonPayload = json_encode($payload);
        
        // Generate HMAC signature for security
        $signature = hash_hmac('sha256', $jsonPayload, $this->webhook->secret);

        try {
            $response = Http::withHeaders([
                'X-Admin-Signature' => $signature,
                'X-Admin-Event' => $this->event,
                'Content-Type' => 'application/json',
                'User-Agent' => 'SaaS-Admin-Webhook-Dispatcher/1.0',
            ])->post($this->webhook->url, $payload);

            if (!$response->successful()) {
                Log::warning("Webhook failed for {$this->webhook->url}", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception("Webhook returned status {$response->status()}");
            }

        } catch (\Exception $e) {
            Log::error("Webhook dispatch error for {$this->webhook->url}: " . $e->getMessage());
            throw $e;
        }
    }
}
