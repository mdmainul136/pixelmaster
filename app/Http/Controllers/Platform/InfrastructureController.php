<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use App\Models\AuditLog;

class InfrastructureController extends Controller
{
    /**
     * Display the Infrastructure Settings Page.
     */
    public function index()
    {
        // Read current state from env()
        $settings = [
            // Redis configurations
            'redis_default_host' => env('REDIS_HOST', '127.0.0.1'),
            
            // Deduplication Logic
            'tracking_dedup_store' => env('TRACKING_DEDUP_STORE', 'redis'),
            
            // Queue Drivers
            'redis_queue_connection' => env('REDIS_QUEUE_CONNECTION', 'default'),
            
            // Upstash settings
            'upstash_redis_url' => env('UPSTASH_REDIS_URL', ''),
            'upstash_redis_host' => env('UPSTASH_REDIS_HOST', ''),
            'upstash_redis_password' => env('UPSTASH_REDIS_PASSWORD', ''),
            
            // AWS Redis settings
            'aws_redis_url' => env('AWS_REDIS_URL', ''),
            'aws_redis_host' => env('AWS_REDIS_HOST', ''),
            'aws_redis_password' => env('AWS_REDIS_PASSWORD', ''),
            
            // Kafka Broker
            'kafka_enabled' => env('KAFKA_ENABLED', 'false') === 'true',
            'kafka_brokers' => env('KAFKA_BROKERS', '127.0.0.1:9092'),
            'kafka_topic_events' => env('KAFKA_TOPIC_EVENTS', 'tracking-events'),
            
            // ClickHouse DB
            'clickhouse_enabled' => env('CLICKHOUSE_ENABLED', 'false') === 'true',
            'clickhouse_host' => env('CLICKHOUSE_HOST', '127.0.0.1'),
            'clickhouse_port' => env('CLICKHOUSE_PORT', '8123'),
            'clickhouse_database' => env('CLICKHOUSE_DATABASE', 'tracking'),
            'clickhouse_user' => env('CLICKHOUSE_USER', 'default'),
            'clickhouse_password' => env('CLICKHOUSE_PASSWORD', ''),

            // Kubernetes / EKS
            'tracking_orchestrator' => env('TRACKING_ORCHESTRATOR', 'docker'),
            'eks_cluster_name' => env('EKS_CLUSTER_NAME', 'sgtm-tracking'),
            'aws_default_region' => env('AWS_DEFAULT_REGION', 'ap-southeast-1'),
            'k8s_namespace_prefix' => env('KUBERNETES_NAMESPACE_PREFIX', 'tracking-'),
            'kubectl_timeout' => env('KUBECTL_TIMEOUT', 60),
        ];

        return Inertia::render('Platform/Infrastructure/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update Infrastructure settings by modifying the .env file.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Redis
            'tracking_dedup_store' => 'required|in:redis,upstash,aws',
            'redis_queue_connection' => 'required|in:default,upstash,aws',
            
            'upstash_redis_url' => 'nullable|string',
            'upstash_redis_host' => 'nullable|string',
            'upstash_redis_password' => 'nullable|string',
            
            'aws_redis_url' => 'nullable|string',
            'aws_redis_host' => 'nullable|string',
            'aws_redis_password' => 'nullable|string',
            
            // Kafka
            'kafka_enabled' => 'boolean',
            'kafka_brokers' => 'nullable|string',
            'kafka_topic_events' => 'nullable|string',
            
            // ClickHouse
            'clickhouse_enabled' => 'boolean',
            'clickhouse_host' => 'nullable|string',
            'clickhouse_port' => 'nullable|integer',
            'clickhouse_database' => 'nullable|string',
            'clickhouse_user' => 'nullable|string',
            'clickhouse_password' => 'nullable|string',

            // Kubernetes
            'tracking_orchestrator' => 'required|in:docker,kubernetes',
            'eks_cluster_name' => 'nullable|string',
            'aws_default_region' => 'nullable|string',
            'k8s_namespace_prefix' => 'nullable|string',
            'kubectl_timeout' => 'nullable|integer',
        ]);

        // Prep data for writing to .env
        $envData = [
            'TRACKING_DEDUP_STORE' => $validated['tracking_dedup_store'],
            'REDIS_QUEUE_CONNECTION' => $validated['redis_queue_connection'],
            
            'UPSTASH_REDIS_URL' => $validated['upstash_redis_url'],
            'UPSTASH_REDIS_HOST' => $validated['upstash_redis_host'],
            'UPSTASH_REDIS_PASSWORD' => $validated['upstash_redis_password'],
            
            'AWS_REDIS_URL' => $validated['aws_redis_url'],
            'AWS_REDIS_HOST' => $validated['aws_redis_host'],
            'AWS_REDIS_PASSWORD' => $validated['aws_redis_password'],
            
            'KAFKA_ENABLED' => $validated['kafka_enabled'] ?? false,
            'KAFKA_BROKERS' => $validated['kafka_brokers'],
            'KAFKA_TOPIC_EVENTS' => $validated['kafka_topic_events'],
            
            'CLICKHOUSE_ENABLED' => $validated['clickhouse_enabled'] ?? false,
            'CLICKHOUSE_HOST' => $validated['clickhouse_host'],
            'CLICKHOUSE_PORT' => $validated['clickhouse_port'],
            'CLICKHOUSE_DATABASE' => $validated['clickhouse_database'],
            'CLICKHOUSE_USER' => $validated['clickhouse_user'],
            'CLICKHOUSE_PASSWORD' => $validated['clickhouse_password'],

            // K8s
            'TRACKING_ORCHESTRATOR' => $validated['tracking_orchestrator'],
            'EKS_CLUSTER_NAME' => $validated['eks_cluster_name'],
            'AWS_DEFAULT_REGION' => $validated['aws_default_region'],
            'KUBERNETES_NAMESPACE_PREFIX' => $validated['k8s_namespace_prefix'],
            'KUBECTL_TIMEOUT' => $validated['kubectl_timeout'],
        ];

        // Safely write to .env
        $this->updateEnvFile($envData);

        // Clear necessary caches to apply .env changes
        Artisan::call('optimize:clear');
        Artisan::call('queue:restart');

        // Log the change
        AuditLog::create([
            'tenant_id'  => null, // Super admin action
            'event_type' => 'infrastructure',
            'action'     => 'Super admin updated core infrastructure settings (Redis, Kafka, ClickHouse). System caches cleared.',
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Infrastructure configuration saved successfully. Core caches cleared.');
    }

    /**
     * Test the Kubernetes/EKS cluster connection.
     */
    public function testKubernetesConnection(Request $request)
    {
        $validated = $request->validate([
            'eks_cluster_name' => 'required|string',
            'aws_default_region' => 'required|string',
            'kubectl_timeout' => 'nullable|integer',
        ]);

        // Temporarily set env for the current request context to test the provided settings
        putenv("AWS_DEFAULT_REGION=" . $validated['aws_default_region']);
        putenv("EKS_CLUSTER_NAME=" . $validated['eks_cluster_name']);
        if (isset($validated['kubectl_timeout'])) {
            putenv("KUBECTL_TIMEOUT=" . $validated['kubectl_timeout']);
        }

        try {
            $client = new \App\Modules\Tracking\Services\KubernetesApiClient();
            
            // Perform the ping (kubectl cluster-info)
            if ($client->ping()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully connected to EKS cluster: ' . $validated['eks_cluster_name'],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to cluster. Ensure your credentials and cluster names are correct.',
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Diagnostic error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Updates the .env file safely with new string values.
     */
    private function updateEnvFile(array $data): void
    {
        $envPath = base_path('.env');
        
        if (!file_exists($envPath)) {
            return;
        }

        $content = file_get_contents($envPath);

        foreach ($data as $key => $value) {
            // Handle booleans
            if (is_bool($value)) {
                $value = $value ? 'true' : 'false';
            } elseif (is_null($value)) {
                $value = 'null';
            } else {
                // If it contains a space, #, =, or quotes, wrap it in double quotes (standard dotenv behavior)
                if (preg_match("/\s|#|=|'|\"/", (string) $value)) {
                    $value = '"' . str_replace('"', '\"', $value) . '"';
                }
            }

            // Regex looks for KEY=anything at the start of a line and replaces the whole line
            $pattern = "/^{$key}\s*=\s*.*/m";
            
            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, "{$key}={$value}", $content);
            } else {
                // Key doesn't exist, append to the bottom
                $content .= "\n{$key}={$value}";
            }
        }

        file_put_contents($envPath, $content);
    }
}
