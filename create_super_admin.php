<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'mdmainul8136@gmail.com';

$user = \App\Models\User::on('central')->where('email', $email)->first();

if (!$user) {
    echo "ERROR: User $email not found in central database.\n";
    exit(1);
}

$super = \App\Models\SuperAdmin::where('email', $email)->first();

if ($super) {
    echo "INFO: SuperAdmin $email already exists.\n";
} else {
    $super = new \App\Models\SuperAdmin();
    $super->name = $user->name;
    $super->email = $user->email;
    $super->password = $user->password; // Copying hashed password
    $super->role = 'super_admin';
    $super->is_active = true;
    $super->save();
    echo "SUCCESS: SuperAdmin account created for $email\n";
}
