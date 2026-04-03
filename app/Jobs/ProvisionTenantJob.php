<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Services\DatabaseManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use App\Events\TenantProvisioningProgress;

/**
 * ProvisionTenantJob — Post-database tenant setup.
 *
 * IMPORTANT: Database creation & migration are handled by stancl/tenancy
 * (TenantCreated → CreateDatabase → MigrateDatabase in TenancyServiceProvider).
 * This job handles everything AFTER the database is ready:
 *   - Business settings seeding
 *   - Admin user creation
 *   - Module activation
 *   - Domain registration
 *   - Welcome emails
 */
class ProvisionTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    // NOTE: We intentionally do NOT use SerializesModels.

    public $tries = 3;
    public $backoff = [10, 30, 60];

    protected string $tenantId;
    protected string $adminPassword;

    public function __construct(Tenant $tenant, string $adminPassword)
    {
        $this->tenantId = $tenant->id;
        $this->adminPassword = $adminPassword;
    }

    private function updateStatus(Tenant $tenantModel, string $status, int $progress, string $message): void
    {
        $tenantModel->update(['provisioning_status' => $status]);
        Log::info("Provisioning [{$tenantModel->id}] → {$status} ({$progress}%): {$message}");
    }

    public function handle(DatabaseManager $databaseManager, \App\Services\ModuleService $moduleService): void
    {
        $tenantModel = Tenant::find($this->tenantId);

        if (!$tenantModel) {
            Log::warning("ProvisionTenantJob: Tenant '{$this->tenantId}' no longer exists. Skipping.");
            return;
        }

        $tenantId = $tenantModel->id;
        $dbName = $tenantModel->database_name;

        try {
            Log::info("Starting post-DB provisioning for tenant: {$tenantId}");

            // ─── Step 1: Post-creation setup (plan + isolation) ────────────
            $this->updateStatus($tenantModel, 'configuring', 10, 'Configuring database plan...');
            event(new TenantProvisioningProgress($tenantModel->id, 'configuring', 10, 'Configuring database plan...'));
            $databaseManager->onDatabaseCreated($tenantModel);

            // ─── Step 2: Seed Business Settings (inside tenant context) ────
            $this->updateStatus($tenantModel, 'seeding', 30, 'Seeding business settings...');
            event(new TenantProvisioningProgress($tenantModel->id, 'seeding', 30, 'Seeding business settings...'));
            $tenantModel->run(function () use ($databaseManager, $tenantModel) {
                $databaseManager->seedBusinessSettings($tenantModel);
            });

            // ─── Step 3: Create Admin User (inside tenant context) ─────────
            $this->updateStatus($tenantModel, 'creating_admin', 50, 'Creating administrator account...');
            event(new TenantProvisioningProgress($tenantModel->id, 'creating_admin', 50, 'Creating administrator account...'));
            $databaseManager->createAdminUser(
                $dbName,
                $tenantModel->admin_email,
                $this->adminPassword
            );

            // ─── Step 4: Activate Modules ──────────────────────────────────
            $this->updateStatus($tenantModel, 'activating_modules', 70, 'Activating industry modules...');
            event(new TenantProvisioningProgress($tenantModel->id, 'activating_modules', 70, 'Activating modules...'));

            try {
                $moduleService->resolveTenantCapabilities($tenantModel->id);
            } catch (\Exception $e) {
                Log::error("Module sync failed for tenant {$tenantId}: " . $e->getMessage());
                // Non-fatal: continue provisioning
            }

            // ─── Step 4.5: Auto-provision Tracking Subdomain ──────────────
            // Flow: If tenant has custom domain → track.{custom_domain}
            //       Otherwise → track.{tenant_id}.yoursaas.com (SaaS auto)
            try {
                $activeModules = \DB::connection('central')
                    ->table('tenant_modules')
                    ->join('modules', 'tenant_modules.module_id', '=', 'modules.id')
                    ->where('tenant_modules.tenant_id', $tenantId)
                    ->whereIn('tenant_modules.status', ['active', 'trial'])
                    ->pluck('modules.slug')
                    ->toArray();

                if (in_array('tracking', $activeModules)) {
                    $trackingDomainService = app(\App\Modules\Tracking\Services\TrackingDomainService::class);

                    // Check if tenant has a verified custom domain (added or bought)
                    $customDomain = TenantDomain::where('tenant_id', $tenantId)
                        ->where('is_verified', true)
                        ->where('purpose', 'website')
                        ->where('domain', 'not like', '%.yoursaas.com')
                        ->value('domain');

                    if ($customDomain) {
                        // Custom domain exists → create track.{custom_domain}
                        $trackingSubdomain = "track.{$customDomain}";
                        $trackingDomainService->registerCustomTracking($tenantId, $trackingSubdomain);
                        Log::info("Tracking subdomain from custom domain: {$trackingSubdomain} for tenant: {$tenantId}");
                    } else {
                        // No custom domain → SaaS auto subdomain
                        $trackingDomainService->provisionSaasTracking($tenantId);
                        Log::info("Tracking SaaS subdomain auto-provisioned for tenant: {$tenantId}");
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Tracking provision skipped for tenant {$tenantId}: " . $e->getMessage());
                // Non-fatal: tenant can set it up later from dashboard
            }

            // ─── Step 5: Register Domain ───────────────────────────────────
            $this->updateStatus($tenantModel, 'finalizing', 90, 'Registering domain...');
            event(new TenantProvisioningProgress($tenantModel->id, 'finalizing', 90, 'Finalizing...'));

            $tenantModel->update([
                'onboarded_at' => now(),
                'status' => 'active'
            ]);

            TenantDomain::updateOrCreate(
                ['domain' => $tenantModel->domain],
                [
                    'tenant_id' => $tenantId,
                    'is_primary' => true,
                    'is_verified' => true,
                    'status' => 'verified',
                ]
            );

            // ─── Step 6: Welcome & Verification Emails ─────────────────────
            $tenantModel->run(function () use ($tenantModel) {
                $this->sendEmails($tenantModel);
            });

            $this->updateStatus($tenantModel, 'completed', 100, 'Provisioning completed successfully!');
            event(new TenantProvisioningProgress($tenantModel->id, 'completed', 100, 'Provisioning completed!'));
            Log::info("Provisioning completed for tenant: {$tenantId}");

        } catch (\Exception $e) {
            Log::error("Provisioning failed for tenant {$tenantId}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            $tenantModel->update(['provisioning_status' => 'failed']);

            // Clean up DB on failure so stancl can recreate on retry
            try {
                Log::info("Cleaning up failed database for tenant: {$tenantId}");
                $databaseManager->deleteTenantDatabase($dbName);
                \DB::table('module_migrations')->where('tenant_database', $dbName)->delete();
            } catch (\Exception $cleanupEx) {
                Log::error("Cleanup failed for tenant {$tenantId}: " . $cleanupEx->getMessage());
            }

            throw $e;
        }
    }

    /**
     * Send welcome and verification emails.
     */
    protected function sendEmails(Tenant $tenant): void
    {
        try {
            $sendWelcome = config('tenant_email.send_welcome_email', true);
            $requireVerification = config('tenant_email.require_email_verification', true);

            if ($sendWelcome) {
                \Illuminate\Support\Facades\Mail::to($tenant->admin_email)
                    ->send(new \App\Mail\TenantWelcome($tenant));
            }

            if ($requireVerification) {
                $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $expiry = now()->addMinutes(config('tenant_email.verification_code_expiry_minutes', 30));

                \DB::table('users')
                    ->where('email', $tenant->admin_email)
                    ->update([
                        'email_verification_code' => $otp,
                        'email_verification_expires_at' => $expiry,
                        'email_verified_at' => null
                    ]);

                \Illuminate\Support\Facades\Mail::to($tenant->admin_email)
                    ->send(new \App\Mail\EmailVerification(
                        $tenant->tenant_name,
                        $tenant->admin_email,
                        $otp,
                        'http://' . $tenant->domain . '/verify-email'
                    ));
            } else {
                \DB::table('users')
                    ->where('email', $tenant->admin_email)
                    ->update(['email_verified_at' => now()]);
            }
        } catch (\Exception $e) {
            Log::warning("Email failed for tenant {$tenant->id}: " . $e->getMessage());
        }
    }
}

