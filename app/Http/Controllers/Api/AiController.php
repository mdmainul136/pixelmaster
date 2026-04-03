<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TenantAiSetting;
use App\Models\TenantWallet;
use App\Models\WalletTransaction;
use App\Models\Tenant;
use App\Services\AiBrainManager;

class AiController extends Controller
{
    protected $brainManager;
    protected $recommendationService;
    protected $themeGenerator;

    public function __construct(
        AiBrainManager $brainManager, 
        \App\Services\AiRecommendationService $recommendationService,
        \App\Services\AiThemeGenerator $themeGenerator
    ) {
        $this->brainManager = $brainManager;
        $this->recommendationService = $recommendationService;
        $this->themeGenerator = $themeGenerator;
    }

    /**
     * GET /api/ai/recommendations
     */
    public function getRecommendations(Request $request)
    {
        $tenantId = $request->header('X-Tenant-Id') ?: $request->attributes->get('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['success' => false, 'message' => 'Tenant identification required'], 400);
        }

        $recommendations = $this->recommendationService->getRecommendations($tenantId);

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    public function getConfig(Request $request)
    {
        $tenantId = tenancy()->tenant->id;
        $config = TenantAiSetting::where('tenant_id', $tenantId)->first();
        $wallet = TenantWallet::where('tenant_id', $tenantId)->first();

        return response()->json([
            'success' => true,
            'config' => $config,
            'wallet_balance' => $wallet ? $wallet->balance : 0,
            'cost_per_generation' => 0.50, // Example cost in credits
        ]);
    }

    public function updateConfig(Request $request)
    {
        $tenantId = tenancy()->tenant->id;
        
        $config = TenantAiSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            $request->only(['provider', 'api_key', 'model_name', 'use_platform_credits'])
        );

        return response()->json([
            'success' => true,
            'message' => 'AI Configuration updated successfully',
            'config' => $config
        ]);
    }

    public function updateBrainTraining(Request $request)
    {
        $tenantId = tenancy()->tenant->id;
        
        $config = TenantAiSetting::updateOrCreate(
            ['tenant_id' => $tenantId],
            ['training_notes' => $request->input('training_notes')]
        );

        return response()->json([
            'success' => true,
            'message' => 'AI Brain training updated successfully',
            'training_notes' => $config->training_notes
        ]);
    }

    public function generateStorefront(Request $request)
    {
        $tenantId = $request->header('X-Tenant-Id');
        $prompt = $request->input('prompt');
        
        $tenant = Tenant::findOrFail($tenantId);
        $config = TenantAiSetting::where('tenant_id', $tenantId)->first();
        
        // Construct the "Brain" context
        $systemBrain = $this->brainManager->constructBrain($tenant);
        
        $usePlatform = !$config || $config->use_platform_credits || empty($config->api_key);

        if ($usePlatform) {
            $wallet = TenantWallet::where('tenant_id', $tenantId)->first();
            $cost = 0.50;

            if (!$wallet || $wallet->balance < $cost) {
                return response()->json(['error' => 'Insufficient SaaS balance. Please add credits or use your own API key.'], 402);
            }

            $wallet->decrement('balance', $cost);
            
            WalletTransaction::create([
                'tenant_id' => $tenantId,
                'type' => 'debit',
                'service_type' => 'ai_generation',
                'amount' => $cost,
                'balance_before' => $wallet->balance + $cost,
                'balance_after' => $wallet->balance,
                'description' => 'AI Storefront Generation via SaaS Brain Engine'
            ]);
        }

        // Logic to reach out to Gemini/Claude using $systemBrain and $prompt would go here
        
        // Specialized logic simulation based on region
        $isKSA = stripos($tenant->country ?? '', 'Saudi') !== false;
        
        return response()->json([
            'brandName' => ucfirst(explode(' ', $prompt)[0] ?? 'Vision') . ($isKSA ? ' Al-Majd' : ' Hub'),
            'primaryColor' => $isKSA ? '#065f46' : '#10b981', // Deep green for KSA
            'headingFont' => $isKSA ? 'Outfit' : 'Inter',
            'heroHeading' => ($isKSA ? 'ØªÙ…ÙŠØ² Ù…Ø¹ ' : 'Empower your ') . $prompt,
            'heroSubtext' => 'Synthetically crafted by our AI Brain to match your ' . ($tenant->business_type ?? 'business') . ' in ' . ($tenant->country ?? 'your region') . '.',
            'mode' => $usePlatform ? 'platform' : 'tenant_key',
            'brain_version' => '1.2.0-localized'
        ]);
    }

    /**
     * POST /api/ai/generate-theme-tokens
     */
    public function generateThemeTokens(Request $request)
    {
        $tenantId = $request->header('X-Tenant-Id') ?: tenancy()->tenant->id;
        $tenant = Tenant::findOrFail($tenantId);

        $result = $this->themeGenerator->generateThemeTokens($tenant);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}

