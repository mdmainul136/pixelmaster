<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\TrackingContainer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAdvisorService
{
    private ?string $apiKey;
    private string $model = 'gemini-1.5-flash';

    public function __construct(
        private CapiDiagnosticsService $diagnostics,
        private AttributionService $attribution,
        private PredictiveAiService $predictive
    ) {
        $this->apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));
    }

    /**
     * Get all insights (Rule-based + AI-powered + Benchmarking).
     */
    public function getInsights(TrackingContainer $container): array
    {
        $diagData = $this->diagnostics->calculateEmqScore($container);
        $attrData = $this->attribution->getAttribution($container->id);
        $benchmarks = $this->getIndustryBenchmarks('E-commerce');

        $insights = [];

        // 1. Benchmarking Insight (Comparative)
        $insights[] = $this->generateBenchmarkInsight($diagData, $benchmarks);

        // 1b. Predictive AI Insight (Growth Opportunity)
        $predictiveData = $this->predictive->getAggregateForecast($container->tenant_id);
        $insights[] = $this->generatePredictiveInsight($predictiveData);

        // 1. Rule-Based Insights (Deterministic)
        $insights = array_merge($insights, $this->getRuleBasedInsights($diagData, $attrData));

        // 2. Gemini AI Insights (Natural Language)
        if ($this->apiKey && $this->apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            try {
                $aiAdvice = $this->getGeminiAdvice($diagData, $attrData);
                if ($aiAdvice) {
                    $insights[] = [
                        'type' => 'AI_STRATEGY',
                        'severity' => 'Opportunity',
                        'title' => 'Gemini AI Growth Strategy',
                        'message' => $aiAdvice,
                        'impact' => 'High',
                        'action_label' => 'View Strategy',
                        'action_link' => '/ior/tracking/analytics'
                    ];
                }
            } catch (\Exception $e) {
                Log::error("[AI Advisor] Gemini call failed: " . $e->getMessage());
            }
        } else {
            $insights[] = [
                'type' => 'CONFIG',
                'severity' => 'Info',
                'title' => 'AI Power-Up Available',
                'message' => 'Connect your Gemini API Key in Settings to unlock deep natural language optimization tips.',
                'impact' => 'Medium',
                'action_label' => 'Add API Key',
                'action_link' => '/ior/settings'
            ];
        }

        return $insights;
    }

    /**
     * Heuristic rules for immediate issues.
     */
    private function getRuleBasedInsights(array $diag, array $attr): array
    {
        $rules = [];

        // EMQ Rule
        if ($diag['score'] < 6.0) {
            $rules[] = [
                'type' => 'QUALITY',
                'severity' => 'Critical',
                'title' => 'Low Match Quality Detected',
                'message' => "Your EMQ score is {$diag['score']}/10. This is causing significant signal loss in Meta CAPI.",
                'impact' => 'High',
                'action_label' => 'Fix EMQ',
                'action_link' => "/ior/tracking/diagnostics/{$diag['container_id']}"
            ];
        }

        // Attribution Gap Rule
        $firstClickTotal = 0;
        $lastClickTotal = 0;
        foreach ($attr['attributed'] as $channel) {
            // Simulated comparison logic
            $lastClickTotal += $channel['value'];
        }

        // If deduplication gap is high
        if (($diag['stats']['deduplication']['unmatched_server'] ?? 0) > 0.1) {
            $rules[] = [
                'type' => 'SYNC',
                'severity' => 'Warning',
                'title' => 'Server-Side Sync Gap',
                'message' => "10%+ of your server events aren't matching client hits. Check your event_id consistency.",
                'impact' => 'Medium',
                'action_label' => 'Audit Deduplication',
                'action_link' => "/ior/tracking/diagnostics/{$diag['container_id']}"
            ];
        }

        return $rules;
    }

    /**
     * Get Industry Benchmarks (Simulated based on global sGTM data)
     */
    public function getIndustryBenchmarks(string $vertical = 'E-commerce'): array
    {
        $data = [
            'E-commerce' => [
                'avg_emq' => 7.2,
                'avg_dedup' => 0.96,
                'avg_coverage' => ['em' => 0.88, 'ph' => 0.55, 'fbp' => 0.99, 'fbc' => 0.75],
                'top_performing_roi' => 4.2,
            ],
            'SaaS' => [
                'avg_emq' => 8.1,
                'avg_dedup' => 0.98,
                'avg_coverage' => ['em' => 0.95, 'ph' => 0.20, 'fbp' => 0.99, 'fbc' => 0.80],
                'top_performing_roi' => 3.5,
            ],
            'Lead Gen' => [
                'avg_emq' => 6.5,
                'avg_dedup' => 0.92,
                'avg_coverage' => ['em' => 0.75, 'ph' => 0.65, 'fbp' => 0.95, 'fbc' => 0.60],
                'top_performing_roi' => 5.8,
            ]
        ];

        return $data[$vertical] ?? $data['E-commerce'];
    }

    private function generateBenchmarkInsight(array $diag, array $bench): array
    {
        $diff = $diag['score'] - $bench['avg_emq'];
        $percent = abs(round(($diff / $bench['avg_emq']) * 100, 1));
        
        $status = $diff >= 0 ? 'Above' : 'Below';
        $severity = $diff >= -0.5 ? 'Info' : ($diff >= -1.5 ? 'Warning' : 'Critical');

        return [
            'type' => 'BENCHMARK',
            'severity' => $severity,
            'title' => "Market Comparison ({$status} Average)",
            'message' => "Your EMQ score ({$diag['score']}) is {$percent}% {$status} the industry average ({$bench['avg_emq']}) for E-commerce.",
            'impact' => $diff >= 0 ? 'Positive' : 'Negative',
            'action_label' => 'View Benchmarks',
            'action_link' => '#benchmarks'
        ];
    }

    private function generatePredictiveInsight(array $predictive): array
    {
        $upside = $predictive['total_predicted_upside'];
        $health = $predictive['health_score'];

        $severity = $health > 80 ? 'Success' : ($health > 50 ? 'Warning' : 'Critical');
        
        return [
            'type' => 'PREDICTIVE',
            'severity' => $severity,
            'title' => "Customer Health & LTV Forecast",
            'message' => "Your overall customer health is {$health}%. We've identified \${$upside} in 'Predicted Revenue Upside' if you retain your high-risk VIPs.",
            'impact' => $upside > 5000 ? 'High' : 'Medium',
            'action_label' => 'View AI Dashboard',
            'action_link' => '#predictive-ai'
        ];
    }

    /**
     * Call Google Gemini API for strategic analysis.
     */
    private function getGeminiAdvice(array $diag, array $attr): ?string
    {
        $prompt = $this->buildPrompt($diag, $attr);

        $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1024,
            ]
        ]);

        if ($response->successful()) {
            return $response->json('candidates.0.content.parts.0.text');
        }

        return null;
    }

    private function buildPrompt(array $diag, array $attr): string
    {
        $statsJson = json_encode([
            'emq_score' => $diag['score'],
            'rating' => $diag['rating'],
            'parameter_coverage' => $diag['stats']['coverage'],
            'top_channels' => array_slice($attr['attributed'], 0, 3)
        ]);

        return "You are a world-class Marketing Attribution & sGTM expert. 
        Analyze the following technical tracking stats for a merchant:
        {$statsJson}
        
        Provide a concise, professional, and ACTIONABLE optimization strategy (max 3 bullet points). 
        Focus on improving ROAS and Data Quality. Use a helpful but direct tone.";
    }
}
