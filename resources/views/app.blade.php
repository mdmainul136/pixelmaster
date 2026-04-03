<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead

        {{-- IOR Theme Branding --}}
        @php
            $tenant = function_exists('tenant') ? tenant() : null;
            $purpose = $tenant ? ($tenant->business_category ?? $tenant->business_type ?? ($tenant->data['business_category'] ?? null)) : null;
        @endphp

        @if($purpose === 'cross-border-ior' && class_exists('\App\Modules\CrossBorderIOR\Services\ThemeService'))
            @php
                $colors = \App\Modules\CrossBorderIOR\Services\ThemeService::getBrandingColors();
            @endphp
            <style id="ior-branding-styles">
                :root {
                    --ior-primary: {{ $colors['primary'] }};
                    --ior-primary-rgb: {{ implode(',', sscanf($colors['primary'], "#%02x%02x%02x")) }};
                    --ior-secondary: {{ $colors['secondary'] }};
                    --ior-accent: {{ $colors['accent'] }};
                }
            </style>
        @endif
    </head>
    <body class="font-sans antialiased bg-gray-50">
        @inertia
    </body>
</html>
