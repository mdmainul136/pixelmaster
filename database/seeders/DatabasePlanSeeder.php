<?php

namespace Database\Seeders;

use App\Models\TenantDatabasePlan;
use Illuminate\Database\Seeder;

class DatabasePlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'storage_limit_gb' => 10,
                'max_tables' => 50,
                'max_connections' => 10,
                'price' => 0.00,
                'is_active' => true,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'storage_limit_gb' => 25,
                'max_tables' => 200,
                'max_connections' => 50,
                'price' => 99.00,
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'storage_limit_gb' => 100,
                'max_tables' => null, 
                'max_connections' => 250,
                'price' => 299.00,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            TenantDatabasePlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
