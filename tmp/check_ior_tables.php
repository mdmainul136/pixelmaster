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
    
    foreach (['mysql', 'tenant', 'tenant_dynamic'] as $conn) {
        try {
            $config = config("database.connections.$conn");
            $dbName = DB::connection($conn)->getDatabaseName();
            
            $host = $config['host'] ?? 'N/A';
            $port = $config['port'] ?? 'N/A';
            $user = $config['username'] ?? 'N/A';
            
            $tables = DB::connection($conn)->select("SHOW TABLES LIKE 'ior_carts'");
            $count = count($tables);
            
            echo "Connection '$conn' -> Host: $host, Port: $port, User: $user, DB: $dbName -> ior_carts exist: " . ($count > 0 ? 'YES' : 'NO') . "\n";
            
            if ($count > 0) {
                 $columns = DB::connection($conn)->select("SHOW COLUMNS FROM ior_carts");
                 echo "Columns in ior_carts ($conn): " . implode(', ', array_column($columns, 'Field')) . "\n";
            }
        } catch (\Exception $e) {
            echo "Connection '$conn' FAILED: " . $e->getMessage() . "\n";
        }
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
