<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Theme;
use App\Models\ThemeVendor;
use App\Models\MarketplaceTheme;
use App\Models\User;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'id' => 1,
                'name' => 'Riyadh Modern',
                'slug' => 'riyadh-modern',
                'vertical' => 'Fashion & Lifestyle',
                'config' => [
                    'brandName' => 'Riyadh Modern',
                    'primaryColor' => '#0f3460',
                    'accentColor' => '#e94560',
                    'headingFont' => 'Outfit',
                    'heroHeading' => 'New Season, New Styles',
                    'heroSubtext' => 'Discover the latest trends in Saudi fashion with our premium collection.',
                    'navStyle' => 'centered',
                ],
                'preview_url' => 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            ],
            [
                'id' => 2,
                'name' => 'Pharma Care',
                'slug' => 'pharma-care',
                'vertical' => 'Healthcare',
                'config' => [
                    'brandName' => 'Pharma Care',
                    'primaryColor' => '#22c55e',
                    'accentColor' => '#166534',
                    'headingFont' => 'Inter',
                    'heroHeading' => 'Your Health, Our Priority',
                    'heroSubtext' => 'Safe and reliable medications delivered to your doorstep across the kingdom.',
                    'navStyle' => 'sticky',
                ],
                'preview_url' => 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #86efac 100%)',
            ],
            [
                'id' => 3,
                'name' => 'Jeddah Boutique',
                'slug' => 'jeddah-boutique',
                'vertical' => 'Luxury & Premium',
                'config' => [
                    'brandName' => 'Jeddah Boutique',
                    'primaryColor' => '#c9a96e',
                    'accentColor' => '#2d2d2d',
                    'headingFont' => 'Montserrat',
                    'heroHeading' => 'Elegance Redefined',
                    'heroSubtext' => 'Experience the finest luxury items curated for the sophisticated lifestyle.',
                    'navStyle' => 'minimal',
                ],
                'preview_url' => 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0d0d0d 100%)',
            ],
            [
                'id' => 4,
                'name' => 'Skyline Luxe',
                'slug' => 'skyline-luxe',
                'vertical' => 'Real Estate',
                'config' => [
                    'brandName' => 'Skyline Luxe',
                    'primaryColor' => '#2a4a7f',
                    'accentColor' => '#c9a96e',
                    'headingFont' => 'Montserrat',
                    'heroHeading' => 'Find Your Dream Home',
                    'heroSubtext' => 'Modern apartments and villas in the heart of the city.',
                    'navStyle' => 'sticky',
                ],
                'preview_url' => 'linear-gradient(135deg, #0c1b33 0%, #1a365d 50%, #2a4a7f 100%)',
            ],
            [
                'id' => 5,
                'name' => 'Bistro Noir',
                'slug' => 'bistro-noir',
                'vertical' => 'Fine Dining',
                'config' => [
                    'brandName' => 'Bistro Noir',
                    'primaryColor' => '#1a1a1a',
                    'accentColor' => '#c9a96e',
                    'headingFont' => 'Playfair Display',
                    'heroHeading' => 'A Taste of Perfection',
                    'heroSubtext' => 'Join us for an unforgettable culinary journey tonight.',
                    'navStyle' => 'minimal',
                ],
                'preview_url' => 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)',
            ],
            [
                'id' => 6,
                'name' => 'Edu Modern',
                'slug' => 'edu-modern',
                'vertical' => 'Online Academy',
                'config' => [
                    'brandName' => 'Edu Modern',
                    'primaryColor' => '#2563eb',
                    'accentColor' => '#1e3a5f',
                    'headingFont' => 'Outfit',
                    'heroHeading' => 'Learn from the Best',
                    'heroSubtext' => 'Unlock your potential with our expert-led online courses.',
                    'navStyle' => 'centered',
                ],
                'preview_url' => 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
            ],
            [
                'id' => 7,
                'name' => 'Iron Gym',
                'slug' => 'iron-gym',
                'vertical' => 'Fitness',
                'config' => [
                    'brandName' => 'Iron Gym',
                    'primaryColor' => '#dc2626',
                    'accentColor' => '#0f0f0f',
                    'headingFont' => 'Inter',
                    'heroHeading' => 'Unleash Your Power',
                    'heroSubtext' => 'Join the elite fitness community and crush your goals.',
                    'navStyle' => 'sticky',
                ],
                'preview_url' => 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #dc2626 100%)',
            ],
            [
                'id' => 8,
                'name' => 'Corporate Edge',
                'slug' => 'corporate-edge',
                'vertical' => 'Business',
                'config' => [
                    'brandName' => 'Corporate Edge',
                    'primaryColor' => '#3b82f6',
                    'accentColor' => '#0f172a',
                    'headingFont' => 'Inter',
                    'heroHeading' => 'Solutions for Success',
                    'heroSubtext' => 'Professional consulting and services for the modern enterprise.',
                    'navStyle' => 'sticky',
                ],
                'preview_url' => 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            ],
            [
                'id' => 9,
                'name' => 'Global Sourcing',
                'slug' => 'global-sourcing',
                'vertical' => 'Supply Chain',
                'config' => [
                    'brandName' => 'Global Sourcing',
                    'primaryColor' => '#4338ca',
                    'accentColor' => '#1e1b4b',
                    'headingFont' => 'Plus Jakarta Sans',
                    'heroHeading' => 'Global Logistics, Simplified',
                    'heroSubtext' => 'Connect with suppliers and manage your supply chain seamlessly.',
                    'navStyle' => 'minimal',
                ],
                'preview_url' => 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            ],
            [
                'id' => 10,
                'name' => 'Heritage Craft',
                'slug' => 'heritage-craft',
                'vertical' => 'Artisan',
                'config' => [
                    'brandName' => 'Heritage Craft',
                    'primaryColor' => '#c84b31',
                    'accentColor' => '#4a1942',
                    'headingFont' => 'Montserrat',
                    'heroHeading' => 'Timeless Traditions',
                    'heroSubtext' => 'Authentic handmade items crafted with love and care.',
                    'navStyle' => 'centered',
                ],
                'preview_url' => 'linear-gradient(135deg, #4a1942 0%, #6b2d5b 50%, #c84b31 100%)',
            ],
            [
                'id' => 11,
                'name' => 'Seed Spice',
                'slug' => 'seed-spice',
                'vertical' => 'Food & Organic',
                'config' => [
                    'brandName' => 'Seed Spice',
                    'primaryColor' => '#06605a',
                    'accentColor' => '#ffc107',
                    'headingFont' => 'Inter',
                    'heroHeading' => 'Pure & Natural Organic Foods',
                    'heroSubtext' => 'Discover the finest selection of honey, spices, and organic products delivered to your door.',
                    'navStyle' => 'sticky',
                ],
                'preview_url' => 'linear-gradient(135deg, #06605a 0%, #0a8a81 50%, #ffc107 100%)',
            ],
            [
                'id' => 13,
                'name' => 'Lovable IOR',
                'slug' => 'lovable-ior',
                'vertical' => 'Logistics & Trade',
                'config' => [
                    'settings' => [
                        'colors' => [
                            'primary' => '#6366f1',
                            'accent' => '#4f46e5',
                            'background' => '#ffffff',
                            'foreground' => '#1e1b4b',
                        ],
                        'typography' => [
                            'heading' => 'Outfit',
                            'body' => 'Inter',
                        ],
                        'branding' => [
                            'brandNamePrimary' => 'Lovable',
                            'brandNameAccent' => 'IOR',
                            'logoLetter' => 'LI',
                            'logoBgColor' => 'hsl(243, 75%, 59%)',
                            'logoTextColor' => '#ffffff',
                        ],
                    ],
                    'sections' => [
                        [
                            'id' => 'hero-1',
                            'type' => 'ior_hero',
                            'settings' => [
                                'heading' => 'The Future of Global Marketplace Sourcing.',
                                'subtext' => 'Seamlessly import products from any global marketplace with our intelligent IOR solutions. Zero stress, full compliance.',
                                'badgeText' => 'Premium Marketplace Solutions',
                            ],
                        ],
                        [
                            'id' => 'stats-1',
                            'type' => 'ior_stats',
                            'settings' => [
                                'blocks' => [
                                    ['label' => 'Countries Covered', 'value' => '150+', 'icon' => 'globe'],
                                    ['label' => 'Customs Clearances', 'value' => '1M+', 'icon' => 'file'],
                                    ['label' => 'Transit Time', 'value' => '-40%', 'icon' => 'truck'],
                                    ['label' => 'Compliance Rate', 'value' => '99.9%', 'icon' => 'shield'],
                                ]
                            ],
                        ],
                        [
                            'id' => 'services-1',
                            'type' => 'ior_services',
                            'settings' => [
                                'title' => 'End-to-End Solutions',
                                'subtitle' => 'Our modular service suite covers every aspect of the international supply chain.',
                            ],
                        ],
                        [
                            'id' => 'partners-1',
                            'type' => 'ior_partners',
                            'settings' => [
                                'title' => 'Trusted by Industry Leaders',
                            ],
                        ],
                    ],
                ],
                'preview_url' => 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                'supported_business_types' => json_encode(['cross-border-ior']),
            ],
            [
                'id' => 14,
                'name' => 'Lovable Marketplace',
                'slug' => 'lovable-marketplace',
                'vertical' => 'E-Commerce',
                'config' => [
                    'settings' => [
                        'colors' => [
                            'primary' => '#2563eb',
                            'accent' => '#0ea5e9',
                            'background' => '#ffffff',
                            'foreground' => '#0f172a',
                        ],
                        'typography' => [
                            'heading' => 'Inter',
                            'body' => 'Inter',
                        ],
                        'branding' => [
                            'brandNamePrimary' => 'Lovable',
                            'brandNameAccent' => 'Market',
                            'logoLetter' => 'LM',
                            'logoBgColor' => '#2563eb',
                            'logoTextColor' => '#ffffff',
                        ],
                    ],
                    'sections' => [
                        [
                            'id' => 'hero-1',
                            'type' => 'marketplace_hero',
                            'settings' => [],
                        ],
                        [
                            'id' => 'categories-1',
                            'type' => 'marketplace_categories',
                            'settings' => ['title' => 'Shop by Category'],
                        ],
                        [
                            'id' => 'featured-1',
                            'type' => 'marketplace_featured',
                            'settings' => ['title' => 'Featured Products'],
                        ],
                        [
                            'id' => 'deal-1',
                            'type' => 'marketplace_deal',
                            'settings' => [],
                        ],
                        [
                            'id' => 'trending-1',
                            'type' => 'marketplace_trending',
                            'settings' => ['title' => 'Trending Now'],
                        ],
                    ],
                ],
                'preview_url' => 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 50%, #06b6d4 100%)',
            ],
        ];

        // Ensure a default setup vendor exists
        $admin = User::first();
        $vendor = ThemeVendor::updateOrCreate(
            ['slug' => 'lovable-official'],
            [
                'user_id' => $admin->id ?? 1,
                'company_name' => 'Lovable Official',
                'support_email' => 'support@lovable.io',
                'is_verified' => true,
            ]
        );

        foreach ($themes as $themeData) {
            $supportedBusinessTypes = null;
            if (isset($themeData['supported_business_types'])) {
                $supportedBusinessTypes = json_decode($themeData['supported_business_types'], true);
                unset($themeData['supported_business_types']);
            }

            $theme = Theme::updateOrCreate(['slug' => $themeData['slug']], $themeData);

            // Create/Update Marketplace entry
            MarketplaceTheme::updateOrCreate(
                ['theme_id' => $theme->id],
                [
                    'vendor_id' => $vendor->id,
                    'price' => 0,
                    'status' => 'approved',
                    'approved_at' => now(),
                    'supported_business_types' => $supportedBusinessTypes,
                ]
            );
        }
    }
}
