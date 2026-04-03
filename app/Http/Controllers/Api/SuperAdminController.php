<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Module;
use App\Models\TenantModule;
use App\Models\FirewallRule;
use App\Models\AuditLog;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use App\Modules\Tracking\Jobs\ProcessTrackingEventJob;

class SuperAdminController extends Controller
{
    /**
     * Dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'total_modules' => Module::count(),
            'active_modules' => Module::where('is_active', true)->count(),
            'total_subscriptions' => TenantModule::where('status', 'active')->count(),
            'total_revenue' => $this->calculateTotalRevenue(),
            'monthly_revenue' => $this->calculateMonthlyRevenue(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Platform Profitability & Scaling Analysis
     * Based on $0.80 incremental cost per 1M events.
     */
    public function profitability()
    {
        // Calculate 30-day event volume
        $totalEvents = DB::connection('tenant_dynamic')
            ->table('ec_tracking_usage')
            ->where('date', '>=', now()->subDays(30)->toDateString())
            ->sum('events_received');

        $volumeMillions = max(0.1, $totalEvents / 1_000_000);

        $costBreakdown = [
            'eks'        => 0.40 * $volumeMillions,
            'alb'        => 0.25 * $volumeMillions,
            'sqs'        => 0.04 * $volumeMillions,
            'cloudflare' => 0.02 * $volumeMillions,
            'logs'       => 0.05 * $volumeMillions,
        ];

        $totalCost = array_sum($costBreakdown);
        $projectedRevenue = 10.00 * $volumeMillions; // $10 per 1M events model
        $grossProfit = $projectedRevenue - $totalCost;
        $margin = $projectedRevenue > 0 ? ($grossProfit / $projectedRevenue) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'period'           => 'Last 30 Days',
                'event_volume'     => $totalEvents,
                'volume_mil'       => round($volumeMillions, 2),
                'total_cost'       => round($totalCost, 2),
                'total_revenue'    => round($projectedRevenue, 2),
                'gross_profit'     => round($grossProfit, 2),
                'margin_pct'       => round($margin, 1),
                'cost_breakdown'   => $costBreakdown,
                'unit_economics'   => [
                    'cost_per_mil'    => 0.80,
                    'revenue_per_mil' => 10.00,
                    'profit_per_mil'  => 9.20
                ]
            ]
        ]);
    }

    /**
     * Get all tenants with pagination
     */
    public function tenants(Request $request)
    {
        $query = Tenant::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tenants = $query->with('tenantModules.module')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $tenants
        ]);
    }

    /**
     * Deep Queue Metrics for Dashboard
     * Returns JPM, Avg Wait Time, and Failed Jobs count.
     */
    public function queueMetrics()
    {
        $minuteKeys = [];
        for ($i = 0; $i < 10; $i++) {
            $minuteKeys[] = date('YmdHi', strtotime("-{$i} minutes"));
        }

        $jpmData = [];
        $latencyData = [];
        $totalJpm = 0;

        foreach ($minuteKeys as $key) {
            $jpm = (int)Redis::get("tracking:metrics:jpm:{$key}") ?: 0;
            $latency = (int)Redis::get("tracking:metrics:latency:{$key}") ?: 0;
            
            $jpmData[$key] = $jpm;
            $latencyData[$key] = $jpm > 0 ? round($latency / $jpm, 2) : 0;
            $totalJpm += $jpm;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'jpm_series' => array_reverse($jpmData),
                'latency_series' => array_reverse($latencyData),
                'total_jpm' => round($totalJpm / 10, 2), // average over last 10 mins
                'failed_count' => $this->fetchFailedJobsCount(),
                'throughput' => $this->calculateRecentThroughput(),
                'queues' => $this->getQueueDepths(),
            ]
        ]);
    }

    private function getQueueDepths()
    {
        $queues = ['tracking:pro', 'tracking:free', 'tracking-logs'];
        $stats = [];
        foreach ($queues as $q) {
            $stats[$q] = Redis::llen("queues:{$q}");
        }
        return $stats;
    }

    private function fetchFailedJobsCount()
    {
        return DB::table('failed_jobs')->count();
    }

    /**
     * Paginated Event Logs
     */
    public function eventLogs(Request $request)
    {
        $query = DB::connection('tenant_dynamic')
            ->table('tracking_event_logs')
            ->orderBy('created_at', 'desc');

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('status')) {
            $query->where('status_code', $request->status == 'success' ? 200 : '!=', 200);
        }

        $logs = $query->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Update Tenant Tracking Configuration
     */
    public function updateTenantConfig(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $settings = $tenant->settings ?? [];
        $tracking = $settings['tracking'] ?? [];

        $newTracking = array_merge($tracking, $request->only([
            'sgtm_enabled', 
            'test_mode', 
            'rate_limit_per_tenant',
            'retention_days'
        ]));

        $settings['tracking'] = $newTracking;
        $tenant->update(['settings' => $settings]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant tracking configuration updated',
            'data' => $newTracking
        ]);
    }

    /**
     * Bulk Retry Failed Events
     */
    public function retryEvents(Request $request)
    {
        $eventIds = $request->event_ids; // Array of IDs from tracking_event_logs
        $count = 0;

        foreach ($eventIds as $id) {
            $log = DB::connection('tenant_dynamic')
                ->table('tracking_event_logs')
                ->where('id', $id)
                ->first();

            if ($log) {
                $payload = json_decode($log->payload, true);
                
                // Re-dispatch the job
                ProcessTrackingEventJob::dispatch([
                    'container_id' => $log->container_id,
                    'tenant_id'    => $log->tenant_id ?? 0,
                    'event_type'   => $log->event_type,
                    'payload'      => $payload,
                    '_request_id'  => $log->request_id,
                    '_retry_count' => ($log->retry_count ?? 0) + 1,
                ]);
                $count++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully re-dispatched {$count} events"
        ]);
    }

    private function calculateRecentThroughput()
    {
        return DB::connection('tenant_dynamic')
            ->table('tracking_event_logs')
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count() / 300; // eps over 5 mins
    }

    private function calculateFailureRate()
    {
        $total = DB::connection('tenant_dynamic')
            ->table('tracking_event_logs')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($total == 0) return 0;

        $failed = DB::connection('tenant_dynamic')
            ->table('tracking_event_logs')
            ->where('created_at', '>=', now()->subHour())
            ->where('status_code', '!=', 200)
            ->count();

        return round(($failed / $total) * 100, 2);
    }

    /**
     * Get single tenant details
     */
    public function tenantDetails($id)
    {
        $tenant = Tenant::with(['tenantModules.module'])->findOrFail($id);

        $subscriptions = TenantModule::where('tenant_id', $id)
            ->with('module')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tenant' => $tenant,
                'subscriptions' => $subscriptions,
                'total_spent' => $this->calculateTenantSpending($id),
            ]
        ]);
    }

    /**
     * Approve tenant
     */
    public function approveTenant($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Tenant approved successfully'
        ]);
    }

    /**
     * Suspend tenant
     */
    public function suspendTenant($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['status' => 'suspended']);

        return response()->json([
            'success' => true,
            'message' => 'Tenant suspended successfully'
        ]);
    }

    /**
     * Delete tenant
     */
    public function deleteTenant($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Drop tenant database
        DB::statement("DROP DATABASE IF EXISTS {$tenant->database_name}");
        
        // Delete tenant record
        $tenant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tenant deleted successfully'
        ]);
    }

    /**
     * List all sGTM configs
     */
    public function listSgtmConfigs()
    {
        $configs = \App\Models\TenantSgtmConfig::with('tenant:id,company_name')->get();

        return response()->json([
            'success' => true,
            'data' => $configs
        ]);
    }

    /**
     * Store or update sGTM config
     */
    public function storeSgtmConfig(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'container_id' => 'required|string',
            'custom_domain' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $config = \App\Models\TenantSgtmConfig::updateOrCreate(
            ['tenant_id' => $request->tenant_id],
            [
                'container_id' => $request->container_id,
                'custom_domain' => $request->custom_domain,
                'settings' => $request->settings ?? [],
                'is_active' => true,
            ]
        );

        // Invalidate sGTM cache
        Redis::del("sgtm:config:{$config->api_key}");

        return response()->json([
            'success' => true,
            'message' => 'sGTM Configuration saved successfully',
            'data' => $config
        ]);
    }

    /**
     * Toggle sGTM config status
     */
    public function toggleSgtmStatus($id)
    {
        $config = \App\Models\TenantSgtmConfig::findOrFail($id);
        $config->update(['is_active' => !$config->is_active]);

        // Invalidate sGTM cache
        Redis::del("sgtm:config:{$config->api_key}");

        return response()->json([
            'success' => true,
            'message' => 'sGTM status updated',
            'data' => $config
        ]);
    }

    /**
     * Toggle sGTM test mode
     */
    public function toggleSgtmTestMode($id)
    {
        $config = \App\Models\TenantSgtmConfig::findOrFail($id);
        $settings = $config->settings ?? [];
        $settings['test_mode'] = !($settings['test_mode'] ?? false);
        
        $config->update(['settings' => $settings]);

        // Invalidate sGTM cache
        Redis::del("sgtm:config:{$config->api_key}");

        return response()->json([
            'success' => true,
            'message' => 'sGTM test mode ' . ($settings['test_mode'] ? 'enabled' : 'disabled'),
            'data' => $config
        ]);
    }

    /**
     * Rotate sGTM API Key
     */
    public function rotateSgtmApiKey($id)
    {
        $config = \App\Models\TenantSgtmConfig::findOrFail($id);
        $oldKey = $config->api_key;
        $config->update(['api_key' => \Illuminate\Support\Str::random(32)]);

        // Invalidate old and new sGTM cache
        Redis::del("sgtm:config:{$oldKey}");
        Redis::del("sgtm:config:{$config->api_key}");

        return response()->json([
            'success' => true,
            'message' => 'sGTM API Key rotated successfully',
            'data' => $config
        ]);
    }

    /**
     * Calculate total revenue
     */
    private function calculateTotalRevenue()
    {
        return TenantModule::where('status', 'active')
            ->join('modules', 'tenant_modules.module_id', '=', 'modules.id')
            ->sum('modules.price');
    }

    /**
     * Calculate monthly revenue
     */
    private function calculateMonthlyRevenue()
    {
        return TenantModule::where('status', 'active')
            ->whereMonth('subscribed_at', now()->month)
            ->join('modules', 'tenant_modules.module_id', '=', 'modules.id')
            ->sum('modules.price');
    }

    /**
     * Calculate tenant spending
     */
    /**
     * Calculate tenant spending
     */
    private function calculateTenantSpending($tenantId)
    {
        return TenantModule::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->join('modules', 'tenant_modules.module_id', '=', 'modules.id')
            ->sum('modules.price');
    }

    /**
     * Security Hub: Statistics
     */
    public function securityStats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'blocked_ips' => FirewallRule::where('type', 'block')->count(),
                'active_sessions' => DB::table('personal_access_tokens')->count(), // Simplified
                'audit_logs_24h' => AuditLog::where('created_at', '>=', now()->subDay())->count(),
                'two_factor_adoption' => $this->calculate2faAdoption(),
                'stale_api_keys' => Tenant::where('updated_at', '<', now()->subMonths(6))->count(),
            ]
        ]);
    }

    /**
     * Security Hub: Audit Logs
     */
    public function auditLogs(Request $request)
    {
        $query = AuditLog::query();

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('payload', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 25)
        ]);
    }

    /**
     * Security Hub: Firewall Rules
     */
    public function firewallRules(Request $request)
    {
        $rules = FirewallRule::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $rules
        ]);
    }

    /**
     * Security Hub: Store Firewall Rule
     */
    public function storeFirewallRule(Request $request)
    {
        $request->validate([
            'ip_address' => 'required|ip',
            'type' => 'required|in:block,allow',
            'reason' => 'nullable|string',
            'expires_at' => 'nullable|date',
        ]);

        $rule = FirewallRule::updateOrCreate(
            ['ip_address' => $request->ip_address],
            [
                'type' => $request->type,
                'reason' => $request->reason,
                'expires_at' => $request->expires_at,
                'is_active' => true,
            ]
        );

        // Clear Redis cache for this IP
        Redis::del("firewall:block:{$rule->ip_address}");

        return response()->json([
            'success' => true,
            'message' => 'Firewall rule saved successfully',
            'data' => $rule
        ]);
    }

    /**
     * Security Hub: Delete Firewall Rule
     */
    public function deleteFirewallRule($id)
    {
        $rule = FirewallRule::findOrFail($id);
        $ip = $rule->ip_address;
        $rule->delete();

        // Clear Redis cache for this IP
        Redis::del("firewall:block:{$ip}");

        return response()->json([
            'success' => true,
            'message' => 'Firewall rule deleted'
        ]);
    }

    private function calculate2faAdoption()
    {
        $totalUsers = DB::table('users')->count();
        if ($totalUsers === 0) return 0;
        
        $usersWith2fa = DB::table('users')
            ->whereNotNull('two_factor_secret')
            ->count();
            
        return round(($usersWith2fa / $totalUsers) * 100, 1);
    }

    /**
     * Subscribe tenant to a module (initiated by Super Admin)
     */
    public function subscribeTenantModule(Request $request, $id, \App\Services\ModuleService $moduleService)
    {
        $request->validate([
            'module_slug' => 'required|string|exists:modules,slug',
            'plan_level' => 'sometimes|string|in:starter,growth,pro',
        ]);

        $tenant = Tenant::findOrFail($id);
        
        $result = $moduleService->subscribeModule($tenant, $request->module_slug, [
            'plan_level' => $request->plan_level ?? 'free',
            'source' => 'platform',
            'status' => 'active',
        ]);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully subscribed tenant to {$request->module_slug}",
            'data' => $result
        ]);
    }

    /**
     * Unsubscribe tenant from a module
     */
    public function unsubscribeTenantModule($id, $slug, \App\Services\ModuleService $moduleService)
    {
        $tenant = Tenant::findOrFail($id);
        
        $result = $moduleService->unsubscribeModule($tenant, $slug);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message']
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully unsubscribed tenant from {$slug}",
            'data' => $result
        ]);
    }

    /**
     * Get tenant payment configuration
     */
    public function getTenantPaymentConfig($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Initialize tenant context to query their business_settings
        tenancy()->initialize($tenant);
        
        $gateways = ['bkash', 'nagad', 'sslcommerz'];
        $data = [];
        foreach ($gateways as $gw) {
            $settings = \App\Models\BusinessSetting::getByGroup($gw);
            $data[$gw] = $this->maskSettings($settings);
        }
        
        // End tenancy context to return to central
        tenancy()->end();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Update tenant payment configuration
     */
    public function updateTenantPaymentConfig(Request $request, $id)
    {
        $request->validate([
            'gateway' => 'required|in:bkash,nagad,sslcommerz',
            'settings' => 'required|array',
        ]);

        $tenant = Tenant::findOrFail($id);
        
        try {
            tenancy()->initialize($tenant);
            
            foreach ($request->settings as $key => $value) {
                if ($this->isSensitive($key) && $value === '********') {
                    continue;
                }
                \App\Models\BusinessSetting::set($key, $value, $request->gateway);
            }
            
            tenancy()->end();

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->gateway) . ' configuration updated successfully for tenant.'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update tenant payment gateway config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update configuration.'
            ], 500);
        }
    }

    /**
     * Get global SaaS payment configuration
     */
    public function getGlobalPaymentConfig()
    {
        $gateways = ['stripe', 'bkash', 'nagad', 'sslcommerz'];
        $data = [];
        foreach ($gateways as $gw) {
            $settings = GlobalSetting::getByGroup($gw . '_saas');
            $data[$gw] = $this->maskSettings($settings);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Update global SaaS payment configuration
     */
    public function updateGlobalPaymentConfig(Request $request)
    {
        $request->validate([
            'gateway' => 'required|in:stripe,bkash,nagad,sslcommerz',
            'settings' => 'required|array',
        ]);

        $gateway = $request->gateway;
        $settings = $request->settings;
        $group = $gateway . '_saas';

        try {
            foreach ($settings as $key => $value) {
                if ($this->isSensitive($key) && $value === '********') {
                    continue;
                }
                GlobalSetting::set($key, $value, $group);
            }

            return response()->json([
                'success' => true,
                'message' => 'Global SaaS ' . ucfirst($gateway) . ' configuration updated successfully.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update global payment config: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update global configuration.'
            ], 500);
        }
    }

    private function maskSettings($settings)
    {
        $masked = [];
        foreach ($settings as $key => $value) {
            if ($this->isSensitive($key) && !empty($value)) {
                $masked[$key] = '********';
                $masked[$key . '_is_set'] = true;
            } else {
                $masked[$key] = $value;
                if ($this->isSensitive($key)) {
                    $masked[$key . '_is_set'] = false;
                }
            }
        }
        return $masked;
    }

    private function isSensitive($key)
    {
        $sensitive = [
            'secretKey', 'merchantNumber', 'storePassword', 
            'password', 'webhookSecret', 'api_key', 'api_secret'
        ];
        return in_array($key, $sensitive);
    }
}

