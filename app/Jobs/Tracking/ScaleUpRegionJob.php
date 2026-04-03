<?php

namespace App\Jobs\Tracking;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Tracking\DockerNode;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ScaleUpRegionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $region;

    /**
     * Create a new job instance.
     */
    public function __construct(string $region)
    {
        $this->region = $region;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("[AutoScaler] ScaleUpRegionJob started for region: {$this->region}");

        // 1. Create a placeholder Node in DB so AnalyzeNodeCapacity doesn't fire duplicate jobs
        $nodeName = "auto-node-{$this->region}-" . substr(uniqid(), -4);
        
        $token = \Illuminate\Support\Str::random(64);
        
        $node = DockerNode::create([
            'name'               => $nodeName,
            'host'               => 'pending',
            'region'             => $this->region,
            'status'             => 'provisioning',
            'provisioning_token' => $token,
            'max_containers'     => config('tracking.docker.max_containers_per_node', 50),
            'port_range_start'   => config('tracking.docker.port_range_start', 9000),
            'port_range_end'     => 9999,
            'metadata'           => ['source' => 'autoscaler']
        ]);

        // 2. Fire the webhook / AWS API Call
        $webhookUrl = \App\Models\GlobalSetting::get('tracking_auto_scale_webhook'); 

        if ($webhookUrl) {
            try {
                $response = Http::post($webhookUrl, [
                    'action' => 'scale_up',
                    'region' => $this->region,
                    'node_name' => $nodeName,
                    'provisioning_token' => $token,
                    'callback_url' => route('api.nodes.callback', ['node_id' => $node->id]) . '?token=' . $token
                ]);

                if ($response->successful()) {
                    Log::info("[AutoScaler] Webhook payload delivered successfully for {$nodeName}");
                } else {
                    Log::error("[AutoScaler] Webhook failed with status {$response->status()}");
                    $node->update(['status' => 'offline']);
                }
            } catch (\Exception $e) {
                Log::error("[AutoScaler] Network error hitting webhook: " . $e->getMessage());
                $node->update(['status' => 'offline']);
            }
        } else {
            // Mock mode for local testing or manual provisioning
            Log::warning("[AutoScaler] No tracking.docker.auto_scale_webhook configured. Skipping actual HTTP call. Node remaining in 'provisioning' state.");
        }
    }
}
