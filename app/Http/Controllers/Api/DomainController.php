<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DomainService;
use Illuminate\Http\Request;

class DomainController extends Controller
{
    protected DomainService $domainService;

    public function __construct(DomainService $domainService)
    {
        $this->domainService = $domainService;
    }

    /**
     * Helper to resolve either a numeric ID or a domain name string to a domain ID
     * for the current tenant.
     */
    protected function resolveDomainId(string $idOrDomain, $tenantId): int
    {
        if (is_numeric($idOrDomain)) {
            return (int) $idOrDomain;
        }

        $domain = \App\Models\TenantDomain::where('tenant_id', $tenantId)
            ->where('domain', $idOrDomain)
            ->firstOrFail();

        return $domain->id;
    }

    /**
     * List all domains for the current tenant
     */
    public function index(Request $request)
    {
        try {
            $tenantId = $request->attributes->get('tenant_id');
            $domains = $this->domainService->getTenantDomains($tenantId);

            return response()->json([
                'success' => true,
                'data' => $domains
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching domains',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a new custom domain
     */
    public function store(Request $request)
    {
        $request->validate([
            'domain'  => 'required|string|regex:/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/',
            'purpose' => 'sometimes|string|in:website,tracking,api,storefront',
        ], [
            'domain.regex' => 'Please provide a valid domain name (e.g., shop.example.com)'
        ]);

        try {
            $tenantId = $request->attributes->get('tenant_id');
            $purpose  = $request->input('purpose', 'website');
            $domain   = $this->domainService->addDomain($tenantId, $request->domain, $purpose);

            return response()->json([
                'success' => true,
                'message' => 'Domain added successfully. Please verify your DNS records.',
                'data' => $domain
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify domain DNS records
     */
    public function verify(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $result = $this->domainService->verifyDomain($domainId);
            
            // Trigger health check as well for fuller context
            $health = $this->domainService->getHealthReport($domainId);
            $result['health'] = $health['diagnostics'];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verifying domain: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time health report for a domain
     */
    public function health(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $report = $this->domainService->getHealthReport($domainId);
            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Trigger One-Click DNS setup for Namecheap domains
     */
    public function oneClickSetup(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $result = $this->domainService->oneClickSetup($domainId);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Set domain as primary
     */
    public function setPrimary(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $domain = $this->domainService->setPrimary($domainId);
            return response()->json([
                'success' => true,
                'message' => 'Domain set as primary successfully',
                'data' => $domain
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Nameservers for a domain
     */
    public function getNameservers(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $data = $this->domainService->getNameservers($domainId);
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get DNS Host Records
     */
    public function getDNSHosts(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $data = $this->domainService->getDNSHosts($domainId);
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update DNS Host Records
     */
    public function updateDNSHosts(Request $request, string $id)
    {
        $request->validate([
            'hosts' => 'required|array',
            'hosts.*.name' => 'required|string',
            'hosts.*.type' => 'required|string',
            'hosts.*.address' => 'required|string',
        ]);

        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $success = $this->domainService->updateDNSHosts($domainId, $request->hosts);
            return response()->json([
                'success' => $success,
                'message' => $success ? 'DNS records updated successfully' : 'Failed to update DNS records'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Renew domain
     */
    public function renew(Request $request, string $id)
    {
        $request->validate([
            'years' => 'required|integer|min:1|max:10'
        ]);

        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $result = $this->domainService->renewDomain($domainId, $request->years);
            return response()->json([
                'success' => true,
                'message' => 'Domain renewal initiated',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Remove a domain
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $this->domainService->deleteDomain($domainId);
            return response()->json([
                'success' => true,
                'message' => 'Domain removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // ─── Subdomain Management ──────────────────────────────────────────────

    /**
     * Create a subdomain for a domain.
     * POST /domains/{id}/subdomains
     */
    public function createSubdomain(Request $request, string $id)
    {
        $request->validate([
            'subdomain'   => 'required|string|regex:/^[a-zA-Z0-9-]+$/',
            'record_type' => 'sometimes|string|in:A,CNAME',
            'address'     => 'sometimes|string',
            'purpose'     => 'sometimes|string|in:website,tracking,api,storefront',
        ]);

        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $result = $this->domainService->createSubdomain(
                $domainId,
                $request->subdomain,
                $request->input('record_type', 'A'),
                $request->input('address', ''),
                $request->input('purpose', 'website')
            );

            return response()->json([
                'success' => true,
                'message' => "Subdomain {$request->subdomain} created successfully",
                'data'    => $result,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Delete a subdomain from a domain.
     * DELETE /domains/{id}/subdomains
     */
    public function deleteSubdomain(Request $request, string $id)
    {
        $request->validate([
            'subdomain' => 'required|string',
        ]);

        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $success = $this->domainService->deleteSubdomain($domainId, $request->subdomain);
            return response()->json([
                'success' => $success,
                'message' => $success ? 'Subdomain removed' : 'Subdomain not found',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // ─── Contact Management ────────────────────────────────────────────────

    /**
     * Get domain contact information from Namecheap.
     * GET /domains/{id}/contacts
     */
    public function getContacts(Request $request, string $id)
    {
        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $contacts = $this->domainService->getContactInfo($domainId);
            return response()->json([
                'success' => true,
                'data'    => $contacts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update domain contact information on Namecheap.
     * PUT /domains/{id}/contacts
     */
    public function updateContacts(Request $request, string $id)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email',
            'phone'      => 'required|string',
            'address'    => 'required|string',
            'city'       => 'required|string',
            'state'      => 'required|string',
            'zip'        => 'required|string',
            'country'    => 'required|string',
        ]);

        try {
            $domainId = $this->resolveDomainId($id, $request->attributes->get('tenant_id'));
            $success = $this->domainService->updateContactInfo($domainId, $request->all());
            return response()->json([
                'success' => $success,
                'message' => $success ? 'Contacts updated successfully' : 'Failed to update contacts',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

