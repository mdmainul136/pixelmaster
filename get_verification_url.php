<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GlobalSetting;
use App\Models\User;
use Illuminate\Support\Facades\URL;

// Set global setting to log
GlobalSetting::updateOrCreate(
    ['key' => 'mail_mailer'],
    ['value' => 'log']
);

$user = User::where('email', 'mdmainul8136@gmail.com')->first();

if (!$user) {
    echo "User not found\n";
    exit;
}

$url = URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(config('auth.verification.expire', 60)),
    [
        'id' => $user->getKey(),
        'hash' => sha1($user->getEmailForVerification()),
    ]
);

echo "Verification URL for mdmainul8136@gmail.com:\n";
echo $url . "\n";
