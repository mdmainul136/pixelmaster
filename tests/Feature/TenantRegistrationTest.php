<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tenant;

class TenantRegistrationTest extends TestCase
{
    /**
     * Test tenant registration with CR and VAT numbers.
     */
    public function test_tenant_registration_with_new_fields(): void
    {
        $tenantId = 'debug-tenant-123';
        $payload = [
            'tenantId' => $tenantId,
            'tenantName' => 'Test Tenant',
            'companyName' => 'Test Company Inc',
            'businessType' => 'llc',
            'purpose' => 'ecommerce',
            'adminName' => 'Admin User',
            'adminEmail' => 'admin@debug.com',
            'adminPassword' => 'Password123!',
            'phone' => '1234567890',
            'address' => '123 Test St',
            'city' => 'Test City',
            'country' => 'Unknown',
            'crNumber' => 'CR123456',
            'vatNumber' => 'VAT789012',
        ];

        $response = $this->postJson('/api/tenants/register', $payload);

        if ($response->status() !== 202) {
            dump($response->json());
        }

        $response->assertStatus(202);

        $this->assertDatabaseHas('tenants', [
            'id' => $tenantId,
            'cr_number' => 'CR123456',
            'vat_number' => 'VAT789012',
            'business_category' => 'ecommerce'
        ]);
    }
}
