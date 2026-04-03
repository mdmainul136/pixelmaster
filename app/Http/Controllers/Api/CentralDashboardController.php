<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Models from various modules
use App\Models\Ecommerce\Order;
use App\Models\Ecommerce\Customer;
use App\Models\Ecommerce\Product;
use App\Models\HRM\Staff;
use App\Models\HRM\Attendance;
use App\Models\HRM\LeaveRequest;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\Tracking\TrackingContainer;
use App\Models\Tracking\TrackingEventLog;

class CentralDashboardController extends Controller
{
    public function __construct(
        protected ModuleService $moduleService,
        protected \App\Services\CoreEngine\LicenseMeter $licenseMeter,
        protected \App\Services\CoreEngine\TenantCapabilityRegistry $capabilityRegistry
    ) {}

    /**
     * GET /api/dashboard/summary
     * Unified dashboard: stats for each active module + recommended modules.
     */
    public function index(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id')
                 ?? $request->header('X-Tenant-ID');

        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        // Get all active module keys for this tenant
        $activeModules = TenantModule::where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('module')
            ->get();

        $activeKeys = $activeModules
            ->map(fn ($tm) => optional($tm->module)->slug)
            ->filter()
            ->values()
            ->toArray();

        // Load widget configurations
        $widgetConfig = config('dashboard_widgets', []);
        $summary = [];

        // â”€â”€ Dynamic Module Widget Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        foreach ($activeKeys as $moduleSlug) {
            if (!isset($widgetConfig[$moduleSlug])) continue;

            $moduleStats = ['label' => $widgetConfig[$moduleSlug]['label']];

            try {
                $moduleStats['data'] = $this->getModuleStats($moduleSlug);
                $summary[$moduleSlug] = $moduleStats;
            } catch (\Exception $e) {
                Log::warning("Failed to load dashboard data for module {$moduleSlug}: " . $e->getMessage());
                $summary[$moduleSlug] = ['error' => 'Module data unavailable'];
            }
        }

        // â”€â”€ Meta Information â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

        // Industry focus metrics (What should the frontend highlight?)
        $industryFocus = $this->resolveIndustryFocus($tenant->business_category ?? 'business-website');

        // Active modules list with enhanced metadata
        $activeModulesList = $activeModules->map(function ($tm) {
            $conf = config("modules.{$tm->module->slug}", []);
            return [
                'slug'        => $tm->module->slug,
                'name'        => $tm->module->name,
                'status'      => $tm->status,
                'expires_at'  => $tm->expires_at,
                'icon'        => $conf['icon'] ?? 'box',
                'color'       => $conf['color'] ?? '#6366f1',
            ];
        })->values();

        // Recommended modules
        $recommended = $this->moduleService->getRecommendedModules($tenantId);

        // Recent Activity Feed
        $recentActivity = $this->getRecentActivity($activeKeys);

        return response()->json([
            'success' => true,
            'data' => [
                'widgets'             => $summary,
                'industry_focus'      => $industryFocus,
                'active_modules'      => $activeModulesList,
                'recommended_modules' => $recommended,
                'recent_activity'     => $recentActivity,
                'tenant' => [
                    'tenant_id'         => $tenant->id,
                    'tenant_name'       => $tenant->tenant_name,
                    'company_name'      => $tenant->company_name,
                    'business_type'     => $tenant->business_type,
                    'business_category' => $tenant->business_category,
                    'country'           => $tenant->country,
                    'domain'            => $tenant->domain,
                ],
                'license_usage' => $this->getLicenseUsage($tenant->id, $activeKeys),
                'capabilities'  => $this->capabilityRegistry->getActiveCapabilities($tenant->id),
                'settings_summary' => $this->getSettingsSummary($tenant),
                'starter_journey'  => $tenant->plan === 'starter' ? $this->getStarterJourney($tenant->id) : null,
                'growth_path'      => $this->getGrowthPath($tenant->id, $activeKeys),
                'charts' => [
                    'monthly_sales' => $this->getMonthlySalesData($activeKeys),
                    'weekly_stats'  => $this->getWeeklyStatistics($activeKeys),
                ]
            ],
            'timestamp' => now(),
        ]);
    }

    /**
     * Get usage metrics for active modules.
     */
    protected function getLicenseUsage(string $tenantId, array $activeKeys): array
    {
        $usage = [];
        foreach ($activeKeys as $slug) {
            $usage[$slug] = $this->licenseMeter->getUsage($tenantId, $slug);
        }
        return $usage;
    }

    /**
     * Get a comprehensive summary of tenant settings, billing, and security.
     */
    protected function getSettingsSummary(Tenant $tenant): array
    {
        // 1. Billing & Subscription
        $subscription = \App\Models\TenantSubscription::where('tenant_id', $tenant->id)->with('plan')->first();
        
        // 2. Email Configuration
        $emailConfig = \App\Models\TenantEmailConfig::where('tenant_id', $tenant->id)->first();
        
        // 3. SMS Configuration (Checking key settings in BusinessSetting)
        $smsConfigured = \App\Models\BusinessSetting::where('key', 'sms_gateway')->exists();

        // 4. AI Configuration
        $aiConfig = \App\Models\TenantAiSetting::where('tenant_id', $tenant->id)->first();

        $hasTable = fn($t) => \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable($t);

        return [
            'billing' => [
                'plan_name'  => $subscription?->plan?->name ?? ucfirst($tenant->plan ?? 'free'),
                'status'     => $subscription?->status ?? 'active',
                'renews_at'  => $subscription?->renews_at?->toIso8601String(),
                'is_active'  => $subscription?->isActive() ?? true,
            ],
            'email' => [
                'configured' => $emailConfig ? true : false,
                'status'     => $emailConfig?->verification_status ?? 'pending',
                'quota_used' => $emailConfig?->sends_today ?? 0,
                'quota_limit'=> $emailConfig?->daily_send_limit ?? 100,
            ],
            'sms' => [
                'configured' => $smsConfigured,
                'provider'   => \App\Models\BusinessSetting::get('sms_gateway', 'Not Set'),
            ],
            'ai_config' => [
                'configured' => $aiConfig ? true : false,
                'provider'   => $aiConfig?->provider ?? 'Not Set',
                'model_name' => $aiConfig?->model_name ?? 'Default',
            ],
            'security' => [
                'total_roles'       => $hasTable('roles') ? \App\Models\Role::count() : 0,
                'total_permissions' => $hasTable('permissions') ? \App\Models\Permission::count() : 0,
                'active_assignments'=> $hasTable('model_has_roles') ? DB::table('model_has_roles')->count() : 0,
                'recent_audit_logs' => $hasTable('audit_logs') ? \App\Models\AuditLog::where('tenant_id', $tenant->id)->count() : 0,
            ],
            'modules_count' => $hasTable('tenant_modules') ? \App\Models\TenantModule::where('tenant_id', $tenant->id)->where('status', 'active')->count() : 0,
        ];
    }

    protected function resolveIndustryFocus(string $businessType): array
    {
        // 1. Try Business Modules Config (Fast Lookup)
        $btConfig = config("business_modules.{$businessType}");
        
        // 2. Try Industry Blueprints (Granular Lookup)
        $blueprints = config('business_blueprints', []);
        $blueprint = $blueprints[$businessType] ?? null;

        $primary = $btConfig['primary'] ?? $blueprint['primary'] ?? 'ecommerce';
        
        // Secondary is usually the first recommended or a core auxiliary
        $recommended = $btConfig['recommended'] ?? [];
        $secondary = $recommended[0] ?? ($blueprint['starter'][0] ?? 'crm');

        if ($secondary === $primary) {
            $secondary = $recommended[1] ?? 'crm';
        }

        return [
            'primary' => $primary,
            'secondary' => $secondary,
            'focus_label' => $btConfig['label'] ?? $blueprint['label'] ?? 'General Business',
        ];
    }

    /**
     * Fetch stats for a specific module.
     */
    protected function getModuleStats(string $slug): array
    {
        $conn = DB::connection('tenant_dynamic');
        $hasTable = fn($t) => \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable($t);

        return match ($slug) {
            'ecommerce' => [
                'total_sales'    => $hasTable('orders') ? (float) Order::where('status', 'completed')->sum('total_amount') : 0,
                'order_count'    => $hasTable('orders') ? Order::count() : 0,
                'customer_count' => $hasTable('customers') ? Customer::count() : 0,
                'product_count'  => $hasTable('products') ? Product::count() : 0,
            ],
            'hrm' => [
                'total_staff'     => $hasTable('staff') ? Staff::count() : 0,
                'present_today'   => $hasTable('attendances') ? Attendance::whereDate('date', now())->count() : 0,
                'pending_leaves'  => $hasTable('leave_requests') ? LeaveRequest::where('status', 'pending')->count() : 0,
            ],
            'finance' => [
                'today_income'  => $hasTable('transactions') ? (float) Transaction::whereHas('ledgers.account', fn($q) => $q->where('type', 'income'))
                    ->whereDate('date', now())->sum('amount') : 0,
                'today_expense' => $hasTable('transactions') ? (float) Transaction::whereHas('ledgers.account', fn($q) => $q->where('type', 'expense'))
                    ->whereDate('date', now())->sum('amount') : 0,
                'cash_balance'  => $hasTable('accounts') ? (float) Account::where('type', 'asset')->sum('balance') : 0,
            ],
            'tracking' => [
                'total_events_24h'  => $hasTable('tracking_event_logs') ? TrackingEventLog::where('created_at', '>=', now()->subDay())->count() : 0,
                'active_containers' => $hasTable('tracking_containers') ? TrackingContainer::where('is_active', true)->count() : 0,
            ],
            'crm' => [
                'total_contacts' => $hasTable('crm_contacts') ? $conn->table('crm_contacts')->count() : 0,
                'total_deals'    => $hasTable('crm_deals') ? $conn->table('crm_deals')->count() : 0,
                'open_deals'     => $hasTable('crm_deals') ? $conn->table('crm_deals')->whereNotIn('stage', ['closed_won', 'closed_lost'])->count() : 0,
            ],
            'inventory' => [
                'total_products'   => $hasTable('inventory_products') ? $conn->table('inventory_products')->count() : 0,
                'low_stock_items'  => $hasTable('inventory_products') ? $conn->table('inventory_products')->whereColumn('quantity', '<=', 'reorder_level')->count() : 0,
            ],
            'pos' => [
                'today_sales' => $hasTable('pos_sessions') ? (float) $conn->table('pos_sessions')->whereDate('opened_at', now())->sum('total_sales') : 0,
                'open_sessions' => $hasTable('pos_sessions') ? $conn->table('pos_sessions')->whereNull('closed_at')->count() : 0,
            ],
            'marketing' => [
                'total_campaigns' => $hasTable('marketing_campaigns') ? $conn->table('marketing_campaigns')->count() : 0,
                'active_campaigns'=> $hasTable('marketing_campaigns') ? $conn->table('marketing_campaigns')->where('status', 'active')->count() : 0,
            ],
            'loyalty' => [
                'total_members' => $hasTable('loyalty_members') ? $conn->table('loyalty_members')->count() : 0,
                'active_rewards'=> $hasTable('loyalty_rewards') ? $conn->table('loyalty_rewards')->where('is_active', true)->count() : 0,
            ],
            'manufacturing' => [
                'active_orders' => $hasTable('manufacturing_orders') ? $conn->table('manufacturing_orders')->whereIn('status', ['pending', 'in_progress'])->count() : 0,
                'boms'          => $hasTable('manufacturing_boms') ? $conn->table('manufacturing_boms')->count() : 0,
            ],
            'cross-border-ior' => [
                'shipments'         => $hasTable('ior_shipments') ? $conn->table('ior_shipments')->where('status', 'pending')->count() : 0,
                'compliant_products' => $hasTable('ior_products') ? $conn->table('ior_products')->where('is_compliant', true)->count() : 0,
            ],
            default => [],
        };
    }

    /**
     * Get the onboarding journey for Starter tenants.
     */
    protected function getStarterJourney(string $tenantId): array
    {
        $hasTable = fn($t) => \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable($t);

        $steps = [
            [
                'id' => 'connect_domain',
                'title' => 'Connect your custom domain',
                'description' => 'Give your store a professional look with a custom domain.',
                'completed' => $hasTable('tenant_domains') && \App\Models\TenantDomain::where('tenant_id', $tenantId)->exists(),
                'action_url' => '/settings/domains',
            ],
            [
                'id' => 'add_product',
                'title' => 'Add your first product',
                'description' => 'Upload a product image, set a price, and start selling.',
                'completed' => $hasTable('products') && \App\Models\Ecommerce\Product::exists(), 
                'action_url' => '/ecommerce/products/new',
            ],
            [
                'id' => 'setup_payments',
                'title' => 'Set up payment gateways',
                'description' => 'Enable bKash or SSLCommerz to accept payments.',
                'completed' => $hasTable('tenant_payment_configs') && \App\Models\TenantPaymentConfig::where('tenant_id', $tenantId)->exists(),
                'action_url' => '/settings/payments',
            ],
            [
                'id' => 'setup_email',
                'title' => 'Verify sender email',
                'description' => 'Ensure your order notifications land in customers\' inboxes.',
                'completed' => $hasTable('tenant_email_configs') && \App\Models\TenantEmailConfig::where('tenant_id', $tenantId)->where('verification_status', 'verified')->exists(),
                'action_url' => '/settings/email',
            ],
        ];

        return [
            'title' => 'Your Starter Journey',
            'progress' => count($steps) > 0 ? round((count(array_filter($steps, fn($s) => $s['completed'])) / count($steps)) * 100) : 0,
            'steps' => $steps,
        ];
    }

    /**
     * Get growth/upsell path for restricted modules.
     */
    protected function getGrowthPath(string $tenantId, array $activeKeys): array
    {
        $allModules = [
            'whatsapp' => ['title' => 'WhatsApp Marketing', 'plan' => 'Pro'],
            'reviews'  => ['title' => 'Customer Reviews', 'plan' => 'Pro'],
            'loyalty'  => ['title' => 'Loyalty Program', 'plan' => 'Growth'],
            'pos'      => ['title' => 'Point of Sale (POS)', 'plan' => 'Pro'],
        ];

        $locked = [];
        foreach ($allModules as $slug => $info) {
            if (!in_array($slug, $activeKeys)) {
                $locked[] = [
                    'slug' => $slug,
                    'title' => $info['title'],
                    'required_plan' => $info['plan'],
                    'is_locked' => true
                ];
            }
        }

        return $locked;
    }

    /**
     * Aggregates recent activities from all active modules.
     */
    private function getRecentActivity(array $activeKeys): array
    {
        $activities = collect();

        $hasTable = fn($t) => \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable($t);

        if (in_array('ecommerce', $activeKeys) && $hasTable('orders')) {
            try {
                Order::latest()->limit(5)->get()->each(function ($order) use ($activities) {
                    $activities->push([
                        'module'  => 'ecommerce',
                        'type'    => 'new_order',
                        'message' => "New order #{$order->order_number} received",
                        'amount'  => $order->total_amount,
                        'time'    => $order->created_at,
                    ]);
                });
            } catch (\Exception $e) {}
        }

        if (in_array('hrm', $activeKeys) && $hasTable('attendances')) {
            try {
                Attendance::latest()->limit(5)->get()->each(function ($attendance) use ($activities) {
                    $activities->push([
                        'module'  => 'hrm',
                        'type'    => 'attendance',
                        'message' => 'Staff attendance recorded',
                        'time'    => $attendance->created_at,
                    ]);
                });
            } catch (\Exception $e) {}
        }

        if (in_array('finance', $activeKeys) && $hasTable('transactions')) {
            try {
                Transaction::latest()->limit(5)->get()->each(function ($trx) use ($activities) {
                    $activities->push([
                        'module'  => 'finance',
                        'type'    => 'transaction',
                        'message' => "Financial transaction: {$trx->description}",
                        'amount'  => $trx->amount,
                        'time'    => $trx->date,
                    ]);
                });
            } catch (\Exception $e) {}
        }

        // Always include security audits if they exist
        try {
            if (\Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable('audit_logs')) {
                \App\Models\AuditLog::latest()->limit(5)->get()->each(function ($log) use ($activities) {
                    $activities->push([
                        'module'  => 'starter',
                        'type'    => 'security',
                        'message' => "Security: {$log->action} by user {$log->user_id}",
                        'time'    => $log->created_at,
                    ]);
                });
            }
        } catch (\Exception $e) {}

        return $activities->sortByDesc('time')->values()->take(15)->all();
    }

    /**
     * Aggregates order totals by month for the last 12 months.
     */
    protected function getMonthlySalesData(array $activeKeys): array
    {
        if (!in_array('ecommerce', $activeKeys)) return [];

        $hasTable = \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable('ec_orders');
        if (!$hasTable) return [];

        $data = Order::on('tenant_dynamic')
            ->selectRaw('DATE_FORMAT(created_at, "%b") as month, SUM(total) as sales')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month', DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'))
            ->get();

        return $data->map(fn($item) => [
            'month' => $item->month,
            'sales' => (float)$item->sales
        ])->toArray();
    }

    /**
     * Aggregates daily income/expense for the last 7 days.
     */
    protected function getWeeklyStatistics(array $activeKeys): array
    {
        if (!in_array('finance', $activeKeys)) return ['data' => [], 'labels' => ['Received Amount', 'Due Amount']];

        $hasTable = \Illuminate\Support\Facades\Schema::connection('tenant_dynamic')->hasTable('ec_finance_transactions');
        if (!$hasTable) return ['data' => [], 'labels' => ['Received Amount', 'Due Amount']];

        $days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $label = now()->subDays($i)->format('D');
            $days->put($date, ['name' => $label, 'received' => 0, 'due' => 0]);
        }

        // Get received (Income)
        Transaction::on('tenant_dynamic')
            ->whereHas('ledgers.account', fn($q) => $q->where('type', 'income'))
            ->where('date', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(date) as day, SUM(amount) as total')
            ->groupBy('day')
            ->get()
            ->each(function($t) use ($days) {
                if ($days->has($t->day)) {
                    $d = $days->get($t->day);
                    $d['received'] = (float)$t->total;
                    $days->put($t->day, $d);
                }
            });

        // Get due (Expense)
        Transaction::on('tenant_dynamic')
            ->whereHas('ledgers.account', fn($q) => $q->where('type', 'expense'))
            ->where('date', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(date) as day, SUM(amount) as total')
            ->groupBy('day')
            ->get()
            ->each(function($t) use ($days) {
                if ($days->has($t->day)) {
                    $d = $days->get($t->day);
                    $d['due'] = (float)$t->total;
                    $days->put($t->day, $d);
                }
            });

        return [
            'data'   => $days->values()->toArray(),
            'labels' => ['Received (Income)', 'Due (Expense)']
        ];
    }
}


