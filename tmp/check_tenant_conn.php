<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

$tenant = Tenant::find('growth-test');
if (!$tenant) {
    die("Tenant growth-test NOT found.\n");
}

try {
    tenancy()->initialize($tenant);
    echo "Tenancy initialized for growth-test.\n";
    
    $connections = array_keys(config('database.connections'));
    echo "Connections: " . implode(', ', $connections) . "\n";
    
    if (isset(config('database.connections')['tenant'])) {
        echo "Tenant connection DEFINED.\n";
        print_r(config('database.connections.tenant'));
    } else {
        echo "Tenant connection NOT defined.\n";
    }
    
    try {
        $dbName = DB::connection('tenant')->getDatabaseName();
        echo "Successfully connected to 'tenant'. Database: $dbName\n";
    } catch (\Exception $e) {
        echo "Failed to connect to 'tenant': " . $e->getMessage() . "\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
