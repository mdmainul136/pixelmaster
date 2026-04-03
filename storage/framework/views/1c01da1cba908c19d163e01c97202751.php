<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title inertia><?php echo e(config('app.name', 'Laravel')); ?></title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        <?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.jsx']); ?>
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>

        
        <?php
            $tenant = function_exists('tenant') ? tenant() : null;
            $purpose = $tenant ? ($tenant->business_category ?? $tenant->business_type ?? ($tenant->data['business_category'] ?? null)) : null;
        ?>

        <?php if($purpose === 'cross-border-ior' && class_exists('\App\Modules\CrossBorderIOR\Services\ThemeService')): ?>
            <?php
                $colors = \App\Modules\CrossBorderIOR\Services\ThemeService::getBrandingColors();
            ?>
            <style id="ior-branding-styles">
                :root {
                    --ior-primary: <?php echo e($colors['primary']); ?>;
                    --ior-primary-rgb: <?php echo e(implode(',', sscanf($colors['primary'], "#%02x%02x%02x"))); ?>;
                    --ior-secondary: <?php echo e($colors['secondary']); ?>;
                    --ior-accent: <?php echo e($colors['accent']); ?>;
                }
            </style>
        <?php endif; ?>
    </head>
    <body class="font-sans antialiased bg-gray-50">
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } elseif (config('inertia.use_script_element_for_initial_page')) { ?><script data-page="app" type="application/json"><?php echo json_encode($page); ?></script><div id="app"></div><?php } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
    </body>
</html>
<?php /**PATH E:\Mern Stact Dev\pixelmastersgtm\resources\views/app.blade.php ENDPATH**/ ?>