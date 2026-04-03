<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'starter',
                'name' => 'Starter Plan',
                'description' => 'Entry-level for small businesses.',
                'price' => 0.00,
                'allowed_modules' => ['ecommerce', 'crm', 'notifications', 'pages', 'cross-border-ior', 'inventory'],
                'features' => json_encode(['Basic tracking', 'Email support', 'Up to 3 admin users']),
            ],
            [
                'slug' => 'growth',
                'name' => 'Growth Plan',
                'description' => 'Advanced features for scaling businesses.',
                'price' => 49.99,
                'allowed_modules' => [
                    'ecommerce', 'crm', 'notifications', 'pages',
                    'inventory', 'finance', 'hrm', 'pos', 'marketing',
                    'analytics', 'branches', 'loyalty', 'reviews', 
                    'seo-manager', 'whatsapp', 'cross-border-ior'
                ],
                'features' => json_encode(['HS Code lookup', 'Priority support', 'Unlimited products', 'Advanced reports']),
            ],
            [
                'slug' => 'pro',
                'name' => 'Pro Suite',
                'description' => 'Full logistics orchestration and enterprise tools.',
                'price' => 199.99,
                'allowed_modules' => [
                    'ecommerce', 'crm', 'notifications', 'pages',
                    'inventory', 'finance', 'hrm', 'pos', 'marketing',
                    'analytics', 'branches', 'loyalty', 'reviews', 
                    'seo-manager', 'whatsapp', 'zatca',
                    'cross-border-ior', 'manufacturing', 'flash-sales', 'contracts',
                    'expenses', 'freelancer', 'security', 'sadad', 'maroof',
                    'national-address', 'tracking', 'automotive', 'education',
                    'events', 'fitness', 'healthcare', 'landlord', 'lms',
                    'realestate', 'restaurant', 'salon', 'travel'
                ],
                'features' => json_encode(['Dedicated account manager', 'SLA guarantee', 'Custom integrations', 'Full logistics suite']),
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(['slug' => $planData['slug']], $planData);
        }
    }
}
