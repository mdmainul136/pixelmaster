<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Config;

class DatabaseManager
{
    /**
     * Cache for tenant database connections.
     *
     * @var array
     */
    protected static array $connectionCache = [];

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // NOTE: Database CREATION and MIGRATION are handled by stancl/tenancy:
    //   TenantCreated event â†’ Jobs\CreateDatabase â†’ Jobs\MigrateDatabase
    //   (configured in TenancyServiceProvider)
    //
    // DO NOT duplicate that work here. The methods below handle post-creation
    // tasks (plan assignment, user isolation) and cleanup only.
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Post-creation hook: assign default plan + create isolated MySQL user.
     * Called from TenancyServiceProvider after DatabaseCreated event.
     */
    public function onDatabaseCreated(\App\Models\Tenant $tenant): void
    {
        try {
            // Assign default "starter" plan if no plan set
            if (!$tenant->database_plan_id) {
                $starterPlan = \App\Models\TenantDatabasePlan::where('slug', 'starter')->first();
                if ($starterPlan) {
                    $tenant->update(['database_plan_id' => $starterPlan->id]);
                }
            }

            // Set default db_limit_gb from plan if not set
            if (!$tenant->db_limit_gb) {
                $plan = $tenant->plan ?? 'free';
                $limit = \App\Models\Tenant::$plans[$plan]['db_limit_gb'] ?? 5;
                $tenant->update(['db_limit_gb' => $limit]);
            }

            // Create isolated MySQL user for this tenant
            $isolationService = app(TenantDatabaseIsolationService::class);
            $isolationService->createIsolatedUser($tenant);

            \Log::info("Post-creation setup completed for tenant: {$tenant->id}");
        } catch (\Exception $e) {
            \Log::error("Post-creation setup failed for tenant {$tenant->id}: " . $e->getMessage());
            // Non-fatal: tenant DB is already created by stancl
        }
    }

    /**
     * Delete a tenant database.
     * NOTE: For normal tenant deletion, stancl's Jobs\DeleteDatabase handles this
     * via the TenantDeleted event. This method is for manual/cleanup operations.
     */
    public function deleteTenantDatabase(string $databaseName): void
    {
        DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");
        \Log::info("Dropped tenant database: {$databaseName}");
    }

    /**
     * Helper to switch to tenant DB by its database name (for provisioning).
     */
    public function switchToTenantDatabaseByDbName(string $databaseName): void
    {
        $tenant = \App\Models\Tenant::where('database_name', $databaseName)->first();
        if (!$tenant) return;

        $username = $tenant->db_username ?? config('tenant.database.username');
        $password = $tenant->db_password_encrypted ?? config('tenant.database.password');

        $host = $tenant->db_host ?? config('tenant.database.host');
        $port = $tenant->db_port ?? config('tenant.database.port');

        Config::set('database.connections.tenant_dynamic', [
            'driver'   => 'mysql',
            'host'     => $host,
            'port'     => $port,
            'database' => $databaseName,
            'username' => $username,
            'password' => $password,
            'charset'  => config('tenant.database.charset'),
            'collation'=> config('tenant.database.collation'),
            'prefix'   => config('tenant.database.prefix'),
            'strict'   => config('tenant.database.strict'),
            'engine'   => config('tenant.database.engine'),
        ]);

        // Also register as 'tenant' for legacy/model compatibility
        Config::set('database.connections.tenant', config('database.connections.tenant_dynamic'));

        DB::purge('tenant_dynamic');
        DB::reconnect('tenant_dynamic');
        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    /**
     * Create admin user and roles in tenant database.
     *
     * @param string $databaseName
     * @param string $email
     * @param string $password
     * @return void
     */
    public function createAdminUser(string $databaseName, string $email, string $password): void
    {
        \Log::info("Setting up admin user in database: {$databaseName}");
        $connection = $this->getTenantConnection($databaseName);
        $tenant = \App\Models\Tenant::where('database_name', $databaseName)->first();
        
        // 1. Create the user in the CENTRAL database (Idempotent)
        $user = \App\Models\User::on('central')->updateOrCreate(
            ['email' => $email],
            [
                'name' => $tenant->admin_name ?? 'Admin',
                'password' => $password, 
                'role' => 'admin', // Legacy field
                'status' => 'active',
            ]
        );

        // 2. Create 'TenantMembership' in CENTRAL database (Link user to workspace as Owner)
        if ($tenant) {
            \App\Models\TenantMembership::on('central')->updateOrInsert(
                ['tenant_id' => $tenant->id, 'user_id' => $user->id],
                [
                    'email' => $email,
                    'role' => 'owner',
                    'status' => 'active',
                    'invited_at' => now(),
                    'accepted_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Create 'owner' role in TENANT database
        $roleId = $connection->table('roles')->where('name', 'owner')->value('id');
        if (!$roleId) {
            $roleId = $connection->table('roles')->insertGetId([
                'name' => 'owner',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Assign 'owner' role to user in TENANT database
        $exists = $connection->table('model_has_roles')
            ->where('role_id', $roleId)
            ->where('model_type', \App\Models\User::class)
            ->where('model_id', $user->id)
            ->exists();

        if (!$exists) {
            $connection->table('model_has_roles')->insert([
                'role_id' => $roleId,
                'model_type' => \App\Models\User::class,
                'model_id' => $user->id,
            ]);
        }

        \Log::info("Admin user ownership setup completed for: " . ($tenant->id ?? $databaseName));
    }

    /**
     * Seed business settings into tenant database from the master tenant record.
     */
    public function seedBusinessSettings(\App\Models\Tenant $tenant): void
    {
        \Log::info("Seeding business settings for tenant {$tenant->tenant_id}. Master Connection DB: " . DB::connection('mysql')->getDatabaseName());
        $connection = $this->getTenantConnection($tenant->database_name);
        $now = now();

        $settings = [
            ['key' => 'store_name',      'value' => $tenant->tenant_name, 'group' => 'general'],
            ['key' => 'company_name',    'value' => $tenant->company_name, 'group' => 'general'],
            ['key' => 'business_type',   'value' => $tenant->business_type, 'group' => 'general'],
            ['key' => 'owner_name',      'value' => $tenant->admin_name, 'group' => 'general'],
            ['key' => 'email',           'value' => $tenant->admin_email, 'group' => 'general'],
            ['key' => 'phone',           'value' => $tenant->phone, 'group' => 'communication'],
            ['key' => 'address',         'value' => $tenant->address, 'group' => 'general'],
            ['key' => 'city',            'value' => $tenant->city, 'group' => 'general'],
            ['key' => 'country',         'value' => $tenant->country, 'group' => 'general'],
        ];

        // Add localizations if present
        if ($tenant->localizations) {
            $settings[] = ['key' => 'localizations', 'value' => json_encode($tenant->localizations), 'group' => 'localization'];
            
            // Extract individual localized names for flatter access
            if (isset($tenant->localizations['tenant_name'])) {
                foreach ($tenant->localizations['tenant_name'] as $lang => $name) {
                    $settings[] = ['key' => "store_name_{$lang}", 'value' => $name, 'group' => 'localization'];
                }
            }
            if (isset($tenant->localizations['admin_name'])) {
                foreach ($tenant->localizations['admin_name'] as $lang => $name) {
                    $settings[] = ['key' => "owner_name_{$lang}", 'value' => $name, 'group' => 'localization'];
                }
            }
        }

        foreach ($settings as $setting) {
            $connection->table('business_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'group' => $setting['group'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        \Log::info("Seeded business settings for tenant: {$tenant->tenant_id}");
    }

    /**
     * Get tenant-specific database connection.
     *
     * @param string $databaseName
     * @return \Illuminate\Database\Connection
     */
    public function getTenantConnection(string $databaseName)
    {
        // Check cache first
        if (isset(self::$connectionCache[$databaseName])) {
            return self::$connectionCache[$databaseName];
        }

        // Create new connection configuration
        $connectionName = 'tenant_' . $databaseName;

        // FETCH ISOLATED CREDENTIALS:
        // Try to find the tenant that owns this database to get its specific user credentials
        $tenant = \App\Models\Tenant::where('database_name', $databaseName)->first();
        
        $username = $tenant->db_username ?? config('tenant.database.username');
        $password = $tenant->db_password_encrypted ?? config('tenant.database.password');
        
        $host = $tenant->db_host ?? config('tenant.database.host');
        $port = $tenant->db_port ?? config('tenant.database.port');
        
        Config::set("database.connections.{$connectionName}", [
            'driver' => 'mysql',
            'host' => $host,
            'port' => $port,
            'database' => $databaseName,
            'username' => $username,
            'password' => $password,
            'charset' => config('tenant.database.charset'),
            'collation' => config('tenant.database.collation'),
            'prefix' => config('tenant.database.prefix'),
            'strict' => config('tenant.database.strict'),
            'engine' => config('tenant.database.engine'),
        ]);

        // Get and cache connection
        $connection = DB::connection($connectionName);
        self::$connectionCache[$databaseName] = $connection;

        return $connection;
    }

    /**
     * Switch to tenant database dynamically.
     *
     * @param string $tenantId
     * @return void
     */
    public function switchToTenantDatabase(string $tenantId): void
    {
        $tenant = \App\Models\Tenant::find($tenantId);

        if (!$tenant || $tenant->status !== 'active') {
            throw new \Exception('Tenant not found or inactive');
        }

        $databaseName = $tenant->database_name;

        // FETCH ISOLATED CREDENTIALS:
        // Use the tenant-specific isolated MySQL user if available
        $username = $tenant->db_username ?? config('tenant.database.username');
        $password = $tenant->db_password_encrypted ?? config('tenant.database.password');
        
        $host = $tenant->db_host ?? config('tenant.database.host');
        $port = $tenant->db_port ?? config('tenant.database.port');
        
        // Set the tenant connection as default
        Config::set('database.connections.tenant_dynamic', [
            'driver' => 'mysql',
            'host' => $host,
            'port' => $port,
            'database' => $databaseName,
            'username' => $username,
            'password' => $password,
            'charset' => config('tenant.database.charset'),
            'collation' => config('tenant.database.collation'),
            'prefix' => config('tenant.database.prefix'),
            'strict' => config('tenant.database.strict'),
            'engine' => config('tenant.database.engine'),
        ]);

        // Also register as 'tenant' for legacy/model compatibility
        Config::set('database.connections.tenant', config('database.connections.tenant_dynamic'));

        // Purge old connections and reconnect
        DB::purge('tenant_dynamic');
        DB::reconnect('tenant_dynamic');
        DB::purge('tenant');
        DB::reconnect('tenant');
        
        // CRITICAL: Set as default connection for this request
        DB::setDefaultConnection('tenant_dynamic');
    }
}

