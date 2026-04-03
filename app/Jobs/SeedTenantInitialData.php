<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Services\DatabaseManager;
use App\Models\BusinessSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * SeedTenantInitialData — Seeds the tenant database after creation.
 * 
 * Uses $tenant->run() for context switching (stancl/tenancy pattern)
 * instead of manual connection management.
 */
class SeedTenantInitialData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    // NOTE: We intentionally do NOT use SerializesModels.

    protected string $tenantId;
    protected string $adminPassword;
    protected array $addons;

    public function __construct(string $tenantId, string $adminPassword, array $addons = [])
    {
        $this->tenantId = $tenantId;
        $this->adminPassword = $adminPassword;
        $this->addons = $addons;
    }

    public function handle(DatabaseManager $databaseManager): void
    {
        $tenant = Tenant::find($this->tenantId);

        if (!$tenant) {
            Log::warning("SeedTenantInitialData: Tenant '{$this->tenantId}' no longer exists. Skipping.");
            return;
        }

        Log::info("Starting initial data seeding for tenant: {$tenant->id}");

        try {
            // 1. Update status
            $tenant->update(['provisioning_status' => 'seeding']);
            event(new \App\Events\TenantProvisioningProgress($tenant->id, 'seeding', 50, 'Seeding business settings...'));

            // 2. Seed business settings + create admin (inside tenant context)
            $tenant->run(function () use ($databaseManager, $tenant) {
                $databaseManager->seedBusinessSettings($tenant);

                // Seed Bangladesh-specific gateways if applicable
                if ($tenant->country === 'Bangladesh') {
                    \App\Models\BusinessSetting::set('is_active', '0', 'bkash');
                    \App\Models\BusinessSetting::set('is_active', '0', 'nagad');
                    \App\Models\BusinessSetting::set('is_active', '0', 'sslcommerz');
                    
                    Log::info("Seeded Bangladesh payment gateway stubs for tenant: {$tenant->id}");
                }
            });

            // 3. Create admin user
            event(new \App\Events\TenantProvisioningProgress($tenant->id, 'creating_admin', 70, 'Creating administrator...'));
            $databaseManager->createAdminUser(
                $tenant->database_name,
                $tenant->admin_email,
                $this->adminPassword
            );


            // 4. Finalize
            $updateData = [
                'onboarded_at' => now(),
                'provisioning_status' => 'completed'
            ];

            // Only set status to active if it's NOT already pending_payment
            if ($tenant->status !== Tenant::STATUS_PENDING_PAYMENT) {
                $updateData['status'] = 'active';
            }

            $tenant->update($updateData);

            // 6. Send emails (inside tenant context)
            $tenant->run(function () use ($tenant) {
                $this->sendEmails($tenant);
            });

            event(new \App\Events\TenantProvisioningProgress($tenant->id, 'completed', 100, 'Onboarding complete!'));
            Log::info("Initial data seeding completed for tenant: {$tenant->id}");
        } catch (\Exception $e) {
            Log::error("Initial data seeding failed for tenant {$this->tenantId}: " . $e->getMessage());
            $tenant->update(['provisioning_status' => 'failed']);
            throw $e;
        }
    }

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

                \App\Models\User::on('central')
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
                \App\Models\User::on('central')
                    ->where('email', $tenant->admin_email)
                    ->update(['email_verified_at' => now()]);
            }
        } catch (\Exception $e) {
            Log::warning("Email delivery failed for tenant {$tenant->id}: " . $e->getMessage());
        }
    }
}

