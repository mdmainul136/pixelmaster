<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Schema;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::connection('central')->disableForeignKeyConstraints();
        SubscriptionPlan::truncate();
        Schema::connection('central')->enableForeignKeyConstraints();

        $plans = [
            [
                'name' => 'Starter (sGTM)',
                'plan_key' => 'starter',
                'description' => 'Perfect for small businesses starting with server-side tracking.',
                'price_monthly' => 0.00,
                'price_yearly' => 0.00,
                'currency' => 'USD',
                'quotas' => ['events' => 100000, 'containers' => 1],
                'prices_ppp' => ['USD' => 0, 'BDT' => 0],
                'features' => ['100k Events/mo', '1 sGTM Container', '30 Day History', 'Standard Support'],
                'is_active' => true,
            ],
            [
                'name' => 'Growth (sGTM)',
                'plan_key' => 'growth',
                'description' => 'Advanced attribution and scaling for high-traffic stores.',
                'price_monthly' => 299.00,
                'price_yearly' => 2990.00,
                'currency' => 'USD',
                'quotas' => ['events' => 500000, 'containers' => 3],
                'prices_ppp' => ['USD' => 299, 'BDT' => 12000],
                'features' => ['500k Events/mo', '3 sGTM Containers', '90 Day History', 'Full Attribution Modeler'],
                'is_active' => true,
            ],
            [
                'name' => 'Pro (sGTM)',
                'plan_key' => 'pro',
                'description' => 'Unlimited potential for professional marketers and agencies.',
                'price_monthly' => 799.00,
                'price_yearly' => 7990.00,
                'currency' => 'USD',
                'quotas' => ['events' => 2000000, 'containers' => -1],
                'prices_ppp' => ['USD' => 799, 'BDT' => 35000],
                'features' => ['2M Events/mo', 'Unlimited Containers', '1 Year History', 'Priority Support'],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(
                ['plan_key' => $planData['plan_key']],
                $planData
            );
        }
    }
}
