<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Tenant;
use App\Models\TenantDomain;
use App\Services\DomainRegistrationService;
use App\Services\DomainSearchService;
use App\Services\DomainService;
use App\Services\NamecheapService;
use DateTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Checkout\Session as StripeSession;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod as StripePaymentMethod;
use Stripe\Stripe;

class DomainStoreController extends Controller
{
    public function __construct(
        protected DomainSearchService $domainSearchService,
        protected DomainRegistrationService $registrationService,
        protected NamecheapService $namecheapService
    ) {
        $this->configureStripe();
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    private function configureStripe(): void
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    private function getTenantId(Request $request): string
    {
        return $request->attributes->get('tenant_id');
    }

    private function buildRedirectUrls(Request $request): array
    {
        $baseUrl = $request->header('origin') ?? explode(',', config('app.frontend_url'))[0];
        $base    = rtrim($baseUrl, '/') . '/storefront?tab=domain';

        return [
            'success' => $base . '&purchase_success=true&session_id={CHECKOUT_SESSION_ID}',
            'cancel'  => $base . '&purchase_cancel=true',
        ];
    }

    // -------------------------------------------------------------------------
    // Orders
    // -------------------------------------------------------------------------

    /**
     * Get all domain orders for the current tenant.
     */
    public function orders(Request $request): JsonResponse
    {
        $tenantId = $this->getTenantId($request);

        try {
            $query = DomainOrder::where('tenant_id', $tenantId)
                ->with(['invoice'])
                ->orderBy('created_at', 'desc');

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $query->where('domain', 'LIKE', '%' . $request->search . '%');
            }

            return response()->json([
                'success' => true,
                'data'    => $query->get(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch domain orders: ' . $e->getMessage(), [
                'tenant_id' => $tenantId,
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch domain orders',
            ], 500);
        }
    }

    /**
     * Get a specific domain order (scoped to the current tenant).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $order = DomainOrder::where('tenant_id', $this->getTenantId($request))
                ->with(['invoice', 'payment'])
                ->findOrFail($id);

            return response()->json(['success' => true, 'data' => $order]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }
    }

    // -------------------------------------------------------------------------
    // Domain Search
    // -------------------------------------------------------------------------

    /**
     * Search for domain availability.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate(['domain' => 'required|string']);

        try {
            $domain      = $request->domain;
            $result      = $this->domainSearchService->checkAvailability($domain);
            $suggestions = $this->domainSearchService->getSuggestions(explode('.', $domain)[0]);

            $bundles = [];
            if (!empty($result['available'])) {
                $bundles[] = [
                    'domain'         => $domain . ' + .info',
                    'price'          => $result['price'] + 2.99,
                    'available'      => true,
                    'is_bundle'      => true,
                    'discount'       => '68%',
                    'original_price' => $result['price'] + 10.00,
                ];
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'main'        => $result,
                    'suggestions' => $suggestions,
                    'bundles'     => $bundles,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Get WHOIS data for a domain.
     */
    public function whois(string $domain): JsonResponse
    {
        $data = $this->domainSearchService->getWhoisData($domain);

        return response()->json(['success' => true, 'data' => $data]);
    }

    // -------------------------------------------------------------------------
    // Purchase
    // -------------------------------------------------------------------------

    /**
     * Initiate a domain purchase (create Stripe Checkout Session).
     */
    public function purchase(Request $request): JsonResponse
    {
        $request->validate([
            'domain' => 'required|string',
            'years'  => 'required|integer|min:1|max:10',
        ]);

        $tenantId = $this->getTenantId($request);

        try {
            $tenant = Tenant::findOrFail($tenantId);

            // Fetch price server-side — never trust client-supplied price.
            $priceResult = $this->domainSearchService->checkAvailability($request->domain);
            $price       = $priceResult['price'] ?? null;

            if (!$price) {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not retrieve domain price. Please try again.',
                ], 422);
            }

            // Remove any stale pending/failed orders to avoid unique constraint violations.
            DomainOrder::where('domain', $request->domain)
                ->whereIn('status', ['pending', 'failed'])
                ->delete();

            $order = DomainOrder::create([
                'tenant_id'          => $tenantId,
                'domain'             => $request->domain,
                'amount'             => $price,
                'currency'           => 'USD',
                'registration_years' => $request->years,
                'status'             => 'pending',
            ]);

            $urls    = $this->buildRedirectUrls($request);
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items'           => [[
                    'price_data' => [
                        'currency'     => 'usd',
                        'product_data' => [
                            'name'        => "Domain Registration: {$request->domain}",
                            'description' => "Registration for {$request->years} year(s)",
                        ],
                        'unit_amount'  => (int) ($price * 100),
                    ],
                    'quantity'   => 1,
                ]],
                'mode'        => 'payment',
                'success_url' => $urls['success'],
                'cancel_url'  => $urls['cancel'],
                'metadata'    => [
                    'domain_order_id' => $order->id,
                    'tenant_id'       => $tenantId,
                    'type'            => 'domain_purchase',
                ],
            ]);

            Payment::create([
                'tenant_id'        => $tenant->id,
                'module_id'        => null,
                'amount'           => $price,
                'currency'         => 'USD',
                'payment_method'   => 'stripe',
                'payment_status'   => 'pending',
                'stripe_session_id' => $session->id,
            ]);

            $order->update(['payment_id' => $session->id]);

            $this->createInvoiceForOrder($order, 'pending');

            return response()->json([
                'success' => true,
                'data'    => ['url' => $session->url, 'order_id' => $order->id],
            ]);
        } catch (\Exception $e) {
            Log::error('Domain purchase initiation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate purchase: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify domain purchase after Stripe redirect.
     */
    public function verifyPurchase(Request $request): JsonResponse
    {
        $request->validate(['session_id' => 'required|string']);

        try {
            $session = StripeSession::retrieve($request->session_id);

            if ($session->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not completed or failed',
                    'status'  => $session->payment_status,
                ], 400);
            }

            $order = DomainOrder::findOrFail($session->metadata->domain_order_id);

            if ($order->status === 'completed') {
                return response()->json([
                    'success' => true,
                    'message' => 'Domain already verified',
                    'data'    => ['order' => $order],
                ]);
            }

            // Update payment record.
            $payment = Payment::where('stripe_session_id', $request->session_id)->first();
            if ($payment) {
                $payment->update([
                    'payment_status'            => 'completed',
                    'stripe_payment_intent_id'  => $session->payment_intent,
                    'paid_at'                   => now(),
                ]);

                $this->savePaymentMethod($session->payment_intent, $payment->tenant_id);
            }

            // Register the domain.
            $tenantId = $request->attributes->get('tenant_id') ?? $order->tenant_id;
            $tenant   = Tenant::find($tenantId);

            if (!$tenant) {
                Log::error("Tenant not found for ID {$tenantId} during domain purchase verification");

                return response()->json([
                    'success' => false,
                    'message' => 'Tenant not found. Cannot proceed with registration.',
                ], 404);
            }

            [$tenantDomain, $dnsSetup] = $this->registerDomainForTenant($tenant, $order);

            // Update invoice to paid.
            $invoice = $this->markInvoicePaid($payment, $order);

            return response()->json([
                'success' => true,
                'message' => 'Domain registration initiated successfully',
                'data'    => [
                    'order'     => $order->fresh(),
                    'domain'    => $tenantDomain,
                    'invoice'   => $invoice,
                    'dns_setup' => $dnsSetup,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Domain purchase verification failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify purchase: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Re-initiate payment for an unpaid/failed domain order.
     */
    public function repay(Request $request, string $orderId): JsonResponse
    {
        try {
            $order = DomainOrder::where('tenant_id', $this->getTenantId($request))
                ->findOrFail($orderId);

            if ($order->status === 'completed') {
                return response()->json(['success' => false, 'message' => 'Order already completed'], 400);
            }

            $urls    = $this->buildRedirectUrls($request);
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items'           => [[
                    'price_data' => [
                        'currency'     => 'usd',
                        'product_data' => [
                            'name'        => "Domain Registration (Repay): {$order->domain}",
                            'description' => "Registration for {$order->registration_years} year(s)",
                        ],
                        'unit_amount'  => (int) ($order->amount * 100),
                    ],
                    'quantity'   => 1,
                ]],
                'mode'        => 'payment',
                'success_url' => $urls['success'],
                'cancel_url'  => $urls['cancel'],
                'metadata'    => [
                    'domain_order_id' => $order->id,
                    'tenant_id'       => $order->tenant_id,
                    'type'            => 'domain_purchase',
                ],
            ]);

            // Update the Payment row to point to the new session.
            Payment::where('stripe_session_id', $order->payment_id)
                ->update(['stripe_session_id' => $session->id]);

            $order->update(['payment_id' => $session->id]);

            return response()->json([
                'success' => true,
                'data'    => ['url' => $session->url, 'order_id' => $order->id],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Order Management
    // -------------------------------------------------------------------------

    /**
     * Sync order status with Namecheap WHOIS.
     */
    public function syncOrder(Request $request, string $id): JsonResponse
    {
        $order = DomainOrder::where('tenant_id', $this->getTenantId($request))->findOrFail($id);

        try {
            $info = $this->namecheapService->getWhois($order->domain);

            if (!empty($info['expires'])) {
                try {
                    $order->update([
                        'expiry_date' => new DateTime($info['expires']),
                        'status'      => 'completed',
                    ]);
                } catch (\Exception $e) {
                    Log::warning("Could not parse expiry date for {$order->domain}: " . $e->getMessage());
                }
            } else {
                // WHOIS returned no expiry (e.g. sandbox). If Stripe payment confirmed,
                // move the order out of pending with a calculated expiry.
                if (in_array($order->status, ['pending', 'failed'])) {
                    $confirmed = Payment::where('stripe_session_id', $order->payment_id)
                        ->where('payment_status', 'completed')
                        ->exists();

                    if ($confirmed) {
                        $order->update([
                            'status'      => 'completed',
                            'expiry_date' => now()->addYears($order->registration_years ?? 1),
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order synced successfully',
                'data'    => $order->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Renew a domain.
     */
    public function renewOrder(Request $request, string $id): JsonResponse
    {
        $order = DomainOrder::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
        $years = (int) $request->input('years', 1);

        try {
            $result = $this->registrationService->renewDomain($order->domain, $years);

            return response()->json([
                'success' => true,
                'message' => 'Domain renewed successfully',
                'data'    => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Renewal failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check DNS propagation for a domain order.
     */
    public function checkDns(Request $request, string $id): JsonResponse
    {
        try {
            $order        = DomainOrder::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
            $service      = app(DomainService::class);
            $tenantDomain = null;

            if ($order->tenant_domain_id) {
                // Happy path: domain is already linked.
                $result = $service->verifyDomain($order->tenant_domain_id);

                return response()->json($result);
            }

            // Try to find an existing TenantDomain record for this order.
            $tenantDomain = TenantDomain::where('tenant_id', $order->tenant_id)
                ->where('domain', $order->domain)
                ->first();

            // If missing or failed, attempt recovery via Namecheap WHOIS.
            if ((!$tenantDomain || $tenantDomain->status === 'failed')
                && in_array($order->status, ['processing', 'failed', 'completed'])
            ) {
                $tenantDomain = $this->attemptWhoisRecovery($order, $tenantDomain);
            }

            if ($tenantDomain && $tenantDomain->status !== 'failed') {
                if (!$order->tenant_domain_id) {
                    $order->update(['tenant_domain_id' => $tenantDomain->id, 'status' => 'completed']);
                }

                return response()->json($service->verifyDomain($tenantDomain->id));
            }

            return response()->json([
                'success' => false,
                'message' => 'Domain is not fully registered yet. Please wait.',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'DNS check failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Domain Settings
    // -------------------------------------------------------------------------

    /**
     * Get advanced domain settings (privacy, auto-renew) from Namecheap.
     */
    public function getSettings(Request $request, string $id): JsonResponse
    {
        try {
            $order = DomainOrder::where('tenant_id', $this->getTenantId($request))->findOrFail($id);

            return response()->json([
                'success' => true,
                'data'    => [
                    'privacy' => $this->namecheapService->getWhoisGuardStatus($order->domain),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Toggle privacy or auto-renew for a domain.
     */
    public function updateSettings(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'setting' => 'required|string|in:privacy,auto_renew',
            'enabled' => 'required|boolean',
        ]);

        try {
            $order   = DomainOrder::where('tenant_id', $this->getTenantId($request))->findOrFail($id);
            $setting = $request->setting;
            $enabled = $request->boolean('enabled');

            $success = match ($setting) {
                'privacy'    => $this->namecheapService->setWhoisGuardStatus($order->domain, $enabled),
                'auto_renew' => $this->namecheapService->setAutoRenew($order->domain, $enabled),
            };

            return response()->json([
                'success' => $success,
                'message' => $success ? ucfirst($setting) . ' updated' : 'Update failed',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Health Check
    // -------------------------------------------------------------------------

    /**
     * Perform a health check on the tenant's active domain.
     */
    public function healthCheck(Request $request): JsonResponse
    {
        try {
            $tenant = Tenant::findOrFail($this->getTenantId($request));

            $response = Http::timeout(5)->get("https://{$tenant->domain}");
            $healthy  = $response->successful() || $response->redirect();

            return response()->json([
                'success' => true,
                'data'    => [
                    'status'     => $healthy ? 'healthy' : 'degraded',
                    'ssl'        => !str_starts_with("https://{$tenant->domain}", 'http://'),
                    'last_check' => now()->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Private Business Logic
    // -------------------------------------------------------------------------

    /**
     * Save a Stripe payment method for future use, deduplicating by card details.
     */
    private function savePaymentMethod(string $paymentIntentId, string $tenantId): void
    {
        try {
            $intent = PaymentIntent::retrieve($paymentIntentId);

            if (!$intent->payment_method) {
                return;
            }

            $stripePm  = StripePaymentMethod::retrieve($intent->payment_method);
            $brand     = strtolower($stripePm->card->brand ?? '');
            $last4     = $stripePm->card->last4 ?? '';
            $expMonth  = $stripePm->card->exp_month ?? null;
            $expYear   = $stripePm->card->exp_year ?? null;

            // Check for exact Stripe PM ID match first.
            $existing = PaymentMethod::where('stripe_payment_method_id', $stripePm->id)->first();

            if (!$existing) {
                // Fallback: match by card details for the same tenant.
                $existing = PaymentMethod::where('tenant_id', $tenantId)
                    ->where('brand', $brand)
                    ->where('last4', $last4)
                    ->where('exp_month', $expMonth)
                    ->where('exp_year', $expYear)
                    ->where('is_active', true)
                    ->first();

                if ($existing) {
                    $existing->update(['stripe_payment_method_id' => $stripePm->id]);
                }
            }

            if (!$existing) {
                $isFirst = !PaymentMethod::where('tenant_id', $tenantId)->where('is_active', true)->exists();

                PaymentMethod::create([
                    'tenant_id'                => $tenantId,
                    'stripe_payment_method_id' => $stripePm->id,
                    'type'                     => $stripePm->type,
                    'brand'                    => $brand,
                    'last4'                    => $last4,
                    'exp_month'                => $expMonth,
                    'exp_year'                 => $expYear,
                    'is_default'               => $isFirst,
                    'is_active'                => true,
                ]);

                Log::info("Saved new payment method {$stripePm->id} for tenant {$tenantId}");
            }
        } catch (\Exception $e) {
            // Non-fatal — don't block the rest of verification.
            Log::error("Failed to save payment method: " . $e->getMessage());
        }
    }

    /**
     * Register the domain with Namecheap and set up DNS.
     * Returns [$tenantDomain, $dnsSetup].
     */
    private function registerDomainForTenant(Tenant $tenant, DomainOrder $order): array
    {
        $contactInfo = [
            'first_name' => $tenant->admin_name ?? 'Merchant',
            'last_name'  => 'Owner',
            'address'    => $tenant->address   ?? 'Main Street',
            'city'       => $tenant->city      ?? 'Dhaka',
            'state'      => 'NY',
            'zip'        => '10001',
            'country'    => $tenant->country   ?? 'Bangladesh',
            'phone'      => $tenant->phone     ?? '+880.1711111111',
            'email'      => $tenant->admin_email ?? $tenant->email,
        ];

        $tenantDomain = null;
        $dnsSetup     = [];

        try {
            $tenantDomain = $this->registrationService->registerDomain(
                $order->tenant_id,
                $order->domain,
                $order->registration_years,
                $contactInfo
            );

            if ($tenantDomain && isset($tenantDomain->id)) {
                $order->update(['tenant_domain_id' => $tenantDomain->id]);
            }

            try {
                $dnsSetup = $this->registrationService->autoSetupDnsForPurchasedDomain(
                    $order->tenant_id,
                    $order->domain
                );
                Log::info("Auto DNS setup for {$order->domain}: " . implode(', ', $dnsSetup));
            } catch (\Exception $e) {
                Log::warning("Auto DNS setup failed for {$order->domain}: " . $e->getMessage());
                $dnsSetup = ['error' => $e->getMessage()];
            }
        } catch (\Exception $e) {
            // Payment confirmed but Namecheap registration failed (e.g. sandbox).
            Log::warning("Domain registration failed after successful payment for order {$order->id}: " . $e->getMessage());
            $order->update([
                'status'          => 'processing',
                'expiry_date'     => now()->addYears($order->registration_years ?? 1),
                'registrar_data'  => json_encode([
                    'error' => $e->getMessage(),
                    'note'  => 'Failed during Namecheap API registration',
                ]),
            ]);
        }

        return [$tenantDomain, $dnsSetup];
    }

    /**
     * Attempt to recover a lost/failed TenantDomain record by querying Namecheap WHOIS.
     */
    private function attemptWhoisRecovery(DomainOrder $order, ?TenantDomain $existing): ?TenantDomain
    {
        try {
            $info = $this->namecheapService->getWhois($order->domain);

            if (empty($info['expires'])) {
                return $existing;
            }

            Log::info("Auto-recovering stranded domain from Namecheap WHOIS: {$order->domain}");

            TenantDomain::where('tenant_id', $order->tenant_id)->update(['is_primary' => false]);

            $attributes = [
                'is_verified' => true,
                'is_primary'  => true,
                'status'      => 'verified',
                'verified_at' => now(),
            ];

            if ($existing) {
                $existing->update($attributes);
                $tenantDomain = $existing;
            } else {
                $tenantDomain = TenantDomain::create(array_merge($attributes, [
                    'tenant_id' => $order->tenant_id,
                    'domain'    => $order->domain,
                    'purpose'   => 'website',
                ]));
            }

            Tenant::where('id', $order->tenant_id)->update(['domain' => $order->domain]);

            $order->update([
                'tenant_domain_id' => $tenantDomain->id,
                'status'           => 'completed',
                'expiry_date'      => new DateTime($info['expires']),
            ]);

            return $tenantDomain;
        } catch (\Exception $e) {
            Log::warning("WHOIS auto-recovery failed for {$order->domain}: " . $e->getMessage());

            return $existing;
        }
    }

    /**
     * Mark the invoice associated with a payment as paid.
     * Falls back to creating a new invoice if none exists.
     */
    private function markInvoicePaid(?Payment $payment, DomainOrder $order): ?Invoice
    {
        if ($payment) {
            $invoice = Invoice::where('payment_id', $payment->id)->first();

            if ($invoice) {
                $invoice->update(['status' => 'paid']);

                return $invoice;
            }

            return $this->createInvoiceForOrder($order, 'paid');
        }

        // No payment record — try matching by domain name in notes.
        $invoice = Invoice::where('notes', 'LIKE', "%{$order->domain}%")
            ->where('status', 'pending')
            ->first();

        if ($invoice) {
            $invoice->update(['status' => 'paid']);
        }

        return $invoice;
    }

    /**
     * Create an invoice for a domain order.
     * Uses a DB transaction + unique index to be race-condition safe.
     */
    protected function createInvoiceForOrder(DomainOrder $order, string $status = 'paid'): ?Invoice
    {
        try {
            $tenant = Tenant::find($order->tenant_id);

            if (!$tenant) {
                Log::error("Tenant not found for slug {$order->tenant_id} during invoice creation");

                return null;
            }

            $payment = Payment::where('stripe_session_id', $order->payment_id)->first();

            return DB::transaction(function () use ($order, $tenant, $payment, $status) {
                $year          = date('Y');
                $count         = Invoice::where('tenant_id', $tenant->id)->lockForUpdate()->count();
                $invoiceNumber = 'DOM-' . $year . '-' . str_pad($count + 1, 6, '0', STR_PAD_LEFT);

                // Guarantee uniqueness under concurrent load.
                if (Invoice::where('invoice_number', $invoiceNumber)->exists()) {
                    $invoiceNumber .= '-' . strtoupper(Str::random(4));
                }

                $invoice = Invoice::create([
                    'tenant_id'         => $tenant->id,
                    'payment_id'        => $payment?->id,
                    'module_id'         => null,
                    'invoice_number'    => $invoiceNumber,
                    'invoice_date'      => now(),
                    'due_date'          => now(),
                    'subscription_type' => 'domain_registration',
                    'subtotal'          => $order->amount,
                    'tax'               => 0.00,
                    'discount'          => 0.00,
                    'total'             => $order->amount,
                    'status'            => $status,
                    'notes'             => "Domain Registration: {$order->domain} for {$order->registration_years} year(s)",
                    'metadata'          => [
                        'item_type'   => 'domain',
                        'domain_name' => $order->domain,
                        'years'       => $order->registration_years,
                        'price'       => $order->amount,
                    ],
                ]);

                Log::info("Domain Invoice created: {$invoiceNumber} for order {$order->id}");

                return $invoice;
            });
        } catch (\Exception $e) {
            Log::error("Failed to create invoice for domain order {$order->id}: " . $e->getMessage());

            return null;
        }
    }
}
