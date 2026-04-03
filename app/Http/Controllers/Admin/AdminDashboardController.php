<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AiRecommendationService;
use App\Services\UsageQuotaService;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    protected AiRecommendationService $aiService;
    protected UsageQuotaService $quotaService;

    public function __construct(
        AiRecommendationService $aiService,
        UsageQuotaService $quotaService
    ) {
        $this->aiService = $aiService;
        $this->quotaService = $quotaService;
    }
    /**
     * Render the main tenant admin dashboard.
     */
    public function index(Request $request)
    {
        // Get tenant context from middleware
        $tenantId = $request->attributes->get('tenant_id') ?? tenancy()->tenant?->id;

        // Build stats from tenant database
        $stats = $this->buildStats();

        // Recent orders (from tenant DB)
        $recentOrders = $this->getRecentOrders();

        // Tenant metadata
        $tenantInfo = $this->getTenantInfo($request);

        // AI Recommendations
        $recommendations = $this->aiService->getRecommendations($tenantId);

        // Revenue Analytics (30-day trend)
        $revenueTrend = collect(range(29, 0))->map(function($i) {
            $date = now()->subDays($i);
            // This would normally query an orders table grouped by day
            return [
                'date' => $date->format('M d'),
                'revenue' => rand(100, 500), // Mock data for trend visualization
            ];
        });

        // Usage Summary (Tracking & WhatsApp)
        $trackingUsage = $this->quotaService->getUsageSummary($tenantId, 'tracking');
        $whatsappUsage = $this->quotaService->getUsageSummary($tenantId, 'whatsapp');

        // Top Performers (Products & Customers)
        $topProducts = $this->getTopProducts();
        $topCustomers = $this->getTopCustomers();

        // Staff Activity (last 5 actions)
        $recentActivity = DB::table('staff_activity_logs')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user' => $log->user_name,
                'action' => $log->action,
                'module' => $log->module,
                'time' => \Carbon\Carbon::parse($log->created_at)->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'revenueTrend' => $revenueTrend,
            'tenant' => $tenantInfo,
            'aiRecommendations' => $recommendations,
            'usage' => [
                'tracking' => $trackingUsage,
                'whatsapp' => $whatsappUsage,
            ],
            'topPerformers' => [
                'products' => $topProducts,
                'customers' => $topCustomers,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }

    private function getTopProducts(): array
    {
        try {
            $productModel = '\\App\\Models\\Product';
            if (!class_exists($productModel)) return [];

            return $productModel::take(3)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sales' => rand(10, 50),
                    'revenue' => '$' . number_format(rand(500, 2000), 2),
                ])
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTopCustomers(): array
    {
        try {
            $userModel = '\\App\\Models\\User';
            if (!class_exists($userModel)) return [];

            return $userModel::take(3)
                ->get()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'orders' => rand(2, 10),
                    'spent' => '$' . number_format(rand(100, 1000), 2),
                ])
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function buildStats(): array
    {
        try {
            $orderModel = '\\App\\Models\\Order';
            $productModel = '\\App\\Models\\Product';
            $customerModel = '\\App\\Models\\User';

            $totalOrders = class_exists($orderModel) ? $orderModel::count() : 0;
            $totalProducts = class_exists($productModel) ? $productModel::count() : 0;
            $totalCustomers = class_exists($customerModel) ? $customerModel::count() : 0;

            // Revenue approximation
            $totalRevenue = class_exists($orderModel)
                ? $orderModel::where('status', 'completed')->sum('total_amount') ?? 0
                : 0;

            return [
                'total_orders' => number_format($totalOrders),
                'total_products' => number_format($totalProducts),
                'total_customers' => number_format($totalCustomers),
                'total_revenue' => '$' . number_format($totalRevenue, 2),
            ];
        } catch (\Exception $e) {
            return [
                'total_orders' => '0',
                'total_products' => '0',
                'total_customers' => '0',
                'total_revenue' => '$0.00',
            ];
        }
    }

    private function getRecentOrders(): array
    {
        try {
            $orderModel = '\\App\\Models\\Order';
            if (!class_exists($orderModel)) return [];

            return $orderModel::latest()
                ->take(5)
                ->get()
                ->map(fn($o) => [
                    'id' => $o->id,
                    'customer_name' => $o->customer_name ?? ($o->user?->name ?? 'Guest'),
                    'items_count' => $o->items?->count() ?? 1,
                    'total' => '$' . number_format($o->total_amount ?? 0, 2),
                    'status' => $o->status ?? 'pending',
                    'created_at' => $o->created_at?->diffForHumans() ?? 'N/A',
                ])
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getTenantInfo(Request $request): array
    {
        $tenant = tenancy()->tenant;
        return [
            'id' => $tenant?->id,
            'name' => $tenant?->name ?? $request->getHost(),
            'domain' => $tenant?->domains?->first()?->domain ?? $request->getHost(),
            'business_purpose' => $tenant?->data?->business_purpose ?? $tenant?->business_purpose ?? 'ecommerce',
        ];
    }
}
