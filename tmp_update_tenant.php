<?php

use App\Models\Tenant;
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tenantId = 'mdmainul81361';
$newEmail = 'mdmainul8136@gmail.com';

$tenant = Tenant::on('central')->find($tenantId);

if ($tenant) {
    $tenant->admin_email = $newEmail;
    $tenant->save();
    echo "SUCCESS: Tenant $tenantId updated to $newEmail\n";
} else {
    echo "ERROR: Tenant $tenantId not found\n";
    
    // List some tenants to see what's there
    $tenants = Tenant::on('central')->limit(5)->get();
    foreach ($tenants as $t) {
        echo " - {$t->id} ({$t->admin_email})\n";
    }
}
