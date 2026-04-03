import React, { useState } from 'react';
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, RefreshCcw, CheckCircle2, ShieldCheck,
    Zap, Clock, Database, ArrowUpRight, Package,
    Activity, Webhook, Tag, Layers, BarChart3,
    ChevronRight, CircleDot, ExternalLink
} from 'lucide-react';

// ─── Micro Components ──────────────────────────────────────────────────────────

const Badge = ({ children, variant = 'success' }) => {
    const styles = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-[0.5px] ring-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${styles[variant]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
            {children}
        </span>
    );
};

const StatCard = ({ label, value, icon: Icon, accent = 'indigo', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-slate-200 hover:shadow-md transition-all duration-300 group"
    >
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${accent}-50 text-${accent}-500 group-hover:scale-110 transition-transform`}>
                <Icon size={15} />
            </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
    </motion.div>
);

const CheckRow = ({ label, status = 'ok' }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-3">
            <CircleDot size={13} className="text-slate-300" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        {status === 'ok'
            ? <CheckCircle2 size={16} className="text-emerald-500" />
            : <span className="text-[10px] font-bold text-amber-500 uppercase">Pending</span>
        }
    </div>
);

// ─── Main Dashboard Page ───────────────────────────────────────────────────────

const ShopifyDashboard = ({ shop }) => {
    const { post, processing } = useForm();
    const [syncStatus, setSyncStatus] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const handleSync = () => {
        post(route('api.tracking.shopify.sync-products', { id: shop?.id }), {
            onSuccess: () => {
                setSyncStatus({ type: 'success', message: 'All products synced successfully' });
                setTimeout(() => setSyncStatus(null), 6000);
            },
            onError: () => setSyncStatus({ type: 'error', message: 'Sync failed — check connection' }),
        });
    };

    const tabs = ['overview', 'data nodes', 'settings'];

    return (
        <DashboardLayout>
            <Head title="Shopify — PixelMaster Tracking" />

            {/* ── Page Header ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
            >
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-14 h-14 bg-[#111827] rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <ShoppingBag size={26} strokeWidth={1.8} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 size={11} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shopify Integration</h1>
                            <Badge variant="success">Connected</Badge>
                        </div>
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                            <Database size={13} className="text-slate-300" />
                            <span className="font-mono text-[12px]">{shop?.domain ?? 'shop.myshopify.com'}</span>
                            <span className="text-slate-200">·</span>
                            <span className="text-indigo-500 font-bold text-[11px]">sGTM #{shop?.container_id ?? '—'}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={`https://${shop?.domain ?? '#'}/admin`}
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        Shopify Admin <ExternalLink size={13} />
                    </a>
                    <button
                        onClick={handleSync}
                        disabled={processing}
                        className="px-5 py-2.5 rounded-xl text-[11px] font-bold bg-[#111827] text-white hover:bg-indigo-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-slate-900/10"
                    >
                        <RefreshCcw size={13} className={processing ? 'animate-spin' : ''} />
                        {processing ? 'Syncing...' : 'Sync Catalogue'}
                    </button>
                </div>
            </motion.div>

            {/* ── Sync Status Toast ────────────────────────────── */}
            <AnimatePresence>
                {syncStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-6 px-5 py-4 rounded-2xl text-[11px] font-semibold flex items-center gap-3 border ${
                            syncStatus.type === 'success'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}
                    >
                        <CheckCircle2 size={16} />
                        {syncStatus.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Stat Cards ───────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Products Synced"   value={shop?.product_count ?? '—'}  icon={Package}    accent="indigo"  delay={0.05} />
                <StatCard label="Last Sync"         value={shop?.last_sync ?? 'Never'}  icon={Clock}      accent="violet"  delay={0.10} />
                <StatCard label="Events Today"      value={shop?.events_today ?? '—'}   icon={Activity}   accent="emerald" delay={0.15} />
                <StatCard label="Active Webhooks"   value="3"                            icon={Webhook}    accent="blue"    delay={0.20} />
            </div>

            {/* ── Tabs ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-8 p-1 bg-slate-100 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                            activeTab === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ──────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-12 gap-6"
                    >
                        {/* Catalogue Manager */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="col-span-12 lg:col-span-8 bg-white border border-slate-100 rounded-3xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <Layers size={17} className="text-indigo-500" />
                                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]">Catalogue Sync</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Webhook Active</span>
                                </div>
                            </div>

                            <div className="p-8">
                                <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-lg">
                                    Products, variants, pricing, and inventory are synchronized in real-time via webhooks. Use the manual trigger for initial setup or post-migration corrections only.
                                </p>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[
                                        { label: 'products/create', status: 'registered' },
                                        { label: 'products/update', status: 'registered' },
                                        { label: 'products/delete', status: 'registered' },
                                    ].map(({ label, status }) => (
                                        <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-2">{status}</div>
                                            <div className="font-mono text-[11px] text-slate-700 font-semibold">{label}</div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSync}
                                    disabled={processing}
                                    className="w-full py-4 bg-[#111827] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] hover:bg-indigo-600 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2.5 group shadow-lg shadow-slate-900/10"
                                >
                                    <RefreshCcw size={14} className={processing ? 'animate-spin' : 'group-hover:rotate-[360deg] transition-transform duration-700'} />
                                    {processing ? 'Running Full Catalogue Sync...' : 'Trigger Full Catalogue Sync'}
                                </button>
                            </div>

                            <div className="px-8 py-4 bg-slate-50/60 border-t border-slate-50 flex items-center gap-6 flex-wrap">
                                {[
                                    ['Webhook API', '2024-01'],
                                    ['Read Scope', 'Granted'],
                                    ['Write Scope', 'Granted'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{k}</span>
                                        <span className="text-[10px] text-slate-700 font-black uppercase">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <div className="col-span-12 lg:col-span-4 space-y-5">
                            {/* System Checks */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white border border-slate-100 rounded-3xl p-6"
                            >
                                <div className="flex items-center gap-2.5 mb-5">
                                    <ShieldCheck size={16} className="text-slate-400" />
                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.18em]">System Checks</h3>
                                </div>
                                <CheckRow label="OAuth Token" status="ok" />
                                <CheckRow label="HMAC Verification" status="ok" />
                                <CheckRow label="Consent Mode V2" status="ok" />
                                <CheckRow label="sGTM Container" status={shop?.container_id ? 'ok' : 'pending'} />
                            </motion.div>

                            {/* Active Events */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18 }}
                                className="bg-[#111827] rounded-3xl p-6 text-white"
                            >
                                <div className="flex items-center gap-2.5 mb-6">
                                    <Zap size={15} className="text-indigo-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">Tracked Events</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        ['page_view', 'view_item', 'add_to_cart'],
                                        ['begin_checkout', 'purchase', 'refund'],
                                    ].flat().map(event => (
                                        <div key={event} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <span className="font-mono text-[11px] text-slate-300">{event}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="#"
                                    className="mt-5 flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                                >
                                    View All Events <ChevronRight size={13} />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'data nodes' && (
                    <motion.div
                        key="data-nodes"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-slate-100 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Database size={17} className="text-indigo-500" />
                            <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]">Connected Data Nodes</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'GA4 Measurement Protocol', status: 'active', tag: 'G-XXXXXXXXXX' },
                                { label: 'Facebook CAPI', status: 'active', tag: 'Meta Pixel' },
                                { label: 'TikTok Events API', status: 'pending', tag: 'Not configured' },
                                { label: 'Snapchat CAPI', status: 'pending', tag: 'Not configured' },
                            ].map(({ label, status, tag }) => (
                                <div key={label} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-700 mb-1">{label}</div>
                                        <div className="font-mono text-[10px] text-slate-400">{tag}</div>
                                    </div>
                                    <Badge variant={status === 'active' ? 'success' : 'warning'}>{status}</Badge>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-slate-100 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Tag size={17} className="text-slate-400" />
                            <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.18em]">Integration Settings</h2>
                        </div>
                        <div className="space-y-6 max-w-lg">
                            {[
                                { label: 'Shop Domain', value: shop?.domain ?? 'Not set' },
                                { label: 'Access Token', value: '••••••••••••••••••••' },
                                { label: 'Webhook Secret', value: '••••••••••••••' },
                                { label: 'API Version', value: '2024-01' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-4 border-b border-slate-50">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
                                    <span className="text-[12px] font-mono font-semibold text-slate-800">{value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default ShopifyDashboard;
