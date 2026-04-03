<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Create Stripe checkout session
     */
    public function createCheckoutSession(Request $request)
    {
        try {
            // Validate Stripe configuration from GlobalSetting
            $stripeSecret = \App\Models\GlobalSetting::get('sk'); 
            
            if (empty($stripeSecret)) {
                // Fallback to config if not set in GlobalSetting
                $stripeSecret = config('services.stripe.secret');
            }

            if (empty($stripeSecret) || str_contains($stripeSecret, 'xxx') || str_contains($stripeSecret, 'YOUR')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stripe is not configured globally. Please configure it in Super Admin settings.',
                    'error' => 'Missing or invalid Global Stripe configuration.'
                ], 500);
            }

            $request->validate([
                'slug' => 'required_without:plan_slug|string',
                'plan_slug' => 'required_without:slug|string|in:starter,growth,pro,ior-independent',
                'subscription_type' => 'required_with:slug|in:monthly,annual,lifetime',
            ]);

            // Get tenant ID from authenticated token or request attributes
            $tenantId = $request->input('token_tenant_id') ?? $request->attributes->get('tenant_id');
            
            if (!$tenantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tenant ID not found in token',
                    'error' => 'Please select a tenant from the dashboard'
                ], 400);
            }

            $tenant = Tenant::findOrFail($tenantId);
            
            $productName = '';
            $description = '';
            $price = 0;
            $metadata = [
                'tenant_id' => $tenant->id,
            ];
            $moduleId = null;

            if ($request->has('plan_slug')) {
                // Feature 1: Subscription for Plan Upgrades 
                $planSlug = $request->plan_slug;
                $interval = $request->subscription_type ?? 'monthly';
                
                $subscriptionService = app(\App\Services\StripeTenantSubscriptionService::class);
                $sessionId = $subscriptionService->createCheckoutSession($tenant, $planSlug, $interval);

                // Fetch the payment record created by the service
                $payment = Payment::where('stripe_session_id', $sessionId)->first();

                // Build a response matching the expected frontend API format
                \Stripe\Stripe::setApiKey($stripeSecret);
                $session = \Stripe\Checkout\Session::retrieve($sessionId);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'session_id' => $session->id,
                        'url' => $session->url,
                        'payment_id' => $payment->id,
                    ]
                ]);

            } else {
                // Feature 2: Module Subscriptions (One-time or Theme-based config)
                $module = Module::where('slug', $request->slug)->firstOrFail();
                $price = $this->calculatePrice($module->price, $request->subscription_type);
                $productName = $module->name;
                $description = $module->description;
                $metadata['type'] = 'module_subscription';
                $metadata['module_id'] = $module->id;
                $metadata['subscription_type'] = $request->subscription_type;
                $moduleId = $module->id;

                // Create payment record
                $payment = Payment::create([
                    'tenant_id' => $tenant->id,
                    'module_id' => $moduleId,
                    'amount' => $price,
                    'currency' => 'USD',
                    'payment_method' => 'stripe',
                    'payment_status' => 'pending',
                ]);

                $metadata['payment_id'] = $payment->id;

                // Set Stripe API key
                \Stripe\Stripe::setApiKey($stripeSecret);

                // Get or Create Stripe Customer
                $stripeCustomerId = $this->getOrCreateStripeCustomer($tenant);

                $session = \Stripe\Checkout\Session::create([
                    'payment_method_types' => ['card'],
                    'customer' => $stripeCustomerId,
                    'line_items' => [[
                        'price_data' => [
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => $productName,
                                'description' => $description,
                            ],
                            'unit_amount' => (int)($price * 100), // Convert to cents
                        ],
                        'quantity' => 1,
                    ]],
                    'mode' => 'payment',
                    'payment_intent_data' => [
                        'setup_future_usage' => 'off_session',
                    ],
                    'success_url' => "http://{$tenantId}.localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
                    'cancel_url' => "http://{$tenantId}.localhost:3000/payment/cancel",
                    'metadata' => $metadata,
                ]);

                // Update payment with session ID
                $payment->update([
                    'stripe_session_id' => $session->id,
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'session_id' => $session->id,
                        'url' => $session->url,
                        'payment_id' => $payment->id,
                    ]
                ]);
            }

        } catch (\Stripe\Exception\AuthenticationException $e) {
            Log::error('Stripe authentication failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid Stripe API keys. Please check your Stripe configuration.',
                'error' => 'Stripe authentication failed. Verify STRIPE_SECRET in .env file.'
            ], 500);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe API error occurred', ['error' => $e->getMessage(), 'code' => $e->getCode(), 'stripe_param' => $e->getStripeParam()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Stripe API error occurred',
                'error' => $e->getMessage()
            ], 500);

        } catch (\Exception $e) {
            Log::error('Stripe checkout session creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create checkout session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment after Stripe redirect and process all post-payment actions
     * This is called from the frontend success page with the session_id
     * Works without webhooks - directly fetches session from Stripe
     */
    public function verifyPayment(Request $request)
    {
        try {
            $request->validate([
                'session_id' => 'required|string',
            ]);

            $sessionId = $request->input('session_id');
            $tenantId  = $request->attributes->get('tenant_id') ?? $request->input('token_tenant_id');

            // Validate Stripe configuration from GlobalSetting
            $stripeSecret = \App\Models\GlobalSetting::get('sk'); 
            if (empty($stripeSecret)) {
                $stripeSecret = config('services.stripe.secret');
            }
            \Stripe\Stripe::setApiKey($stripeSecret);

            // Fetch the session from Stripe
            $session = \Stripe\Checkout\Session::retrieve([
                'id'     => $sessionId,
                'expand' => ['payment_intent', 'payment_intent.payment_method'],
            ]);

            // Find the payment record
            $payment = Payment::where('stripe_session_id', $sessionId)->first();

            if (!$payment) {
                // If payment record not found, it might be a direct Stripe checkout not initiated by our system
                // Or a webhook already processed it.
                // We should still process the fulfillment if the session is paid.
                Log::warning("Payment record not found for session ID: {$sessionId}. Attempting to process fulfillment directly from Stripe session.");
                
                if ($session->payment_status !== 'paid') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment not completed yet and no local record found.',
                        'status'  => $session->payment_status,
                    ], 400);
                }

                // Create a new payment record based on session data
                $payment = Payment::create([
                    'tenant_id' => $session->metadata->tenant_id ?? $tenantId, // Use metadata tenant_id if available
                    'module_id' => $session->metadata->module_id ?? null,
                    'amount' => $session->amount_total / 100, // Convert cents to dollars
                    'currency' => strtoupper($session->currency),
                    'payment_method' => 'stripe',
                    'payment_status' => 'completed',
                    'stripe_session_id' => $session->id,
                    'stripe_payment_intent_id' => $session->payment_intent->id ?? null,
                    'payment_gateway_response' => $session->toArray(),
                ]);
                Log::info("New payment record created from Stripe session: {$payment->id}");
            } else {
                // If payment record found, check its status
                if ($payment->payment_status === 'completed') {
                    $invoice = \App\Models\Invoice::where('payment_id', $payment->id)->first();
                    
                    // Only return early if fulfillment was actually completed (invoice exists)
                    // If invoice is missing, fulfillment failed on the first attempt — we should retry
                    if ($invoice) {
                        return response()->json([
                            'success' => true,
                            'message' => 'Payment already processed',
                            'data'    => [
                                'payment_id'     => $payment->id,
                                'invoice_number' => $invoice->invoice_number,
                                'status'         => 'completed',
                            ],
                        ]);
                    }
                    
                    Log::warning("Payment {$payment->id} is marked completed but has no invoice. Retrying fulfillment.");
                }

                if ($session->payment_status !== 'paid') {
                    $payment->update(['payment_status' => 'failed']); // Mark local payment as failed if Stripe says so
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment not completed yet',
                        'status'  => $session->payment_status,
                    ], 400);
                }

                // Mark payment as completed
                $payment->update([
                    'payment_status'             => 'completed',
                    'stripe_payment_intent_id'   => $session->payment_intent->id ?? null,
                    'payment_gateway_response'   => $session->toArray(),
                ]);
            }

            $subscriptionType = $session->metadata->subscription_type ?? 'monthly';
            $paymentType = $session->metadata->type ?? 'module_subscription';

            // 2. Fulfillment
            if ($paymentType === 'plan_upgrade') {
                $planSlug = $session->metadata->plan_slug;
                $tenant = Tenant::findOrFail($payment->tenant_id);
                $tenant->upgradePlan($planSlug);
                Log::info("Plan upgrade fulfilled for tenant {$tenant->id} to {$planSlug}");
            } elseif ($paymentType === 'invoice_payment') {
                $invoiceId = $session->metadata->invoice_id;
                $invoice = \App\Models\Invoice::findOrFail($invoiceId);
                $invoice->markAsPaid();
                
                // If it was a plan upgrade invoice
                $planSlug = $session->metadata->plan_slug ?? $session->metadata->plan ?? null;
                if ($planSlug) {
                    $tenant = Tenant::findOrFail($payment->tenant_id);
                    $tenant->upgradePlan($planSlug);
                } else {
                    // Activate if it was a generic invoice payment but tenant is locked
                    $tenant = Tenant::findOrFail($payment->tenant_id);
                    if (in_array($tenant->status, [Tenant::STATUS_PENDING_PAYMENT, Tenant::STATUS_BILLING_FAILED])) {
                        $tenant->update(['status' => Tenant::STATUS_ACTIVE]);
                    }
                }
                Log::info("Invoice fulfillment completed for invoice {$invoiceId}");
            } else {
                // Activate module subscription
                $this->activateSubscription(
                    $payment->tenant_id,
                    $payment->module_id,
                    $subscriptionType,
                    $payment->id,
                    $payment->amount
                );
            }

            // 3. Create invoice (skip if it's already an invoice payment to avoid duplicates)
            $invoice = null;
            if ($paymentType !== 'invoice_payment') {
                $invoice = $this->createInvoiceForPayment($payment, $subscriptionType, $paymentType, $session->metadata->plan_slug ?? $session->metadata->plan ?? null);
            } else {
                // For invoice_payment, the invoice already exists, we just need the reference for the response
                $invoice = \App\Models\Invoice::find($session->metadata->invoice_id);
            }

            // 4. Save payment method from Stripe session
            $paymentMethod = null;
            $pmId = $session->payment_intent->payment_method->id ?? $session->payment_intent->payment_method ?? null;
            if ($pmId) {
                $paymentMethod = $this->savePaymentMethod($payment->tenant_id, $pmId);
            }

            Log::info("Payment verified via session: {$sessionId}, Invoice: {$invoice?->invoice_number}");

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and processed successfully',
                'data'    => [
                    'payment_id'     => $payment->id,
                    'invoice_number' => $invoice?->invoice_number,
                    'invoice_id'     => $invoice?->id,
                    'has_payment_method' => $paymentMethod !== null,
                    'status'         => 'completed',
                ],
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe API error during payment verification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment with Stripe',
                'error'   => $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Payment verification failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Stripe webhook handler
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        
        $endpoint_secret = \App\Models\GlobalSetting::get('webhook_secret');
        if (empty($endpoint_secret)) {
            $endpoint_secret = config('services.stripe.webhook_secret');
        }

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $sig_header,
                $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $this->handleCheckoutSessionCompleted($event->data->object);
                break;

            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object);
                break;

            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;

            case 'invoice.payment_failed':
                $this->handleInvoicePaymentFailed($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            default:
                Log::info('Unhandled Stripe event type: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle successful checkout session
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        $paymentId = $session->metadata->payment_id ?? null;
        
        if (!$paymentId) {
            Log::error('Payment ID not found in session metadata');
            return;
        }

        $payment = Payment::find($paymentId);
        
        if (!$payment) {
            Log::error("Payment not found: {$paymentId}");
            return;
        }

        // Mark payment as completed
        $payment->markAsCompleted($session->payment_intent ?? $session->id);
        $payment->update([
            'stripe_payment_intent_id' => $session->payment_intent ?? null,
            'payment_gateway_response' => $session->toArray(),
        ]);

        // 2. Fulfillment
        $paymentType = $session->metadata->type ?? 'module_subscription';
        if ($paymentType === 'plan_upgrade') {
            $planSlug = $session->metadata->plan_slug;
            $interval = $session->metadata->interval ?? 'monthly';
            $tenant = Tenant::findOrFail($payment->tenant_id);

            // Record the TenantSubscription
            if (isset($session->subscription)) {
                $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
                $stripeSubscription = $stripe->subscriptions->retrieve($session->subscription);

                $planId = \App\Models\SubscriptionPlan::where('slug', $planSlug)->value('id');

                // Cancel existing active subscription if any
                $existing = \App\Models\TenantSubscription::where('tenant_id', $tenant->id)
                    ->where('status', 'active')
                    ->first();

                if ($existing && $existing->provider_subscription_id) {
                    try {
                        $stripe->subscriptions->cancel($existing->provider_subscription_id);
                    } catch (\Exception $e) {
                        Log::warning("Could not cancel previous stripe sub {$existing->provider_subscription_id}: {$e->getMessage()}");
                    }
                    $existing->update(['status' => 'canceled', 'canceled_at' => now()]);
                }

                \App\Models\TenantSubscription::create([
                    'tenant_id' => $tenant->id,
                    'subscription_plan_id' => $planId,
                    'status' => 'active',
                    'billing_cycle' => $interval,
                    'auto_renew' => true,
                    'provider' => 'stripe',
                    'provider_subscription_id' => $stripeSubscription->id,
                    'provider_customer_id' => $stripeSubscription->customer,
                    'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_start),
                    'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                    'renews_at' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                ]);
            }

            // Upgrade the tenant plan limit
            $tenant->upgradePlan($planSlug);
            Log::info("Plan upgrade fulfilled (webhook) for tenant {$tenant->id} to {$planSlug}");
        } elseif ($paymentType === 'invoice_payment') {
            $invoiceId = $session->metadata->invoice_id;
            $invoice = \App\Models\Invoice::findOrFail($invoiceId);
            $invoice->markAsPaid();
            
            $planSlug = $session->metadata->plan_slug;
            if ($planSlug) {
                $tenant = Tenant::findOrFail($payment->tenant_id);
                $tenant->upgradePlan($planSlug);
            } else {
                // If no plan slug, still activate the tenant if they are pending payment
                $tenant = Tenant::findOrFail($payment->tenant_id);
                if (in_array($tenant->status, [Tenant::STATUS_PENDING_PAYMENT, Tenant::STATUS_BILLING_FAILED])) {
                    $tenant->update(['status' => Tenant::STATUS_ACTIVE]);
                }
            }
            Log::info("Invoice fulfillment (webhook) completed for invoice {$invoiceId}");
        } else {
            // Activate module subscription
            $this->activateSubscription(
                $payment->tenant_id,
                $payment->module_id,
                $session->metadata->subscription_type ?? 'monthly',
                $payment->id,
                $payment->amount
            );
        }

        // 3. Create invoice (skip if it's already an invoice payment)
        if ($paymentType !== 'invoice_payment') {
            $this->createInvoiceForPayment(
                $payment, 
                $session->metadata->subscription_type ?? 'monthly',
                $paymentType,
                $session->metadata->plan_slug ?? $session->metadata->plan ?? null
            );
        }

        // Save payment method if available
        if ($session->payment_method) {
            $this->savePaymentMethod($payment->tenant_id, $session->payment_method);
        }

        Log::info("Payment completed, module activated, invoice created: Payment ID {$paymentId}");
    }

    /**
     * Create invoice for completed payment
     */
    protected function createInvoiceForPayment($payment, $subscriptionType, $paymentType = 'module_subscription', $planSlug = null)
    {
        try {
            $description = "";
            $metadata = [
                'item_type' => $paymentType,
                'price' => $payment->amount,
            ];

            if ($paymentType === 'plan_upgrade') {
                $description = "Plan Upgrade to " . ucfirst($planSlug);
                $metadata['plan_slug'] = $planSlug;
            } else {
                $module = Module::find($payment->module_id);
                $description = "Payment for {$module->name} - {$subscriptionType} subscription";
                $metadata['name'] = $module->name;
                $metadata['slug'] = $module->slug;
                $metadata['plan'] = $subscriptionType;
            }
            
            // Generate unique invoice number
            $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad(
                \App\Models\Invoice::where('tenant_id', $payment->tenant_id)->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $invoice = \App\Models\Invoice::create([
                'tenant_id' => $payment->tenant_id,
                'payment_id' => $payment->id,
                'module_id' => $payment->module_id,
                'invoice_number' => $invoiceNumber,
                'invoice_date' => now(),
                'due_date' => now(), // Paid immediately
                'subscription_type' => $subscriptionType,
                'subtotal' => $payment->amount,
                'tax' => 0.00,
                'discount' => 0.00,
                'total' => $payment->amount,
                'status' => 'paid',
                'notes' => $description,
                'metadata' => $metadata,
            ]);

            Log::info("Invoice created: {$invoiceNumber} for payment {$payment->id}");
            
            return $invoice;
        } catch (\Exception $e) {
            Log::error("Failed to create invoice for payment {$payment->id}: " . $e->getMessage());
        }
    }

    /**
     * Save payment method from Stripe
     */
    protected function savePaymentMethod($tenantId, $paymentMethodId)
    {
        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            $stripePaymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId);

            // Check if payment method already exists by Stripe ID
            $existingById = \App\Models\PaymentMethod::where('stripe_payment_method_id', $paymentMethodId)->first();
            if ($existingById) {
                return $existingById;
            }

            // Better check: Is there already an active card with the same details for this tenant?
            $brand = strtolower($stripePaymentMethod->card->brand ?? '');
            $last4 = $stripePaymentMethod->card->last4 ?? '';
            $expMonth = $stripePaymentMethod->card->exp_month ?? null;
            $expYear = $stripePaymentMethod->card->exp_year ?? null;

            $existingByDetails = \App\Models\PaymentMethod::where('tenant_id', $tenantId)
                ->where('brand', $brand)
                ->where('last4', $last4)
                ->where('exp_month', $expMonth)
                ->where('exp_year', $expYear)
                ->where('is_active', true)
                ->first();

            if ($existingByDetails) {
                // Update the Stripe PM ID to the latest one
                $existingByDetails->update(['stripe_payment_method_id' => $paymentMethodId]);
                Log::info("Payment method updated with new Stripe ID: {$paymentMethodId} for existing card {$brand} {$last4}");
                return $existingByDetails;
            }

            // Create new payment method record if no match found
            $paymentMethod = \App\Models\PaymentMethod::create([
                'tenant_id' => $tenantId,
                'stripe_payment_method_id' => $stripePaymentMethod->id,
                'type' => $stripePaymentMethod->type,
                'brand' => $brand,
                'last4' => $last4,
                'exp_month' => $expMonth,
                'exp_year' => $expYear,
                'is_default' => false,
                'is_active' => true,
            ]);

            // If this is the first payment method, set as default
            $count = \App\Models\PaymentMethod::where('tenant_id', $tenantId)->count();
            if ($count === 1) {
                $paymentMethod->setAsDefault();
            }

            Log::info("Payment method saved: {$paymentMethodId} for tenant {$tenantId}");
            
            return $paymentMethod;
        } catch (\Exception $e) {
            Log::error("Failed to save payment method {$paymentMethodId}: " . $e->getMessage());
        }
    }

    /**
     * Handle payment intent succeeded
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment && !$payment->isCompleted()) {
            $payment->markAsCompleted($paymentIntent->id);
        }
    }

    /**
     * Handle payment intent failed
     */
    protected function handlePaymentIntentFailed($paymentIntent)
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->markAsFailed();
            Log::error("Payment failed: " . $paymentIntent->last_payment_error->message ?? 'Unknown error');
        }
    }

    /**
     * Handle invoice payment succeeded (Stripe Subscription Renewal)
     */
    protected function handleInvoicePaymentSucceeded($invoice)
    {
        if ($invoice->billing_reason !== 'subscription_cycle') {
            return; // Only care about recurring subscription payments here
        }

        $subscriptionId = $invoice->subscription;
        
        $tenantSub = \App\Models\TenantSubscription::where('provider_subscription_id', $subscriptionId)->first();

        if ($tenantSub) {
            // Update the subscription period based on the invoice lines
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $stripeSubscription = $stripe->subscriptions->retrieve($subscriptionId);

            $tenantSub->update([
                'status' => 'active',
                'current_period_start' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_start),
                'current_period_end' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
                'renews_at' => \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end),
            ]);

            // Create a Local payment to track this
            $payment = Payment::create([
                'tenant_id' => $tenantSub->tenant_id,
                'amount' => $invoice->amount_paid / 100,
                'currency' => strtoupper($invoice->currency),
                'payment_method' => 'stripe',
                'payment_status' => 'completed',
                'stripe_payment_intent_id' => $invoice->payment_intent,
                'payment_gateway_response' => $invoice->toArray(),
            ]);

            // Create a local Invoice
            $planSlug = $tenantSub->plan->slug;
            $this->createInvoiceForPayment(
                $payment, 
                $tenantSub->billing_cycle, 
                'plan_upgrade', 
                $planSlug
            );

            // Ensure tenant is active
            $tenant = Tenant::find($tenantSub->tenant_id);
            if ($tenant && in_array($tenant->status, [Tenant::STATUS_PENDING_PAYMENT, Tenant::STATUS_BILLING_FAILED, Tenant::STATUS_SUSPENDED])) {
                $tenant->update(['status' => Tenant::STATUS_ACTIVE]);
            }

            Log::info("Subscription renewed for Tenant {$tenantSub->tenant_id}, Sub ID: {$subscriptionId}");
        }
    }

    /**
     * Handle invoice payment failed (Stripe Subscription Dunning)
     */
    protected function handleInvoicePaymentFailed($invoice)
    {
        $subscriptionId = $invoice->subscription;

        if (!$subscriptionId) return;

        $tenantSub = \App\Models\TenantSubscription::where('provider_subscription_id', $subscriptionId)->first();

        if ($tenantSub) {
            $tenantSub->update(['status' => 'past_due']);

            $tenant = Tenant::find($tenantSub->tenant_id);
            if ($tenant && $tenant->status === Tenant::STATUS_ACTIVE) {
                // Wait for BillingEnforcementService to actually suspend after grace period, but we can mark them 
                // as pending payment for now to show warnings.
                $tenant->update(['status' => Tenant::STATUS_PENDING_PAYMENT]);
            }

            Log::warning("Subscription payment failed for Tenant {$tenantSub->tenant_id}, Sub ID: {$subscriptionId}");
        }
    }

    /**
     * Handle subscription deleted (Canceled from Stripe or Failed all retries)
     */
    protected function handleSubscriptionDeleted($subscription)
    {
        $tenantSub = \App\Models\TenantSubscription::where('provider_subscription_id', $subscription->id)->first();

        if ($tenantSub) {
            $tenantSub->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);

            $tenant = Tenant::find($tenantSub->tenant_id);
            if ($tenant) {
                // If it was cancelled because of non-payment
                if ($subscription->status === 'canceled' && $subscription->cancellation_details->reason === 'payment_failed') {
                    $tenant->update(['status' => Tenant::STATUS_BILLING_FAILED]);
                } else {
                    // Downgrade to starter or suspend depending on business logic
                    // We'll suspend for now to ensure they must resubscribe
                    $tenant->update(['status' => Tenant::STATUS_SUSPENDED]);
                }
            }

            Log::info("Subscription canceled for Tenant {$tenantSub->tenant_id}, Sub ID: {$subscription->id}");
        }
    }

    /**
     * Activate subscription after successful payment
     */
    protected function activateSubscription($tenantId, $moduleId, $subscriptionType, $paymentId, $pricePaid)
    {
        $tenant = Tenant::find($tenantId);
        $module = Module::find($moduleId);

        if (!$tenant || !$module) {
            Log::error("Tenant or Module not found");
            return;
        }

        // Calculate expiry date based on subscription type
        $expiresAt = $this->calculateExpiryDate($subscriptionType);

        // Subscribe to module
        $result = $this->moduleService->subscribeModule(
            $tenant->id,
            $module->slug,
            [
                'status' => 'active',
                'subscription_type' => $subscriptionType,
                'price_paid' => $pricePaid,
                'starts_at' => now(),
                'expires_at' => $expiresAt,
                'payment_id' => $paymentId,
            ]
        );

        if ($result['success']) {
            Log::info("Module {$module->slug} activated for tenant {$tenant->id}");
        } else {
            Log::error("Failed to activate module: " . $result['message']);
        }
    }

    /**
     * Calculate price based on subscription type
     */
    protected function calculatePrice($basePrice, $subscriptionType)
    {
        switch ($subscriptionType) {
            case 'monthly':
                return $basePrice;
            case 'annual':
                return $basePrice * 12 * 0.83; // 17% discount
            case 'lifetime':
                return $basePrice * 24; // 2 years worth
            default:
                return $basePrice;
        }
    }

    /**
     * Calculate expiry date based on subscription type
     */
    protected function calculateExpiryDate($subscriptionType)
    {
        switch ($subscriptionType) {
            case 'monthly':
                return now()->addMonth();
            case 'annual':
                return now()->addYear();
            case 'lifetime':
                return null; // No expiry
            default:
                return now()->addMonth();
        }
    }

    /**
     * Get or create Stripe Customer for a tenant
     */
    protected function getOrCreateStripeCustomer($tenant): string
    {
        $stripeId = $tenant->data['stripe_id'] ?? null;
        
        if (!$stripeId) {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
            $customer = \Stripe\Customer::create([
                'email' => $tenant->admin_email,
                'name' => $tenant->company_name ?? $tenant->tenant_name,
                'metadata' => [
                    'tenant_id' => $tenant->id
                ]
            ]);
            $stripeId = $customer->id;
            
            // Update tenant data with stripe_id
            $data = $tenant->data;
            $data['stripe_id'] = $stripeId;
            $tenant->data = $data;
            $tenant->save();
        }
        
        return $stripeId;
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($paymentId)
    {
        $payment = Payment::with(['tenant', 'module'])->findOrFail($paymentId);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }
}
