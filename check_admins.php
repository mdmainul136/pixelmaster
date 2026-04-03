<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'mdmainul8136@gmail.com';

echo "Checking Email: $email\n";

$user = \App\Models\User::on('central')->where('email', $email)->first();
if ($user) {
    echo "USER Table (central): FOUND (ID: {$user->id}, Role: {$user->role})\n";
} else {
    echo "USER Table (central): NOT FOUND\n";
}

$super = \App\Models\SuperAdmin::where('email', $email)->first();
if ($super) {
    echo "SUPER_ADMINS Table: FOUND (ID: {$super->id})\n";
} else {
    echo "SUPER_ADMINS Table: NOT FOUND\n";
}

$tenant = \App\Models\Tenant::on('central')->where('admin_email', $email)->first();
if ($tenant) {
    echo "TENANT Owned: Found tenant {$tenant->id}\n";
} else {
    echo "TENANT Owned: NOT FOUND\n";
}
