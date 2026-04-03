import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Field = ({ label, error, children, hint }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        {children}
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

export default function Edit({ tenant, plans, sgtm }) {
    // Read ?tab= from URL to open correct tab directly
    const initialTab = new URLSearchParams(window.location.search).get('tab') || 'info';
    const [activeTab, setActiveTab] = useState(initialTab);

    // ── Info Form ──────────────────────────────────────────────────────────────
    const infoForm = useForm({
        tenant_name:    tenant.tenant_name || '',
        admin_name:     tenant.admin_name || '',
        admin_email:    tenant.admin_email || '',
        plan:           tenant.plan || 'starter',
        status:         tenant.status || 'active',
        trial_ends_at:  tenant.trial_ends_at || '',
    });

    const submitInfo = (e) => {
        e.preventDefault();
        infoForm.patch(route('platform.tenants.update', tenant.id));
    };

    // ── Password Form ──────────────────────────────────────────────────────────
    const pwForm = useForm({
        password:               '',
        password_confirmation:  '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        pwForm.post(route('platform.tenants.reset-password', tenant.id), {
            onSuccess: () => pwForm.reset(),
        });
    };

    // ── sGTM Form ──────────────────────────────────────────────────────────────
    const sgtmForm = useForm({
        container_id:   sgtm?.container_id || '',
        custom_domain:  sgtm?.custom_domain || '',
        is_active:      sgtm?.is_active !== undefined ? sgtm.is_active : true,
    });

    const submitSgtm = (e) => {
        e.preventDefault();
        sgtmForm.post(route('platform.tenants.sgtm.update', tenant.id));
    };

    const tabs = [
        { key: 'info',     label: 'Workspace Info' },
        { key: 'password', label: 'Reset Password' },
        { key: 'sgtm',     label: 'sGTM Config' },
    ];

    return (
        <PlatformLayout title={`Edit — ${tenant.tenant_name}`}>
            <Head title={`Edit: ${tenant.tenant_name}`} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href={route('platform.tenants.show', tenant.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Edit Tenant</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{tenant.tenant_name} · <span className="font-mono text-xs">{tenant.id}</span></p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl space-y-5">

                {/* ── Tab: Info ─────────────────────────────────────────────────── */}
                {activeTab === 'info' && (
                    <SectionCard title="Workspace Information" subtitle="Update the tenant's name, email, plan, and operational status.">
                        <form onSubmit={submitInfo} className="space-y-5">
                            <Field label="Workspace Name" error={infoForm.errors.tenant_name}>
                                <input type="text" className={inputClass}
                                    value={infoForm.data.tenant_name}
                                    onChange={e => infoForm.setData('tenant_name', e.target.value)} />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Admin Name" error={infoForm.errors.admin_name}>
                                    <input type="text" className={inputClass}
                                        value={infoForm.data.admin_name}
                                        onChange={e => infoForm.setData('admin_name', e.target.value)} />
                                </Field>
                                <Field label="Admin Email" error={infoForm.errors.admin_email}>
                                    <input type="email" className={inputClass}
                                        value={infoForm.data.admin_email}
                                        onChange={e => infoForm.setData('admin_email', e.target.value)} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Subscription Plan" error={infoForm.errors.plan}>
                                    <select className={inputClass + ' appearance-none'}
                                        value={infoForm.data.plan}
                                        onChange={e => infoForm.setData('plan', e.target.value)}>
                                        {plans.map(p => (
                                            <option key={p.plan_key} value={p.plan_key}>{p.name}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Status" error={infoForm.errors.status}>
                                    <select className={inputClass + ' appearance-none'}
                                        value={infoForm.data.status}
                                        onChange={e => infoForm.setData('status', e.target.value)}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Trial End Date" hint="Leave empty for no trial." error={infoForm.errors.trial_ends_at}>
                                <input type="date" className={inputClass}
                                    value={infoForm.data.trial_ends_at}
                                    onChange={e => infoForm.setData('trial_ends_at', e.target.value)} />
                            </Field>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={infoForm.processing}
                                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50">
                                    {infoForm.processing ? 'Saving…' : 'Save Changes'}
                                </button>
                                <Link href={route('platform.tenants.show', tenant.id)}
                                    className="px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {/* ── Tab: Password ─────────────────────────────────────────────── */}
                {activeTab === 'password' && (
                    <SectionCard
                        title="Reset Admin Password"
                        subtitle={`Set a new password for ${tenant.admin_email}. This updates the user directly in the tenant's database.`}
                    >
                        {/* Success message */}
                        {pwForm.recentlySuccessful && (
                            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
                                ✓ Password reset successfully!
                            </div>
                        )}

                        <form onSubmit={submitPassword} className="space-y-5">
                            {/* Info box */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Security Action</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        This will immediately update the password for <strong>{tenant.admin_email}</strong> in the tenant's database. The tenant will need to use the new password to login.
                                    </p>
                                </div>
                            </div>

                            <Field label="New Password" error={pwForm.errors.password} hint="Minimum 8 characters.">
                                <input type="password" className={inputClass}
                                    value={pwForm.data.password}
                                    onChange={e => pwForm.setData('password', e.target.value)}
                                    placeholder="Enter new password…" />
                            </Field>

                            <Field label="Confirm New Password" error={pwForm.errors.password_confirmation}>
                                <input type="password" className={inputClass}
                                    value={pwForm.data.password_confirmation}
                                    onChange={e => pwForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password…" />
                            </Field>

                            <div className="pt-2">
                                <button type="submit" disabled={pwForm.processing || !pwForm.data.password}
                                    className="px-6 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 transition-all shadow-sm disabled:opacity-50">
                                    {pwForm.processing ? 'Resetting…' : '🔑 Reset Password'}
                                </button>
                            </div>
                        </form>
                    </SectionCard>
                )}

                {/* ── Tab: sGTM ─────────────────────────────────────────────────── */}
                {activeTab === 'sgtm' && (
                    <SectionCard
                        title="Server-Side GTM Configuration"
                        subtitle="Configure the sGTM container for this tenant. Changes take effect immediately."
                    >
                        <form onSubmit={submitSgtm} className="space-y-5">
                            <Field label="Container ID" error={sgtmForm.errors.container_id}
                                hint="Your GTM container ID, e.g. GTM-XXXXXX">
                                <input type="text" className={inputClass}
                                    value={sgtmForm.data.container_id}
                                    onChange={e => sgtmForm.setData('container_id', e.target.value)}
                                    placeholder="GTM-XXXXXX" />
                            </Field>

                            <Field label="Custom sGTM Domain" error={sgtmForm.errors.custom_domain}
                                hint="Optional: custom domain for server-side tracking (e.g. tracking.yourdomain.com)">
                                <input type="text" className={inputClass}
                                    value={sgtmForm.data.custom_domain}
                                    onChange={e => sgtmForm.setData('custom_domain', e.target.value)}
                                    placeholder="tracking.yourdomain.com" />
                            </Field>

                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={sgtmForm.data.is_active}
                                        onChange={e => sgtmForm.setData('is_active', e.target.checked)} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">sGTM Active</div>
                                    <div className="text-xs text-slate-500">Enable to process tracking events through this container.</div>
                                </div>
                            </label>

                            {sgtm && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current API Key</p>
                                    <code className="text-xs font-mono text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 block break-all">
                                        {sgtm.api_key ?? '—'}
                                    </code>
                                    <p className="text-[10px] text-slate-400">Use this key in tenant tracking requests. Rotate from the sGTM Config Manager.</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" disabled={sgtmForm.processing}
                                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50">
                                    {sgtmForm.processing ? 'Saving…' : 'Save sGTM Config'}
                                </button>
                            </div>
                        </form>
                    </SectionCard>
                )}
                {/* ── Tab: Payment ─────────────────────────────────────────────────── */}
                {activeTab === 'payment' && (
                    <SectionCard
                        title="Payment Gateway Configuration"
                        subtitle="Configure payment processing keys for this workspace."
                    >
                        <form onSubmit={submitPayment} className="space-y-5">
                            <Field label="Payment Gateway" error={paymentForm.errors.gateway_name}>
                                <select className={inputClass + ' appearance-none'}
                                    value={paymentForm.data.gateway_name}
                                    onChange={handleGatewayChange}>
                                    <option value="stripe">Stripe</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="sslcommerz">SSLCommerz</option>
                                    <option value="razorpay">Razorpay</option>
                                </select>
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Environment Mode" error={paymentForm.errors.mode}>
                                    <select className={inputClass + ' appearance-none'}
                                        value={paymentForm.data.mode}
                                        onChange={e => paymentForm.setData('mode', e.target.value)}>
                                        <option value="sandbox">Sandbox / Test</option>
                                        <option value="live">Live / Production</option>
                                    </select>
                                </Field>

                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all mt-6">
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer"
                                            checked={paymentForm.data.is_active}
                                            onChange={e => paymentForm.setData('is_active', e.target.checked)} />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">Gateway Active</div>
                                    </div>
                                </label>
                            </div>

                            <Field label="Public Key / Client ID" error={paymentForm.errors?.['credentials.public_key']}>
                                <input type="text" className={inputClass}
                                    value={paymentForm.data.credentials.public_key}
                                    onChange={e => paymentForm.setData('credentials', { ...paymentForm.data.credentials, public_key: e.target.value })}
                                    placeholder={`Enter ${paymentForm.data.gateway_name} public key`} />
                            </Field>

                            <Field label="Secret Key" error={paymentForm.errors?.['credentials.secret_key']}>
                                <input type="password" className={inputClass}
                                    value={paymentForm.data.credentials.secret_key}
                                    onChange={e => paymentForm.setData('credentials', { ...paymentForm.data.credentials, secret_key: e.target.value })}
                                    placeholder={`Enter ${paymentForm.data.gateway_name} secret key`} />
                            </Field>

                            <div className="pt-2">
                                <button type="submit" disabled={paymentForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50">
                                    {paymentForm.processing ? 'Saving…' : 'Save Payment Config'}
                                </button>
                            </div>
                        </form>
                    </SectionCard>
                )}
            </div>
        </PlatformLayout>
    );
}
