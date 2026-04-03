<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GlobalSetting;

class GlobalBillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'stripe_key'           => ['group' => 'billing', 'value' => 'pk_test_placeholder'],
            'stripe_secret'        => ['group' => 'billing', 'value' => 'sk_test_placeholder'],
            'stripe_webhook_secret'=> ['group' => 'billing', 'value' => 'whsec_placeholder'],
            'sslcommerz_store_id'  => ['group' => 'billing', 'value' => 'placeholder'],
            'sslcommerz_store_password' => ['group' => 'billing', 'value' => 'placeholder'],
            'default_trial_days'   => ['group' => 'billing', 'value' => '7'],
            'quota_alert_percent'  => ['group' => 'billing', 'value' => '80'],
            'is_stripe_enabled'    => ['group' => 'billing', 'value' => '1'],
            'is_sslcommerz_enabled'=> ['group' => 'billing', 'value' => '1'],
        ];

        foreach ($settings as $key => $data) {
            GlobalSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $data['value'], 'group' => $data['group']]
            );
        }
    }
}
