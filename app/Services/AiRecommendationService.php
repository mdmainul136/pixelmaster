<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Module;
use App\Models\Ecommerce\Order;
use App\Models\Ecommerce\Customer;
use App\Models\Ecommerce\Product;
use Illuminate\Support\Facades\Log;

class AiRecommendationService
{
    protected ModuleService $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Get proactive module recommendations for a tenant based on growth signals.
     */
    public function getRecommendations(string $tenantId): array
    {
        $tenant = Tenant::find($tenantId);
        if (!$tenant) return [];

        // 1. Gather Signals
        $signals = $this->gatherSignals($tenant);
        
        $recommendations = [];

        // 2. Logic: CRM Recommendation
        if ($signals['order_count'] >= 50 && !$this->isModuleActive($tenantId, 'crm')) {
            $recommendations[] = [
                'slug' => 'crm',
                'confidence' => 0.95,
                'reason' => "You've processed over 50 orders. Activating the CRM module will help you manage relationships and increase customer lifetime value.",
                'priority' => 'high'
            ];
        }

        // 3. Logic: Loyalty Recommendation
        if ($signals['customer_count'] >= 100 && !$this->isModuleActive($tenantId, 'loyalty')) {
            $recommendations[] = [
                'slug' => 'loyalty',
                'confidence' => 0.88,
                'reason' => "With 100+ customers, a Loyalty program can drive repeat purchases and build brand stickiness.",
                'priority' => 'medium'
            ];
        }

        // 4. Logic: SEO AI Nudge
        if ($signals['empty_description_count'] > 0 && !$this->isModuleActive($tenantId, 'seo-manager')) {
            $recommendations[] = [
                'slug' => 'seo-manager',
                'confidence' => 0.92,
                'reason' => "We found {$signals['empty_description_count']} products without descriptions. The SEO AI module can generate optimized content for you automatically.",
                'priority' => 'high'
            ];
        }

        // 4. Logic: Regional Context (GCC/KSA)
        if (stripos($tenant->country ?? '', 'Saudi') !== false || stripos($tenant->country ?? '', 'KSA') !== false) {
            if (!$this->isModuleActive($tenantId, 'zatca')) {
                $recommendations[] = [
                    'slug' => 'zatca',
                    'confidence' => 1.0,
                    'reason' => "For businesses in Saudi Arabia, the Zatca module is essential for E-Invoicing compliance.",
                    'priority' => 'critical'
                ];
            }
            if (!$this->isModuleActive($tenantId, 'whatsapp')) {
                $recommendations[] = [
                    'slug' => 'whatsapp',
                    'confidence' => 0.85,
                    'reason' => "WhatsApp automation is highly effective in the GCC region for customer engagement and status updates.",
                    'priority' => 'high'
                ];
            }
        }

        // 5. Logic: POS for Retail
        if (stripos($tenant->business_type ?? '', 'retail') !== false && !$this->isModuleActive($tenantId, 'pos')) {
            $recommendations[] = [
                'slug' => 'pos',
                'confidence' => 0.80,
                'reason' => "Based on your retail business type, connecting your physical presence with POS will unify your inventory.",
                'priority' => 'medium'
            ];
        }

        // 6. Enrichment from Metadata
        return $this->enrichRecommendations($recommendations);
    }

    private function gatherSignals(Tenant $tenant): array
    {
        // Switch to tenant database context for stats
        $tenantId = $tenant->id;
        
        try {
            // These counts should be performed on the tenant connection
            $orderCount = Order::count();
            $customerCount = Customer::count();
            $emptyDescriptionCount = Product::whereNull('description')
                ->orWhere('description', '')
                ->orWhereRaw('LENGTH(description) < 20')
                ->count();
        } catch (\Exception $e) {
            Log::warning("Could not gather AI signals for {$tenantId}: " . $e->getMessage());
            $orderCount = 0;
            $customerCount = 0;
            $emptyDescriptionCount = 0;
        }

        return [
            'order_count' => $orderCount,
            'customer_count' => $customerCount,
            'empty_description_count' => $emptyDescriptionCount,
            'plan' => $tenant->plan,
            'business_type' => $tenant->business_type,
        ];
    }

    private function isModuleActive(string $tenantId, string $moduleKey): bool
    {
        return $this->moduleService->isModuleActive($tenantId, $moduleKey);
    }

    private function enrichRecommendations(array $recommendations): array
    {
        return array_map(function($rec) {
            $module = Module::where('slug', $rec['slug'])->first();
            if ($module) {
                $rec['name'] = $module->name;
                // Use 'features' instead of 'metadata' column
                $rec['icon'] = $module->features['icon'] ?? 'box';
                $rec['color'] = $module->features['color'] ?? '#6366f1';
            }
            return $rec;
        }, $recommendations);
    }
}
