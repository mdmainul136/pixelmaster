<?php

namespace App\Modules\Tracking\Services;

use App\Models\Tracking\CustomerIdentity;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PredictiveAiService
{
    /**
     * Calculate predictive metrics for a specific customer.
     */
    public function calculateCustomerScore(CustomerIdentity $identity): array
    {
        $now = Carbon::now();
        $ltv = $identity->total_spent;
        $orderCount = $identity->order_count;
        $lastOrder = $identity->last_order_at;

        // 1. Predicted 12-Month LTV (Heuristic: 30-day velocity * multiplier)
        $daysSinceFirst = $identity->first_order_at ? $now->diffInDays($identity->first_order_at) : 0;
        $daysToPredict = 365;

        if ($daysSinceFirst > 0 && $orderCount > 0) {
            $dailyValue = $ltv / max(1, $daysSinceFirst);
            $predictedLtv = $ltv + ($dailyValue * $daysToPredict);
        } else {
            $predictedLtv = $ltv * 1.5; // Conservative estimate for new prospects
        }

        // 2. Churn Probability (RFM Logic)
        $avgInterval = $this->getAverageOrderInterval($identity);
        $daysSinceLast = $lastOrder ? $now->diffInDays($lastOrder) : 999;
        
        $churnProb = 0;
        if ($orderCount > 0) {
            if ($daysSinceLast > ($avgInterval * 2.5)) {
                $churnProb = 95; // Highly Likely Churned
            } elseif ($daysSinceLast > ($avgInterval * 1.5)) {
                $churnProb = 75; // Critical Warning
            } elseif ($daysSinceLast > $avgInterval) {
                $churnProb = 45; // Warning
            } else {
                $churnProb = 15; // Healthy
            }
        } else {
            $churnProb = 50; // Prospect churn risk is usually high/unknown
        }

        $riskLevel = match (true) {
            $churnProb > 80 => 'Critical',
            $churnProb > 60 => 'High',
            $churnProb > 30 => 'Warning',
            default         => 'Safe',
        };

        return [
            'predicted_ltv_12m' => round($predictedLtv, 2),
            'churn_probability' => $churnProb,
            'risk_level'        => $riskLevel,
            'avg_interval_days' => $avgInterval,
        ];
    }

    /**
     * Aggregate forecasts for the entire tenant.
     */
    public function getAggregateForecast(int $tenantId): array
    {
        $identities = CustomerIdentity::where('tenant_id', $tenantId)->get();
        
        $totalPredictedLtv = 0;
        $riskCount = ['Safe' => 0, 'Warning' => 0, 'High' => 0, 'Critical' => 0];
        $vipAtRisk = 0;

        foreach ($identities as $identity) {
            $score = $this->calculateCustomerScore($identity);
            $totalPredictedLtv += $score['predicted_ltv_12m'];
            $riskCount[$score['risk_level']]++;

            if ($identity->customer_segment === 'vip' && in_array($score['risk_level'], ['High', 'Critical'])) {
                $vipAtRisk++;
            }
        }

        return [
            'total_predicted_upside' => round($totalPredictedLtv - $identities->sum('total_spent'), 2),
            'risk_distribution'     => $riskCount,
            'vip_at_risk'           => $vipAtRisk,
            'health_score'          => $this->calculateHealthScore($riskCount),
        ];
    }

    private function getAverageOrderInterval(CustomerIdentity $identity): int
    {
        $first = $identity->first_order_at;
        $last = $identity->last_order_at;
        $orders = $identity->order_count;

        if ($orders > 1 && $first && $last) {
            return (int) ($first->diffInDays($last) / ($orders - 1));
        }

        return 45; // Default industry average for E-commerce repeat buys
    }

    private function calculateHealthScore(array $distribution): int
    {
        $total = array_sum($distribution);
        if ($total === 0) return 100;

        $weightedFactor = ($distribution['Safe'] * 1.0) + 
                          ($distribution['Warning'] * 0.7) + 
                          ($distribution['High'] * 0.3) + 
                          ($distribution['Critical'] * 0.0);

        return (int) (($weightedFactor / $total) * 100);
    }
}
