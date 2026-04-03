<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\TenantDomain;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TenantService
{
    protected DatabaseManager $databaseManager;
    protected RegionDatabaseRouter $regionRouter;

    public function __construct(DatabaseManager $databaseManager, RegionDatabaseRouter $regionRouter)
    {
        $this->databaseManager = $databaseManager;
        $this->regionRouter = $regionRouter;
    }

    /**
     * Create a new tenant with database provisioning.
     * 
     * Flow:
     *   1. Tenant::create() â†’ fires TenantCreated event
     *   2. Stancl automatically: CreateDatabase â†’ MigrateDatabase (sync)
     *   3. DatabaseCreated event â†’ onDatabaseCreated() (plan + isolation)
     *   4. SeedTenantInitialData job â†’ admin user, business settings, modules
     *
     * @param array $data
     * @return Tenant
     * @throws \Exception
     */
    public function createTenant(array $data): Tenant
    {
        try {
            // Generate database name
            $databaseName = Tenant::generateDatabaseName($data['tenantId']);

            // Determine domain
            $baseDomain = parse_url(config('app.url'), PHP_URL_HOST);
            $domain = $data['tenantId'] . '.' . $baseDomain;

            // â”€â”€ Auto-assign regional database server â”€â”€
            $country = $data['country'] ?? 'Unknown';
            
            // Map server_location to canonical trigger country for regional routing
            if (!empty($data['server_location'])) {
                if ($data['server_location'] === 'eu') {
                    $country = 'Ireland';
                } elseif ($data['server_location'] === 'global') {
                    $country = 'United States';
                }
            }

            $regionConfig = $this->regionRouter->getServerConfig($country);
            $dbConnection = $this->regionRouter->getConnectionName($country);

            \Log::info("Tenant {$data['tenantId']} from {$country} â†’ region: {$regionConfig['region']} â†’ connection: {$dbConnection} â†’ host: {$regionConfig['host']}:{$regionConfig['port']}");

            // â”€â”€ Industry vs Legal Type Split â”€â”€
            $legalTypes = ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'startup', 'nonprofit', 'franchise', 'cooperative'];
            $inputBt = $data['businessType'] ?? 'ecommerce';
            
            $businessType = 'llc'; // Default legal structure
            $businessCategory = $data['businessCategory'] ?? 'ecommerce'; // Use explicit category if provided

            if (in_array($inputBt, $legalTypes)) {
                $businessType = $inputBt;
                // Only default to 'business-website' if no explicit category was provided
                if (empty($data['businessCategory'])) {
                    $businessCategory = 'business-website';
                }
            } else {
                $businessCategory = $inputBt;
                $businessType = $data['legalType'] ?? 'llc';
            }

            $plan = $data['plan'] ?? 'free';

            // Calculate total price
            $totalPrice = Tenant::$plans[$plan]['price'] ?? 0;

            $status = ($totalPrice > 0) ? Tenant::STATUS_PENDING_PAYMENT : Tenant::STATUS_ACTIVE;

            // â”€â”€ Create tenant record â”€â”€
            $tenant = Tenant::create([
                'id' => $data['tenantId'],
                'tenant_name' => $data['tenantName'],
                'company_name' => $data['companyName'],
                'business_type' => $businessType,
                'business_category' => $businessCategory,
                'admin_name' => $data['adminName'],
                'database_name' => $databaseName,
                'admin_email' => $data['adminEmail'],
                'phone' => $data['phone'] ?? '',
                'address' => $data['address'] ?? '',
                'city' => $data['city'] ?? '',
                'country' => $country,
                'cr_number' => $data['cr_number'] ?? null,
                'vat_number' => $data['vat_number'] ?? null,
                'domain' => $domain,
                'status' => $status, 
                'provisioning_status' => 'queued',
                'plan' => $plan,
                'db_limit_gb' => Tenant::$plans[$plan]['db_limit_gb'] ?? 2,
                // Regional DB server assignment
                'tenancy_db_connection' => $dbConnection,
                'db_host' => $regionConfig['host'],
                'db_port' => $regionConfig['port'],
                'db_region' => $regionConfig['region'],
                'data' => [
                    'initial_plan_price' => $totalPrice,
                    'marketing_consent' => $data['marketing_consent'] ?? false,
                    'terms_consent' => $data['terms_consent'] ?? false,
                    'server_location' => $data['server_location'] ?? 'global',
                    'is_agency' => !empty($data['is_agency']),
                    'agency_name' => $data['agency_name'] ?? null,
                ],
            ]);

            // Create initial invoice if total price > 0
            if ($totalPrice > 0) {
                \App\Models\Invoice::create([
                    'tenant_id' => $tenant->id,
                    'invoice_number' => \App\Models\Invoice::generateInvoiceNumber(),
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(3), // 3 days grace period
                    'subscription_type' => 'monthly',
                    'subtotal' => $totalPrice,
                    'tax' => 0,
                    'discount' => 0,
                    'total' => $totalPrice,
                    'status' => 'pending',
                    'notes' => "Subscription for {$plan} plan",
                    'metadata' => [
                        'plan_slug' => $plan,
                        'plan_price' => $totalPrice,
                    ],
                ]);
            }

            // At this point, stancl has ALREADY created + migrated the tenant DB.
            
            // Register domain (atomic & idempotent)
            \Illuminate\Support\Facades\DB::statement(
                "INSERT IGNORE INTO tenant_domains (tenant_id, domain, is_primary, is_verified, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [$data['tenantId'], $domain, 1, 1, 'verified', now(), now()]
            );

            $password = $data['adminPassword'] ?? 'password';
            \App\Jobs\SeedTenantInitialData::dispatchSync($data['tenantId'], $password);

            return $tenant;
        } catch (\Exception $e) {
            \Log::error("Tenant creation failed for {$data['tenantId']}: " . $e->getMessage());
            
            // â”€â”€ Atomic Cleanup â”€â”€
            try {
                $tenant = Tenant::find($data['tenantId']);
                if ($tenant) {
                    \Log::info("Cleaning up failed tenant registration: {$tenant->id}");
                    // This will also trigger Stancl's database deletion if HasDatabase trait is used
                    $tenant->delete(); 
                } else {
                    // If tenant record wasn't even created but DB might have been (rare)
                    $databaseName = Tenant::generateDatabaseName($data['tenantId']);
                    $this->databaseManager->deleteTenantDatabase($databaseName);
                }
                
                // Explicitly delete domain if insert ignore was used but we want it gone
                \Illuminate\Support\Facades\DB::table('tenant_domains')
                    ->where('tenant_id', $data['tenantId'])
                    ->delete();

            } catch (\Exception $cleanupError) {
                \Log::error("Cleanup also failed for {$data['tenantId']}: " . $cleanupError->getMessage());
            }

            throw $e;
        }
    }

    /**
     * Check the status of tenant provisioning.
     */
    public function checkProvisioningStatus(string $tenantId): array
    {
        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            return ['success' => false, 'message' => 'Tenant not found'];
        }

        return [
            'success' => true,
            'status' => $tenant->provisioning_status,
            'is_ready' => $tenant->canAccessDashboard() && $tenant->provisioning_status === 'completed',
            'domain' => $tenant->domain
        ];
    }

    /**
     * Validate tenant ID format (alphanumeric and hyphens only).
     *
     * @param string $tenantId
     * @return bool
     */
    public function validateTenantId(string $tenantId): bool
    {
        return preg_match('/^[a-z0-9-]+$/', $tenantId) === 1;
    }

    /**
     * Check if tenant exists.
     *
     * @param string $tenantId
     * @return bool
     */
    public function tenantExists(string $tenantId): bool
    {
        return Tenant::where('id', $tenantId)->exists();
    }

    /**
     * Get tenant by ID.
     */
    public function getTenantById(string $tenantId): ?Tenant
    {
        return Tenant::find($tenantId);
    }

    /**
     * Clean up failed provisioning attempts.
     * Deletes DBs and records for tenants that stuck in 'failed' or 'pending' for too long.
     */
    public function cleanupFailedProvisioning(int $olderThanHours = 24): int
    {
        $failedTenants = Tenant::whereIn('provisioning_status', ['failed', 'pending'])
            ->where('created_at', '<=', now()->subHours($olderThanHours))
            ->get();

        $count = 0;
        foreach ($failedTenants as $tenant) {
            try {
                // Try to drop the database if it was created
                if ($tenant->provisioning_status !== 'pending') {
                    $this->databaseManager->deleteTenantDatabase($tenant->database_name);
                }
                
                Log::info("Cleaning up failed tenant: {$tenant->id}");
                $tenant->delete();
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to cleanup tenant {$tenant->id}: " . $e->getMessage());
            }
        }

        return $count;
    }

    /**
     * Get all active tenants.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllTenants()
    {
        return Tenant::orderBy('created_at', 'desc')->get();
    }
}

