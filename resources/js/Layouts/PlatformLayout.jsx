import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

const NavItem = ({ icon, label, href, currentPath, badge }) => {
    const isActive = currentPath?.startsWith(href);

    return (
        <li>
            <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
                <span className="flex-shrink-0">{icon}</span>
                <span className="flex-1">{label}</span>
                {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
            </Link>
        </li>
    );
};

const SectionHeader = ({ label }) => (
    <div className="px-3 mb-1.5">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
);

const SidebarSection = ({ label, children }) => (
    <div className="space-y-1">
        <SectionHeader label={label} />
        <ul className="space-y-0.5">{children}</ul>
    </div>
);

function FlashNotification({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [message]);

    const isSuccess = type === 'success';
    return (
        <div className={`fixed top-20 right-6 z-[9999] flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-2xl border max-w-sm animate-in slide-in-from-right fade-in duration-300 ${
            isSuccess
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-red-600 border-red-500 text-white'
        }`}>
            <span className="flex-shrink-0 mt-0.5">
                {isSuccess
                    ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                }
            </span>
            <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
            <button onClick={onClose} className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

export default function PlatformLayout({ children, title }) {
    const { auth, settings, flash } = usePage().props;
    const { url: currentPath } = usePage();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setNotification({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setNotification({ message: flash.error, type: 'error' });
        }
    }, [flash?.success, flash?.error]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const appName = settings?.app_name || 'PixelMaster';

    return (
        <>
        <div className="min-h-screen bg-slate-50 flex font-inter" dir="ltr">
            <Head title={title ? `${title} — ${appName} Platform` : `${appName} Platform`} />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ====== SIDEBAR ====== */}
            <aside className={`fixed top-0 z-50 flex h-screen flex-col overflow-y-auto transition-all duration-300 scrollbar-thin left-0 ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-72 lg:translate-x-0'}`} style={{ background: 'hsl(222 47% 11%)' }}>
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
                    <Link href="/platform/dashboard" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight text-white">{appName}</span>
                            <p className="text-[10px] text-blue-400 leading-none font-semibold uppercase tracking-widest">Platform Admin</p>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden rounded-lg p-1 text-slate-400 hover:text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
                    {/* Overview */}
                    <SidebarSection label="Overview">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                            label="Dashboard" href="/platform/dashboard" currentPath={currentPath}
                        />
                    </SidebarSection>

                    {/* Tenant Management */}
                    <SidebarSection label="Tenants">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            label="All Tenants" href="/platform/tenants" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                            label="All Domains" href="/platform/domains" currentPath={currentPath}
                        />
                    </SidebarSection>

                    {/* Subscription & Billing */}
                    <SidebarSection label="Billing">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            label="Subscription Billing" href="/platform/subscriptions" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                            label="Manage Plans" href="/platform/billing/plans" currentPath={currentPath}
                        />
                    </SidebarSection>

                    {/* Events & Infrastructure */}
                    <SidebarSection label="Infrastructure">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            label="Event Monitor" href="/platform/events" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                            label="Architecture & Nodes" href="/platform/sgtm/infrastructure" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}
                            label="System Engine (Env)" href="/platform/infrastructure" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            label="sGTM Configs" href="/platform/sgtm" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            label="Infrastructure Manual" href="/platform/docs/infrastructure" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            label="Provisioning Docs" href="/platform/docs/provisioning" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6" /></svg>}
                            label="Multi-DB Architecture" href="/platform/docs/multi-db" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>}
                            label="Metabase Analytics" href="/platform/docs/metabase" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                            label="Global Analytics" href="/platform/analytics" currentPath={currentPath}
                        />
                        <div className="pt-2 px-3 pb-1">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Infrastructure Config</p>
                        </div>
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            label="Metabase (BI)" href="/platform/settings/metabase" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                            label="ClickHouse (DB)" href="/platform/settings/clickhouse" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            label="Event Pipeline" href="/platform/settings/pipeline" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                            label="Global CDN (Edge)" href="/platform/settings/infrastructure" currentPath={currentPath}
                        />
                    </SidebarSection>

                    {/* Security */}
                    <SidebarSection label="Security">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            label="Audit Logs" href="/platform/security/audit" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            label="Firewall Hub" href="/platform/security/firewall" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            label="Security Stats" href="/platform/security/stats" currentPath={currentPath}
                        />
                    </SidebarSection>

                    {/* System & Content */}
                    <SidebarSection label="System & Content">
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            label="Legal Documents" href="/platform/legal" currentPath={currentPath}
                        />
                        <NavItem
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            label="Settings" href="/platform/settings" currentPath={currentPath}
                        />
                    </SidebarSection>
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5 flex-shrink-0 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {auth?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-semibold text-white truncate">{auth?.user?.name || 'Admin'}</div>
                            <div className="text-xs text-slate-400 truncate">{auth?.user?.email || ''}</div>
                        </div>
                    </div>
                    
                    <Link href="/platform/logout" method="post" as="button" className="text-slate-400 hover:text-white transition-colors p-2" title="Log Out">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </Link>
                </div>
            </aside>

            {/* ====== MAIN CONTENT ====== */}
            <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        {title && <h1 className="text-lg font-bold text-slate-800 hidden sm:block">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Platform Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
        {notification && (
            <FlashNotification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
            />
        )}
        </>
    );
}
