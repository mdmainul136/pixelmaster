<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;

class ListTenants extends Command
{
    protected $signature = 'tenant:list';
    protected $description = 'List all tenants';

    public function handle()
    {
        $tenants = Tenant::all(['id', 'tenant_id', 'tenant_name', 'status', 'provisioning_status', 'database_name']);
        
        $this->table(
            ['ID', 'Tenant ID', 'Name', 'Status', 'Provisioning', 'Database'],
            $tenants->toArray()
        );
    }
}
