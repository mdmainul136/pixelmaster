<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\IdentifyTenant;
use Illuminate\Support\Facades\Route;
use App\Modules\Ecommerce\Controllers\ProductController;
use App\Modules\Ecommerce\Controllers\CategoryController;
use App\Modules\Ecommerce\Controllers\OrderController;
use App\Modules\Ecommerce\Controllers\CustomerController;
use App\Modules\Ecommerce\Controllers\EcommerceDashboardController;
use App\Http\Controllers\Api\DomainController;
use App\Http\Controllers\Api\DomainStoreController;
use App\Http\Controllers\Api\TenantConfigController;
use App\Http\Controllers\Api\bKashController;
use App\Http\Controllers\Api\SSLCommerzController;
use App\Http\Controllers\Api\EpsController;
use App\Http\Controllers\Api\MiddleEastPaymentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'environment' => config('app.env'),
    ]);
});

// API V1 Group
Route::prefix('v1')->middleware(['throttle:api', IdentifyTenant::class])->group(function () {

    // Public Storefront API
    Route::prefix('storefront')->controller(\App\Http\Controllers\Api\Storefront\StorefrontController::class)->group(function () {
        Route::get('/products', 'products');
        Route::get('/products/{slug}', 'product');
        Route::get('/collections', 'collections');
        Route::get('/collections/{slug}', 'collection');
        Route::get('/cart', 'getCart');
        Route::post('/checkout', 'checkout');
    });

    // Stripe & Subscription Webhooks (Public)
    Route::post('/stripe/webhook', [\App\Http\Controllers\Api\StripeBillingController::class, 'webhook']); // Stripe Events → StripeBillingService
    Route::post('/subscriptions/webhook/stripe', [\App\Http\Controllers\Api\SubscriptionWebhookController::class, 'stripe']);
    Route::post('/subscriptions/webhook/sslcommerz', [\App\Http\Controllers\Api\SubscriptionWebhookController::class, 'sslcommerz'])->name('subscriptions.ssl.webhook');

    // Global Admin Data (Used by Next.js platform dashboard)
    Route::get('/admin/modules/graph', [\App\Http\Controllers\Api\Admin\AdminModuleController::class, 'graph']);

    // Super Admin Routes (no tenant identification required)
    Route::prefix('super-admin')->group(function () {
        // Super admin authentication
        Route::post('/login', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/2fa/verify-login', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'verify2FALogin'])->middleware('throttle:10,1');
        
        // Protected super admin routes
        Route::middleware(['tenant.auth'])->group(function () {
            Route::post('/logout', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'logout']);
            Route::get('/me', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'me']);
            Route::post('/change-password', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'changePassword']);
            
            // 2FA Routes
            Route::post('/2fa/setup', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'setup2FA']);
            Route::post('/2fa/verify', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'verify2FA']);
            Route::post('/2fa/disable', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'disable2FA']);
            Route::post('/security-settings', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'updateSecuritySettings']);
            Route::get('/login-history', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'loginHistory']);
            Route::post('/update-profile', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'updateProfile']);
            Route::post('/update-organization', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'updateOrganization']);
            Route::get('/config', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'getConfig']);
            Route::get('/notification-preferences', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'getNotificationPreferences']);
            Route::post('/notification-preferences', [\App\Http\Controllers\Api\SuperAdminAuthController::class, 'updateNotificationPreferences']);

            // Notification & Communication Settings
            Route::get('/mail-configs', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'getMailConfigs']);
            Route::post('/mail-configs', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'updateMailConfig']);
            Route::get('/email-templates', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'getTemplates']);
            Route::post('/email-templates/{id}', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'updateTemplate']);
            Route::get('/webhooks', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'getWebhooks']);
            Route::post('/webhooks', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'storeWebhook']);
            Route::post('/webhooks/{id}/test', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'testWebhook']);
            Route::delete('/webhooks/{id}', [\App\Http\Controllers\Api\NotificationSettingsController::class, 'deleteWebhook']);

            // User & Role Management
            Route::get('/users', [\App\Http\Controllers\Api\UserManagementController::class, 'index']);
            Route::post('/users', [\App\Http\Controllers\Api\UserManagementController::class, 'store']);
            Route::post('/users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'update']);
            Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'destroy']);
            Route::get('/users-meta', [\App\Http\Controllers\Api\UserManagementController::class, 'getMeta']);

            // Invitations
            Route::get('/invitations', [\App\Http\Controllers\Api\InvitationController::class, 'index']);
            Route::post('/invitations', [\App\Http\Controllers\Api\InvitationController::class, 'store']);
            Route::delete('/invitations/{id}', [\App\Http\Controllers\Api\InvitationController::class, 'destroy']);
            Route::get('/invitations/verify/{token}', [\App\Http\Controllers\Api\InvitationController::class, 'verify'])->withoutMiddleware(['auth:super_admin']);
            Route::post('/invitations/accept/{token}', [\App\Http\Controllers\Api\InvitationController::class, 'accept'])->withoutMiddleware(['auth:super_admin']);

            // sGTM Pipeline & Management
            Route::post('/sgtm/collect', [\App\Http\Controllers\Api\SgtmController::class, 'collect']);
            Route::get('/sgtm-configs', [\App\Http\Controllers\Api\SuperAdminController::class, 'listSgtmConfigs']);
            Route::post('/sgtm-configs', [\App\Http\Controllers\Api\SuperAdminController::class, 'storeSgtmConfig']);
            Route::post('/sgtm-configs/{id}/toggle', [\App\Http\Controllers\Api\SuperAdminController::class, 'toggleSgtmStatus']);
            Route::post('/sgtm-configs/{id}/toggle-test', [\App\Http\Controllers\Api\SuperAdminController::class, 'toggleSgtmTestMode']);
            Route::post('/sgtm-configs/{id}/rotate-key', [\App\Http\Controllers\Api\SuperAdminController::class, 'rotateSgtmApiKey']);

            // Dashboard & analytics
            Route::get('/dashboard', [\App\Http\Controllers\Api\SuperAdminController::class, 'dashboard']);
            Route::get('/profitability', [\App\Http\Controllers\Api\SuperAdminController::class, 'profitability']);
            Route::get('/queue-metrics', [\App\Http\Controllers\Api\SuperAdminController::class, 'queueMetrics']);
            Route::get('/event-logs', [\App\Http\Controllers\Api\SuperAdminController::class, 'eventLogs']);
            Route::post('/retry-events', [\App\Http\Controllers\Api\SuperAdminController::class, 'retryEvents']);
            
            // Tenant management
            Route::get('/tenants', [\App\Http\Controllers\Api\SuperAdminController::class, 'tenants']);
            Route::get('/tenants/{id}', [\App\Http\Controllers\Api\SuperAdminController::class, 'tenantDetails']);
            Route::post('/tenants/{id}/config', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateTenantConfig']);
            Route::post('/tenants/{id}/approve', [\App\Http\Controllers\Api\SuperAdminController::class, 'approveTenant']);
            Route::post('/tenants/{id}/suspend', [\App\Http\Controllers\Api\SuperAdminController::class, 'suspendTenant']);
            Route::delete('/tenants/{id}', [\App\Http\Controllers\Api\SuperAdminController::class, 'deleteTenant']);
            
            // Tenant Module management
            Route::post('/tenants/{id}/subscribe-module', [\App\Http\Controllers\Api\SuperAdminController::class, 'subscribeTenantModule']);
            Route::post('/tenants/{id}/unsubscribe-module/{slug}', [\App\Http\Controllers\Api\SuperAdminController::class, 'unsubscribeTenantModule']);
            Route::get('/tenants/{id}/payment-config', [\App\Http\Controllers\Api\SuperAdminController::class, 'getTenantPaymentConfig']);
            Route::post('/tenants/{id}/payment-config', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateTenantPaymentConfig']);
            
            // Global SaaS Payment Configuration
            Route::get('/global/payment-config', [\App\Http\Controllers\Api\SuperAdminController::class, 'getGlobalPaymentConfig']);
            Route::post('/global/payment-config', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateGlobalPaymentConfig']);
            
            // Security Hub
            Route::get('/security/stats', [\App\Http\Controllers\Api\SuperAdminController::class, 'securityStats']);
            Route::get('/security/audit-logs', [\App\Http\Controllers\Api\SuperAdminController::class, 'auditLogs']);
            Route::get('/security/firewall', [\App\Http\Controllers\Api\SuperAdminController::class, 'firewallRules']);
            Route::post('/security/firewall', [\App\Http\Controllers\Api\SuperAdminController::class, 'storeFirewallRule']);
            Route::delete('/security/firewall/{id}', [\App\Http\Controllers\Api\SuperAdminController::class, 'deleteFirewallRule']);
            Route::get('/security/sessions', [\App\Http\Controllers\Api\SuperAdminController::class, 'activeSessions']);
            Route::post('/security/sessions/revoke', [\App\Http\Controllers\Api\SuperAdminController::class, 'revokeSession']);

            // Module management
            Route::get('/modules', [\App\Http\Controllers\Api\ModuleManagementController::class, 'index']);
            Route::get('/modules/graph', [\App\Http\Controllers\Api\Admin\AdminModuleController::class, 'graph']);
            Route::post('/modules/upload', [\App\Http\Controllers\Api\ModuleManagementController::class, 'upload']);
            Route::post('/modules', [\App\Http\Controllers\Api\ModuleManagementController::class, 'store']);
            Route::put('/modules/{id}', [\App\Http\Controllers\Api\ModuleManagementController::class, 'update']);
            Route::delete('/modules/{id}', [\App\Http\Controllers\Api\ModuleManagementController::class, 'destroy']);

            // Regional Module Overrides (SuperAdmin gating)
            Route::prefix('region-overrides')->controller(\App\Http\Controllers\Api\SuperAdmin\SuperAdminRegionController::class)->group(function () {
                Route::get('/',          'index');       // List all overrides
                Route::get('/{region}',  'show');        // Get overrides for a region
                Route::post('/',         'store');       // Create/update single override
                Route::put('/bulk',      'bulkUpdate');  // Bulk-update a region
                Route::delete('/{id}',   'destroy');     // Delete an override
            });

            // Module Graph — unified module/business-type/plan/dependency API
            Route::prefix('module-graph')->controller(\App\Http\Controllers\Api\SuperAdmin\ModuleGraphController::class)->group(function () {
                Route::get('/',                   'index');          // Full graph
                Route::get('/dependencies',       'dependencies');   // Dependency tree
                Route::get('/business-types',     'businessTypes');  // Business type map
                Route::get('/plan-features/{slug}', 'planFeatures'); // Per-module plan features
                Route::put('/module/{slug}',      'updateModule');   // Update module config
            });
        });
    });

    // ── Tenant Memberships & Global Invites (Global Context) ──────────────
    Route::prefix('memberships')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/pending',         [\App\Http\Controllers\Api\MembershipController::class, 'pending']);
        Route::get('/verify/{token}',  [\App\Http\Controllers\Api\MembershipController::class, 'verify']);
        Route::post('/accept/{token}', [\App\Http\Controllers\Api\MembershipController::class, 'accept']);
        Route::post('/decline/{token}', [\App\Http\Controllers\Api\MembershipController::class, 'decline']);
    });

    // Routes requiring tenant identification
    Route::middleware(['track_activity', 'db.quota', 'tenant.payment'])->group(function () {
        
        // Authenticated Tenant Context
        Route::middleware(['tenant.auth'])->group(function () {
            Route::get('/tenants/current', [TenantController::class, 'current']);
            Route::get('/tenant/features', [TenantController::class, 'features']);
            Route::get('/tenant/config', [TenantConfigController::class, 'index']);
            Route::put('/tenant/settings', [TenantController::class, 'updateSettings']);
            Route::get('/tenant/checklist', [\App\Http\Controllers\Api\MerchantChecklistController::class, 'index']);

            // Custom Domains Settings
            Route::prefix('domains')->controller(\App\Http\Controllers\Api\DomainController::class)->group(function () {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::delete('/{domain}', 'destroy');
            });

            // Subscriptions
            Route::prefix('subscriptions')->group(function () {
                Route::get('/status', [\App\Http\Controllers\Api\SubscriptionController::class, 'status']);
                Route::get('/usage', [\App\Http\Controllers\Api\BillingController::class, 'usage']);
            });

            // ── Stripe Billing (Pro/Business plans only) ─────────────────────────
            Route::prefix('billing')->controller(\App\Http\Controllers\Api\StripeBillingController::class)->group(function () {
                Route::get('/status',   'status');     // Stripe subscription status
                Route::post('/checkout', 'checkout'); // Start Stripe Checkout Session
                Route::post('/portal',   'portal');   // Open Stripe Billing Portal
            });

            // Email Configurations (AWS SES & SMTP)
            Route::prefix('email')->controller(\App\Http\Controllers\Api\EmailConfigController::class)->group(function () {
                Route::get('/config', 'show');
                Route::post('/config', 'update');
                Route::post('/connect-aws', 'connectAws');
                Route::post('/disconnect-aws', 'disconnectAws');
                Route::post('/connect-smtp', 'connectSmtp');
                Route::post('/disconnect-smtp', 'disconnectSmtp');
                Route::post('/verify-domain', 'verifyDomain');
                Route::get('/verify-domain/status', 'verifyDomainStatus');
                Route::get('/verify-domain/dns', 'verifyDomainDns');
                Route::get('/stats', 'stats');
            });

            // Merchant Settings API (for future mobile/3rd-party use)
            Route::prefix('merchant/settings')->controller(\App\Http\Controllers\Api\MerchantSettingsApiController::class)->group(function () {
                Route::get('/',              'index');
                Route::put('/general',       'updateGeneral');
                Route::put('/business',      'updateBusiness');
                Route::put('/localization',  'updateLocalization');
                Route::put('/branding',      'updateBranding');
            });

            // Payment Gateway Configurations (Admin only)
            Route::prefix('tenant/payments/config')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\TenantPaymentConfigController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\TenantPaymentConfigController::class, 'update']);
            });

            // ── RBAC & Team Management ──────────────────────────────
            require base_path('routes/rbac.php');
        });

        // Authentication Routes (tenant-specific)
        Route::prefix('auth')->controller(AuthController::class)->group(function () {
            Route::post('/register', 'register')->middleware('throttle:5,1');
            Route::post('/login', 'login')->middleware('throttle:10,1');
            Route::post('/verify-email', 'verifyEmail');
            Route::post('/resend-verification', 'resendVerification');
            Route::get('/verification-status', 'checkVerificationStatus');
            Route::post('/logout', 'logout');
            Route::middleware(['tenant.auth'])->group(function () {
                Route::get('/me', 'me');
            });
        });

        // User Management Routes (requires authentication)
        Route::prefix('users')->middleware(['tenant.auth'])->controller(UserController::class)->group(function () {
            Route::get('/', 'index');
            Route::get('/meta', 'meta');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        // Media Library
        Route::prefix('media')->middleware(['tenant.auth'])->controller(\App\Http\Controllers\Api\MediaController::class)->group(function () {
            Route::get('/',              'index');
            Route::get('/stats',         'stats');
            Route::get('/{id}',          'show');
            Route::post('/upload',       'store');
            Route::post('/upload-url',   'storeFromUrl');
            Route::put('/{id}',          'update');
            Route::delete('/{id}',       'destroy');
            Route::delete('/{id}/permanent', 'permanentDestroy');
            Route::post('/bulk-delete',  'bulkDelete');
            Route::post('/bulk-optimize-seo', 'bulkOptimizeSeo');
        });

        // Payment
        Route::prefix('payment')->controller(\App\Http\Controllers\Api\PaymentController::class)->group(function () {
            Route::post('/checkout', 'createCheckoutSession')->middleware(['tenant.auth']);
            Route::post('/verify', 'verifyPayment')->middleware(['tenant.auth']);
            Route::get('/{paymentId}/status', 'getPaymentStatus')->middleware(['tenant.auth']);
            Route::get('/history', [\App\Http\Controllers\Api\PaymentHistoryController::class, 'index'])->middleware(['tenant.auth']);
            Route::get('/statistics', [\App\Http\Controllers\Api\PaymentHistoryController::class, 'statistics'])->middleware(['tenant.auth']);
            Route::get('/{paymentId}/invoice', [\App\Http\Controllers\Api\PaymentHistoryController::class, 'downloadInvoice'])->middleware(['tenant.auth']);
        });

        // Invoices
        Route::prefix('invoices')->middleware(['tenant.auth'])->controller(\App\Http\Controllers\Api\InvoiceController::class)->group(function () {
            Route::get('/', 'index');
            Route::get('/{id}', 'show');
            Route::get('/{id}/download', 'download');
            Route::post('/{id}/pay', 'pay');
        });

        // Payment Methods
        Route::prefix('payment-methods')->middleware(['tenant.auth'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\PaymentMethodController::class, 'index']);
            Route::post('/setup-intent', [\App\Http\Controllers\Api\PaymentMethodController::class, 'createSetupIntent']);
            Route::post('/', [\App\Http\Controllers\Api\PaymentMethodController::class, 'store']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\PaymentMethodController::class, 'destroy']);
            Route::post('/{id}/default', [\App\Http\Controllers\Api\PaymentMethodController::class, 'setDefault']);
        });

        // Audit Logs
        Route::prefix('tenant/audit-logs')->middleware(['tenant.auth'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\TenantAuditLogController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\Api\TenantAuditLogController::class, 'stats']);
        });

        // Subscriptions & Billing Analytics
        Route::prefix('subscriptions')->middleware(['tenant.auth'])->group(function () {
            Route::get('/plans',      [\App\Http\Controllers\Api\SubscriptionPlanController::class, 'index']);
            Route::get('/status',     [\App\Http\Controllers\Api\SubscriptionController::class, 'status']);
            Route::get('/usage',      [\App\Http\Controllers\Api\BillingController::class, 'usage']);
            Route::get('/invoices',   [\App\Http\Controllers\Api\SubscriptionController::class, 'invoices']);
            Route::post('/upgrade',   [\App\Http\Controllers\Api\SubscriptionController::class, 'subscribe']);
            Route::post('/checkout',  [\App\Http\Controllers\Api\SubscriptionController::class, 'checkout']);
            Route::post('/cancel',    [\App\Http\Controllers\Api\SubscriptionPlanController::class, 'cancel']);
            Route::post('/reactivate',[\App\Http\Controllers\Api\SubscriptionPlanController::class, 'reactivate']);
            Route::get('/timeline',   [\App\Http\Controllers\Api\BillingTimelineController::class, 'index']);
        });


        // Database
        Route::prefix('database')->middleware(['tenant.auth'])->controller(\App\Http\Controllers\Api\TenantDatabaseController::class)->group(function () {
            Route::get('/analytics', 'analytics');
            Route::get('/tables', 'tables');
            Route::get('/growth', 'growth');
            Route::get('/plans', 'plans');
        });

        // POS
        Route::prefix('pos')->middleware(['tenant.auth'])->group(function () {
            Route::post('/sync-order', [\App\Http\Controllers\Api\PosController::class, 'syncOrder']);
            Route::get('/inventory', [\App\Http\Controllers\Api\PosController::class, 'getInventory']);
        });

        // AI
        Route::prefix('ai')->middleware(['tenant.auth'])->group(function () {
            Route::get('/config', [\App\Http\Controllers\Api\AiController::class, 'getConfig']);
            Route::post('/config', [\App\Http\Controllers\Api\AiController::class, 'updateConfig']);
            Route::post('/generate-storefront', [\App\Http\Controllers\Api\AiController::class, 'generateStorefront']);
        });

        // Themes
        Route::prefix('themes')->middleware(['tenant.auth'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\ThemeController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\Api\ThemeController::class, 'show']);
            Route::post('/{id}/adopt', [\App\Http\Controllers\Api\ThemeController::class, 'adopt']);
        });

        // Theme Customizer (Enterprise Theme Engine)
        Route::prefix('theme/customizer')->middleware(['tenant.auth'])->group(function () {
            Route::get('/',  [\App\Http\Controllers\Tenant\ThemeCustomizerController::class, 'index']);
            Route::put('/',  [\App\Http\Controllers\Tenant\ThemeCustomizerController::class, 'update']);
            Route::post('/install', [\App\Http\Controllers\Tenant\ThemeCustomizerController::class, 'install']);
            Route::post('/ai/suggest-design', [\App\Http\Controllers\Tenant\ThemeCustomizerController::class, 'aiSuggestDesign']);
            Route::post('/ai/generate-content', [\App\Http\Controllers\Tenant\ThemeCustomizerController::class, 'aiGenerateContent']);
        });

        // Theme Marketplace (Enterprise Theme Engine)
        Route::prefix('theme/marketplace')->middleware(['tenant.auth'])->group(function () {
            Route::get('/',  [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'index']);
            Route::get('/categories', [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'categories']);
            Route::get('/{id}', [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'show']);
            Route::post('/{id}/install', [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'install']);
            Route::post('/{id}/purchase', [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'purchase']);
            Route::post('/{id}/review', [\App\Http\Controllers\Tenant\ThemeMarketplaceController::class, 'review']);
        });

        // ─── Theme Engine OS (serves shop-frontend customizer & storefront) ────
        // Public (no auth) — called by Next.js ThemeProvider on page load
        Route::get('/store/settings',    [\App\Http\Controllers\Api\ThemeEngineController::class, 'settings']);
        Route::get('/storefront/theme',  [\App\Http\Controllers\Api\ThemeEngineController::class, 'storefront']);

        // Authenticated — called by Next.js /customize page
        Route::middleware(['tenant.auth'])->prefix('store')->group(function () {
            Route::get('/themes',                          [\App\Http\Controllers\Api\ThemeEngineController::class, 'index']);
            Route::get('/theme/active',                    [\App\Http\Controllers\Api\ThemeEngineController::class, 'active']);
            Route::get('/theme/{slug}/schema',             [\App\Http\Controllers\Api\ThemeEngineController::class, 'schema']);
            Route::put('/theme',                           [\App\Http\Controllers\Api\ThemeEngineController::class, 'activate']);
            Route::post('/theme/customize',                [\App\Http\Controllers\Api\ThemeEngineController::class, 'customize']);
            Route::post('/theme/customize/batch',          [\App\Http\Controllers\Api\ThemeEngineController::class, 'customizeBatch']);
            Route::delete('/theme/{slug}/section/{section}', [\App\Http\Controllers\Api\ThemeEngineController::class, 'resetSection']);
            Route::patch('/theme/{slug}/page-template',    [\App\Http\Controllers\Api\ThemeEngineController::class, 'updatePageTemplate']);
        });

        // Domains
        Route::prefix('domains')->middleware(['tenant.auth'])->group(function () {
            Route::get('/', [DomainController::class, 'index']);
            Route::post('/', [DomainController::class, 'store']);
            Route::post('/{id}/verify', [DomainController::class, 'verify']);
            Route::get('/{id}/health', [DomainController::class, 'health']);
            Route::post('/{id}/one-click-setup', [DomainController::class, 'oneClickSetup']);
            Route::post('/{id}/primary', [DomainController::class, 'setPrimary']);
            Route::delete('/{id}', [DomainController::class, 'destroy']);

            // Domain Store (Purchase, Search)
            Route::prefix('store')->controller(DomainStoreController::class)->group(function () {
                Route::get('/orders', 'orders');
                Route::get('/search', 'search');
                Route::get('/whois/{domain}', 'whois');
                Route::get('/purchase', 'purchase'); // Using GET briefly for simpler UI redirect if needed, or POST
                Route::get('/verify-purchase', 'verifyPurchase');
                Route::post('/repay/{orderId}', 'repay');
                Route::post('/{id}/sync', 'syncOrder');
                Route::post('/{id}/renew', 'renewOrder');
                Route::get('/{id}/dns', 'checkDns');
                Route::get('/{id}/settings', 'getSettings');
                Route::post('/{id}/settings', 'updateSettings');
                Route::get('/health', 'healthCheck');
            });
        });

    });


    // Payment Callbacks
    Route::prefix('payment/bkash')->controller(bKashController::class)->group(function () {
        Route::get('/callback', 'callback')->name('bkash.callback');
    });

    Route::prefix('payment/sslcommerz')->controller(SSLCommerzController::class)->group(function () {
        Route::post('/success', 'success')->name('sslcommerz.success');
        Route::post('/fail',    'fail')->name('sslcommerz.fail');
    });

    Route::prefix('payment/eps')->controller(EpsController::class)->group(function () {
        Route::get('/success',  'success')->name('eps.success');
    });

    // Middle East Payments
    Route::prefix('payment')->group(function () {
        Route::post('/resolve-methods', [MiddleEastPaymentController::class, 'resolveMethods']);
        Route::middleware([IdentifyTenant::class, 'tenant.auth'])->group(function () {
            Route::post('/charge', [MiddleEastPaymentController::class, 'charge']);
            Route::post('/refund', [MiddleEastPaymentController::class, 'refund']);
        });
    });

    // ─── Platform Admin API (Central Logic) ──────────────────────────────────
    Route::prefix('platform')->middleware(['auth:sanctum', 'platform.admin'])->group(function () {
        // e.g. Route::get('/stats', [PlatformDashboardController::class, 'stats']);
    });

    // ─── Regular User API (Central Logic) ────────────────────────────────────
    Route::prefix('user')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/containers', [\App\Http\Controllers\Api\UserController::class, 'containers']);
    });

    // ── RBAC & Team Management ──────────────────────────────
    require base_path('routes/rbac.php');

});

// Global Routes (External to V1)
Route::post('/webhooks/ses', [\App\Http\Controllers\Api\SesWebhookController::class, 'handle']);

Route::prefix('tenants')->controller(TenantController::class)->group(function () {
    Route::post('/register', 'register')->name('api.tenants.register');
    Route::get('/check-availability', 'checkAvailability');
    Route::get('/{tenantId}/status', 'checkStatus');  // Provisioning polling
});

// Alias for frontend convenience
Route::post('/register-tenant', [TenantController::class, 'register']);


Route::get('/regions/stats', [\App\Http\Controllers\Api\RegionStatsController::class, 'stats']);

// ── Plugin API (WP/Shopify plugin external endpoints) ─────────────
// Stateless, API-key authenticated via Bearer token — no session/tenant middleware
Route::prefix('tracking/plugin')
    ->middleware(['throttle:tenant_tracking', \App\Http\Middleware\EnforceContainerOrigin::class])
    ->controller(\App\Modules\Tracking\Controllers\Api\PluginApiController::class)
    ->group(function () {
        Route::post('/verify',        'verify');
        Route::post('/events',        'events');
        Route::get('/health',         'health');
        Route::get('/logs',           'logs')->middleware('feature.enforce:NULL,logs');
        Route::post('/settings/sync', 'syncSettings');
    });

// ─────────────────────────────────────────────────────────────────────────────
// ── sGTM Feature-Gated API Endpoints ────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// All routes below require tenant auth + their specific plan feature.
// Middleware pattern: feature.enforce:NULL,{feature_key}
//   - First param (module): NULL  → no module check
//   - Second param (feature): key → checked against tenant's plan features[]

Route::middleware([
    \App\Http\Middleware\IdentifyTenant::class,
    'tenant.auth',
])->prefix('v1/sgtm')->group(function () {

    // ── Phase 1 Core: Pro+ Features ────────────────────────────────────────

    // Logs (Pro+)
    Route::prefix('logs')
        ->middleware('feature.enforce:NULL,logs')
        ->group(function () {
            Route::get('/',            [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getLogs']);
            Route::get('/stream',      [\App\Http\Controllers\Api\SgtmFeatureController::class, 'streamLogs']);
            Route::delete('/flush',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'flushLogs']);
            Route::put('/retention',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'setLogRetention'])
                ->middleware('feature.enforce:NULL,custom_logs_retention'); // Custom only
        });

    // Cookie Keeper (Pro+)
    Route::prefix('cookie-keeper')
        ->middleware('feature.enforce:NULL,cookie_keeper')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getCookieKeeperConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateCookieKeeperConfig']);
            Route::post('/test', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'testCookieKeeper']);
        });

    // Bot Detection (Pro+)
    Route::prefix('bot-detection')
        ->middleware('feature.enforce:NULL,bot_detection')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getBotDetectionConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateBotDetectionConfig']);
            Route::get('/stats', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getBotStats']);
        });

    // Ad Blocker Info (Pro+)
    Route::prefix('ad-blocker')
        ->middleware('feature.enforce:NULL,ad_blocker_info')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getAdBlockerConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateAdBlockerConfig']);
        });

    // POAS Data Feed (Pro+)
    Route::prefix('poas')
        ->middleware('feature.enforce:NULL,poas_data_feed')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getPoasConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updatePoasConfig']);
            Route::post('/sync', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'manualPoasSync']);
        });

    // Stape Store (Pro+)
    Route::prefix('store')
        ->middleware('feature.enforce:NULL,stape_store')
        ->group(function () {
            Route::get('/',                [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getStoreExtensions']);
            Route::post('/{slug}/install', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'installExtension']);
            Route::delete('/{slug}',       [\App\Http\Controllers\Api\SgtmFeatureController::class, 'uninstallExtension']);
        });

    // ── Phase 2 Infrastructure: Business+ Features ────────────────────────

    // Multi-zone Infrastructure (Business+)
    Route::prefix('infrastructure')
        ->middleware('feature.enforce:NULL,multi_zone_infrastructure')
        ->group(function () {
            Route::get('/zones',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getZones']);
            Route::post('/zones',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'addZone']);
            Route::delete('/{zone}', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'removeZone']);

            // Dedicated IP (Custom only)
            Route::get('/ip',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getDedicatedIp'])
                ->middleware('feature.enforce:NULL,dedicated_ip');
            Route::post('/ip',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'requestDedicatedIp'])
                ->middleware('feature.enforce:NULL,dedicated_ip');

            // Private Cluster (Custom only)
            Route::get('/cluster',  [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getClusterConfig'])
                ->middleware('feature.enforce:NULL,private_cluster');
        });

    // Monitoring (Business+)
    Route::prefix('monitoring')
        ->middleware('feature.enforce:NULL,monitoring')
        ->group(function () {
            Route::get('/',           [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getMonitoringStatus']);
            Route::get('/alerts',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getAlerts']);
            Route::put('/alerts',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateAlertConfig']);
            Route::get('/uptime',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getUptimeHistory']);
        });

    // File Proxy (Business+)
    Route::prefix('file-proxy')
        ->middleware('feature.enforce:NULL,file_proxy')
        ->group(function () {
            Route::get('/',          [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getFileProxyConfig']);
            Route::put('/',          [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateFileProxyConfig']);
            Route::get('/files',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getProxiedFiles']);
            Route::post('/files',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'addProxiedFile']);
            Route::delete('/{id}',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'removeProxiedFile']);
        });

    // XML to JSON (Business+)
    Route::prefix('xml-to-json')
        ->middleware('feature.enforce:NULL,xml_to_json')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getXmlToJsonConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateXmlToJsonConfig']);
            Route::post('/test', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'testXmlToJson']);
        });

    // Block Request by IP (Business+)
    Route::prefix('firewall/ip')
        ->middleware('feature.enforce:NULL,block_request_by_ip')
        ->group(function () {
            Route::get('/',       [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getIpBlocklist']);
            Route::post('/',      [\App\Http\Controllers\Api\SgtmFeatureController::class, 'addIpBlock']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'removeIpBlock']);
        });

    // Schedule Requests (Business+)
    Route::prefix('schedule')
        ->middleware('feature.enforce:NULL,schedule_requests')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getSchedules']);
            Route::post('/',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'createSchedule']);
            Route::put('/{id}', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateSchedule']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'deleteSchedule']);
        });

    // Request Delay (Business+)
    Route::prefix('request-delay')
        ->middleware('feature.enforce:NULL,request_delay')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getDelayConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateDelayConfig']);
        });

    // ── Phase 3 Account: Pro+ / Custom Features ───────────────────────────

    // Google Sheets Connection (Pro+)
    Route::prefix('integrations/google-sheets')
        ->middleware('feature.enforce:NULL,google_sheets_connection')
        ->group(function () {
            Route::get('/',          [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getSheetsConfig']);
            Route::post('/connect',  [\App\Http\Controllers\Api\SgtmFeatureController::class, 'connectSheets']);
            Route::delete('/disconnect', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'disconnectSheets']);
            Route::post('/sync',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'syncSheets']);
        });

    // Single Sign-On (Custom only)
    Route::prefix('sso')
        ->middleware('feature.enforce:NULL,single_sign_on')
        ->group(function () {
            Route::get('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getSsoConfig']);
            Route::put('/',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateSsoConfig']);
            Route::post('/test', [\App\Http\Controllers\Api\SgtmFeatureController::class, 'testSso']);
        });

    // ── Phase 4 Connections: Pro+ Features ───────────────────────────────

    // Data Manager API (Pro+)
    Route::prefix('data-manager')
        ->middleware('feature.enforce:NULL,data_manager_api')
        ->group(function () {
            Route::get('/',        [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getDataManagerConfig']);
            Route::put('/',        [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateDataManagerConfig']);
            Route::post('/push',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'pushDataLayer']);
            Route::get('/schema',  [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getDataSchema']);
        });

    // Google Ads Connection (Pro+)
    Route::prefix('connections/google-ads')
        ->middleware('feature.enforce:NULL,google_ads_connection')
        ->group(function () {
            Route::get('/',          [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getGoogleAdsConfig']);
            Route::put('/',          [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateGoogleAdsConfig']);
            Route::post('/test',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'testGoogleAdsConnection']);
            Route::post('/sync',     [\App\Http\Controllers\Api\SgtmFeatureController::class, 'syncGoogleAds']);
        });

    // Microsoft Ads Connection (Pro+)
    Route::prefix('connections/microsoft-ads')
        ->middleware('feature.enforce:NULL,microsoft_ads_connection')
        ->group(function () {
            Route::get('/',         [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getMicrosoftAdsConfig']);
            Route::put('/',         [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateMicrosoftAdsConfig']);
            Route::post('/test',    [\App\Http\Controllers\Api\SgtmFeatureController::class, 'testMicrosoftAdsConnection']);
        });

    // Meta Custom Audiences (Pro+)
    Route::prefix('connections/meta')
        ->middleware('feature.enforce:NULL,meta_custom_audiences')
        ->group(function () {
            Route::get('/',            [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getMetaConfig']);
            Route::put('/',            [\App\Http\Controllers\Api\SgtmFeatureController::class, 'updateMetaConfig']);
            Route::get('/audiences',   [\App\Http\Controllers\Api\SgtmFeatureController::class, 'getAudiences']);
            Route::post('/sync',       [\App\Http\Controllers\Api\SgtmFeatureController::class, 'syncAudiences']);
        });

}); // end sgtm feature-gated routes

// ── Shopify Webhooks (HMAC-verified, no auth middleware) ──────────
Route::prefix('tracking/shopify')
    ->middleware(['throttle:120,1'])
    ->group(function () {
        Route::post('/webhooks', [\App\Modules\Tracking\Integrations\Shopify\Controllers\ShopifyWebhookController::class, 'handle']);
        Route::post('/privacy',  [\App\Modules\Tracking\Integrations\Shopify\Controllers\ShopifyWebhookController::class, 'privacy']);
    });

// ─── Tracking Module Core Integration (Top Level) ───
require base_path('app/Modules/Tracking/routes/api.php');
