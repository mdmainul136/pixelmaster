<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TenantDatabasePlan;
use App\Models\Tenant;

class TenantDatabasePlanSeeder extends Seeder
{
    public function run(): void
    {
        $silver = TenantDatabasePlan::updateOrCreate(
            ['slug' => 'silver'],
            [
                'name' => 'Silver Plan',
                'storage_limit_gb' => 5,
                'max_tables' => 100,
                'max_connections' => 50,
                'price' => 29.99,
                'is_active' => true
            ]
        );

        $gold = TenantDatabasePlan::updateOrCreate(
            ['slug' => 'gold'],
            [
                'name' => 'Gold Plan',
                'storage_limit_gb' => 20,
                'max_tables' => 500,
                'max_connections' => 150,
                'price' => 79.99,
                'is_active' => true
            ]
        );

        $enterprise = TenantDatabasePlan::updateOrCreate(
            ['slug' => 'enterprise'],
            [
                'name' => 'Enterprise Plan',
                'storage_limit_gb' => 100,
                'max_tables' => 2000,
                'max_connections' => 500,
                'price' => 199.99,
                'is_active' => true
            ]
        );

        // Assign Silver to all current tenants who don't have one
        Tenant::whereNull('database_plan_id')->update(['database_plan_id' => $silver->id]);
        
        echo "Silver, Gold, and Enterprise plans created/updated. Defaulting tenants to Silver.\n";
    }
}
