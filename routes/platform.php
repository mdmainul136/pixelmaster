<?php

use App\Http\Controllers\Platform\PlatformDashboardController;
use App\Http\Controllers\Platform\PlatformAuthController;
use App\Http\Controllers\Platform\TenantDomainManagementController;
use App\Http\Controllers\Platform\PlatformSecurityController;
use App\Http\Controllers\Platform\TwoFactorController;
use App\Http\Controllers\Platform\ImpersonationController;
use App\Http\Controllers\Admin\SubscriptionPlanController;
use Illuminate\Support\Facades\Route;

Route::prefix('platform')->group(function () {

        // ── Guest Routes ──────────────────────────────────────────────────────
        Route::middleware('guest:super_admin_web')->group(function () {
            Route::get('/login', [PlatformAuthController::class, 'showLogin'])->name('platform.login');
            Route::post('/login', [PlatformAuthController::class, 'login'])->name('platform.login.submit');
            Route::get('/auth/2fa', [PlatformAuthController::class, 'showTwoFactorChallenge'])->name('platform.auth.2fa');
            Route::post('/auth/2fa', [PlatformAuthController::class, 'handleTwoFactorChallenge'])->name('platform.auth.2fa.submit');
        });

        // ── Protected Routes ─────────────────────────────────────────────────
        Route::middleware(['auth:super_admin_web', '2fa'])->group(function () {

            // Dashboard
            Route::get('/dashboard', [PlatformDashboardController::class, 'index'])->name('platform.dashboard');

            // ── Tenants ──────────────────────────────────────────────────────
            Route::get('/tenants', [PlatformDashboardController::class, 'tenants'])->name('platform.tenants');
            Route::get('/subscriptions', [PlatformDashboardController::class, 'subscriptions'])->name('platform.subscriptions');
            Route::get('/tenants/{tenant}', [PlatformDashboardController::class, 'showTenant'])->name('platform.tenants.show');
            Route::get('/tenants/{tenant}/edit', [PlatformDashboardController::class, 'editTenant'])->name('platform.tenants.edit');
            Route::patch('/tenants/{tenant}', [PlatformDashboardController::class, 'updateTenant'])->name('platform.tenants.update');
            Route::post('/tenants/{tenant}/approve', [PlatformDashboardController::class, 'approveTenant'])->name('platform.tenants.approve');
            Route::post('/tenants/{tenant}/suspend', [PlatformDashboardController::class, 'suspendTenant'])->name('platform.tenants.suspend');
            Route::delete('/tenants/{tenant}', [PlatformDashboardController::class, 'deleteTenant'])->name('platform.tenants.delete');
            Route::post('/tenants/{tenant}/reset-password', [PlatformDashboardController::class, 'resetPassword'])->name('platform.tenants.reset-password');
            Route::post('/tenants/{tenant}/sgtm', [PlatformDashboardController::class, 'updateSgtmConfig'])->name('platform.tenants.sgtm.update');

            // Tenant Quotas
            Route::get('/tenants/{tenant}/quotas', [PlatformDashboardController::class, 'manageQuotas'])->name('platform.tenants.quotas');
            Route::post('/tenants/{tenant}/quotas', [PlatformDashboardController::class, 'updateQuotas'])->name('platform.tenants.quotas.update');

            // Tenant Domain Management
            Route::get('/tenants/{tenant}/domains', [TenantDomainManagementController::class, 'index'])->name('platform.tenants.domains');
            Route::post('/tenants/{tenant}/domains', [TenantDomainManagementController::class, 'store'])->name('platform.tenants.domains.store');
            Route::post('/tenants/{tenant}/domains/{domain}/verify', [TenantDomainManagementController::class, 'verify'])->name('platform.tenants.domains.verify');
            Route::post('/tenants/{tenant}/domains/{domain}/primary', [TenantDomainManagementController::class, 'setPrimary'])->name('platform.tenants.domains.primary');
            Route::delete('/tenants/{tenant}/domains/{domain}', [TenantDomainManagementController::class, 'destroy'])->name('platform.tenants.domains.destroy');
            Route::get('/domains/search', [TenantDomainManagementController::class, 'search'])->name('platform.domains.search');
            Route::post('/tenants/{tenant}/domains/purchase', [TenantDomainManagementController::class, 'purchase'])->name('platform.tenants.domains.purchase');
            Route::post('/tenants/{tenant}/domains/{domain}/verify-dns', [TenantDomainManagementController::class, 'verifyDns'])->name('platform.tenants.domains.verify-dns');
            Route::get('/tenants/{tenant}/domains/{domain}/health', [TenantDomainManagementController::class, 'health'])->name('platform.tenants.domains.health');
            Route::post('/tenants/{tenant}/domains/{domain}/one-click-setup', [TenantDomainManagementController::class, 'oneClickSetup'])->name('platform.tenants.domains.one-click-setup');

            // All Domains overview
            Route::get('/domains', [PlatformDashboardController::class, 'allDomains'])->name('platform.domains');

            // ── Subscription Plans ────────────────────────────────────────────
            Route::get('/billing/plans', [SubscriptionPlanController::class, 'index'])->name('platform.billing.plans');
            Route::post('/billing/plans', [SubscriptionPlanController::class, 'store'])->name('platform.billing.plans.store');
            Route::put('/billing/plans/{id}', [SubscriptionPlanController::class, 'update'])->name('platform.billing.plans.update');
            Route::delete('/billing/plans/{id}', [SubscriptionPlanController::class, 'destroy'])->name('platform.billing.plans.destroy');

            // ── Subscription Lifecycle Management ─────────────────────────────
            Route::post('/subscriptions/{subscription}/cancel',      [PlatformDashboardController::class, 'cancelSubscription'])->name('platform.subscriptions.cancel');
            Route::post('/subscriptions/{subscription}/renew',       [PlatformDashboardController::class, 'renewSubscription'])->name('platform.subscriptions.renew');
            Route::post('/subscriptions/{subscription}/mark-pastdue',[PlatformDashboardController::class, 'markPastDue'])->name('platform.subscriptions.mark-pastdue');
            Route::post('/subscriptions/{subscription}/extend-trial',[PlatformDashboardController::class, 'extendTrial'])->name('platform.subscriptions.extend-trial');

            // ── Events & Queue Monitor ───────────────────────────────────────
            Route::get('/events', [PlatformDashboardController::class, 'events'])->name('platform.events');
            Route::post('/events/retry', [PlatformDashboardController::class, 'retryEvents'])->name('platform.events.retry');

            // ── sGTM Management ───────────────────────────────────────────────
            Route::get('/sgtm', [PlatformDashboardController::class, 'sgtmConfigs'])->name('platform.sgtm');
            Route::get('/sgtm/infrastructure', [PlatformDashboardController::class, 'infrastructure'])->name('platform.sgtm.infra');
            Route::post('/sgtm/infrastructure/settings', [PlatformDashboardController::class, 'updateInfrastructureSettings'])->name('platform.sgtm.infra.settings');
            Route::get('/sgtm/docs', [PlatformDashboardController::class, 'infrastructureDocs'])->name('platform.sgtm.docs');
            
            Route::post('/sgtm/{sgtm}/toggle', [PlatformDashboardController::class, 'toggleSgtm'])->name('platform.sgtm.toggle');
            Route::post('/sgtm/{sgtm}/rotate-key', [PlatformDashboardController::class, 'rotateSgtmKey'])->name('platform.sgtm.rotate-key');
            Route::post('/sgtm/{sgtm}/switch-clickhouse', [PlatformDashboardController::class, 'switchClickHouse'])->name('platform.sgtm.switch-clickhouse');

            // ── Audit & Security ─────────────────────────────────────────────
            // Security & Audit
            Route::get('/security/audit', [PlatformSecurityController::class, 'auditExplorer'])->name('platform.security.audit');
            Route::get('/security/firewall', [PlatformSecurityController::class, 'firewallIndex'])->name('platform.security.firewall');
            Route::post('/security/firewall', [PlatformSecurityController::class, 'storeFirewallRule'])->name('platform.security.firewall.store');
            Route::post('/security/firewall/{rule}/toggle', [PlatformSecurityController::class, 'toggleFirewallRule'])->name('platform.security.firewall.toggle');
            Route::delete('/security/firewall/{rule}', [PlatformSecurityController::class, 'deleteFirewallRule'])->name('platform.security.firewall.delete');
            Route::get('/security/stats', [PlatformSecurityController::class, 'getSecurityStats'])->name('platform.security.stats');
            Route::post('/security/settings', [PlatformSecurityController::class, 'updateSecuritySettings'])->name('platform.security.settings.update');

            // 2FA
            Route::get('/security/2fa', [TwoFactorController::class, 'index'])->name('platform.security.2fa');
            Route::post('/security/2fa/enable', [TwoFactorController::class, 'enable'])->name('platform.security.2fa.enable');
            Route::post('/security/2fa/confirm', [TwoFactorController::class, 'confirm'])->name('platform.security.2fa.confirm');
            Route::post('/security/2fa/disable', [TwoFactorController::class, 'disable'])->name('platform.security.2fa.disable');

            // ── Settings ─────────────────────────────────────────────────────
            Route::get('/settings', [PlatformDashboardController::class, 'settings'])->name('platform.settings');
            Route::post('/settings', [PlatformDashboardController::class, 'updateSettings'])->name('platform.settings.update');

            // --- Infrastructure & DB Configs ---
            Route::get('/infrastructure', [\App\Http\Controllers\Platform\InfrastructureController::class, 'index'])->name('platform.infrastructure.index');
            Route::post('/infrastructure', [\App\Http\Controllers\Platform\InfrastructureController::class, 'update'])->name('platform.infrastructure.update');
            Route::post('/infrastructure/test-k8s', [\App\Http\Controllers\Platform\InfrastructureController::class, 'testKubernetesConnection'])->name('platform.infrastructure.test-k8s');
            Route::get('/sgtm/health', [\App\Modules\Tracking\Controllers\MonitorController::class, 'healthDeck'])->name('platform.sgtm.health');

            // ── Legal Pages ──────────────────────────────────────────────────
            Route::get('/legal', [PlatformDashboardController::class, 'legalPages'])->name('platform.legal');
            Route::post('/legal', [PlatformDashboardController::class, 'updateLegalPages'])->name('platform.legal.update');

            // ── Docs Pages ───────────────────────────────────────────────────
            Route::get('/docs/infrastructure', [PlatformDashboardController::class, 'infrastructureDocs'])->name('platform.docs.infrastructure');
            Route::get('/docs/provisioning', [PlatformDashboardController::class, 'provisioningDocs'])->name('platform.docs.provisioning');
            Route::get('/docs/multi-db', [PlatformDashboardController::class, 'multiDbDocs'])->name('platform.docs.multi-db');
            Route::get('/docs/metabase', [PlatformDashboardController::class, 'metabaseDocs'])->name('platform.docs.metabase');
            Route::get('/analytics', [PlatformDashboardController::class, 'analytics'])->name('platform.analytics');

            // ── System Settings ──────────────────────────────────────────────
            Route::prefix('settings')->group(function () {
                // Pages
                Route::get('/metabase', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'metabaseIndex'])->name('platform.settings.metabase');
                Route::get('/clickhouse', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'clickhouseIndex'])->name('platform.settings.clickhouse');
                Route::get('/pipeline', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'pipelineIndex'])->name('platform.settings.pipeline');
                Route::get('/infrastructure', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'infrastructureIndex'])->name('platform.settings.infrastructure');
                Route::get('/billing', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'billingIndex'])->name('platform.settings.billing');

                // Actions
                Route::post('/update', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'update'])->name('platform.settings.update');
                Route::post('/test', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'testConnection'])->name('platform.settings.test');
                Route::post('/cdn/purge', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'purgeCache'])->name('platform.settings.cdn.purge');
                Route::post('/billing', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'updateBilling'])->name('platform.settings.billing.update');
            });

            // ── Impersonation ─────────────────────────────────────────────────
            Route::post('/impersonate/stop', [ImpersonationController::class, 'stopImpersonating'])->name('platform.impersonate.stop');
            Route::post('/impersonate/{tenant}', [ImpersonationController::class, 'impersonate'])->name('platform.impersonate');

            Route::post('/logout', [PlatformAuthController::class, 'logout'])->name('platform.logout');
        });
});
