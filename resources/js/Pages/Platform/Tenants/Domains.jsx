import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DomainStatusBadge = ({ status }) => {
    const configs = {
        pending: 'bg-amber-50 text-amber-600 border-amber-200',
        verified: 'bg-green-50 text-green-600 border-green-200',
        failed: 'bg-red-50 text-red-600 border-red-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${configs[status] || configs.pending}`}>
            {status}
        </span>
    );
};

const DnsRow = ({ type, host, value, note }) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <span className="w-16 text-center py-1 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-widest">{type}</span>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Host</span>
                <code className="text-sm font-black text-slate-900">{host}</code>
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Value / Points To</span>
            <code className="text-xs font-mono bg-white p-2 border border-slate-200 rounded-lg break-all">{value}</code>
        </div>
        {note && <div className="text-[10px] text-slate-400 font-medium italic">{note}</div>}
    </div>
);

const HealthReportView = ({ report }) => {
    if (!report) return null;
    
    return (
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                📡 Live Health Diagnostics
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pointing & Propagation */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Global Propagation</span>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${report.pointing.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {report.pointing.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-3">{report.pointing.message}</p>
                    
                    {report.pointing.propagation && (
                        <div className="space-y-1">
                            {Object.entries(report.pointing.propagation).map(([resolver, isPropagated]) => (
                                <div key={resolver} className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-600">{resolver}</span>
                                    <span className={isPropagated ? "text-green-500 font-black" : "text-slate-300"}>{isPropagated ? "✓ YES" : "✕ NO"}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SSL Status */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">SSL Configuration</span>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${report.ssl.status === 'valid' ? 'bg-green-100 text-green-700' : report.ssl.status === 'provisioning' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                            {report.ssl.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{report.ssl.message}</p>
                    {report.ssl.expiry && (
                        <p className="text-[10px] text-slate-400 mt-2">Expires: {new Date(report.ssl.expiry).toLocaleDateString()}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Domains({ tenant, domains, platformIp }) {
    const [activeTab, setActiveTab] = useState('manage');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [purchasing, setPurchasing] = useState(null);
    const [verifying, setVerifying] = useState(null);
    const [oneClicking, setOneClicking] = useState(null);
    const [healthReports, setHealthReports] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        domain: '',
        purpose: 'website',
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;
        setSearching(true);
        try {
            const res = await axios.get(route('platform.domains.search'), { params: { domain: searchQuery } });
            setSearchResults(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleAddDomain = (e) => {
        e.preventDefault();
        post(route('platform.tenants.domains.store', tenant.id), {
            onSuccess: () => {
                reset();
                toast.success('Domain added successfully');
            },
        });
    };

    const runDnsVerification = async (id) => {
        setVerifying(id);
        try {
            const domainObj = domains.find(d => d.id === id);
            if (domainObj && domainObj.status === 'verified') {
                const res = await axios.get(route('platform.tenants.domains.health', [tenant.id, id]));
                if (res.data.success) {
                    setHealthReports(prev => ({ ...prev, [id]: res.data.data.diagnostics }));
                    toast.success('Diagnostics refreshed');
                }
            } else {
                const res = await axios.post(route('platform.tenants.domains.verify-dns', [tenant.id, id]));
                if (res.data.success) {
                    toast.success(res.data.message || 'DNS Verified!');
                    setHealthReports(prev => ({ ...prev, [id]: res.data.diagnostics }));
                    router.reload();
                } else {
                    toast.error(res.data.message || 'Verification Failed');
                    if (res.data.diagnostics) {
                        setHealthReports(prev => ({ ...prev, [id]: res.data.diagnostics }));
                    }
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setVerifying(null);
        }
    };

    const forceVerifyDomain = (id) => {
        if(confirm('Are you sure you want to FORCE verify this domain? This bypasses real DNS checks.')) {
            router.post(route('platform.tenants.domains.verify', [tenant.id, id]), {}, {
                onSuccess: () => toast.success('Domain force verified'),
            });
        }
    };

    const oneClickSetup = async (id) => {
        setOneClicking(id);
        try {
            const res = await axios.post(route('platform.tenants.domains.one-click-setup', [tenant.id, id]));
            if (res.data.success) {
                toast.success('DNS Records updated safely');
                router.reload();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Auto-setup failed');
        } finally {
            setOneClicking(null);
        }
    };

    const purchaseDomain = async (domain) => {
        if(confirm(`Are you sure you want to purchase ${domain} on behalf of ${tenant.tenant_name}? A pending invoice will be generated.`)) {
            setPurchasing(domain);
            try {
                const res = await axios.post(route('platform.tenants.domains.purchase', tenant.id), {
                    domain: domain,
                    years: 1
                });
                if(res.data.success) {
                    toast.success(res.data.message);
                    setActiveTab('manage');
                    router.reload();
                }
            } catch(err) {
                toast.error(err.response?.data?.message || 'Failed to purchase domain');
            } finally {
                setPurchasing(null);
            }
        }
    };

    const setPrimary = (id) => {
        router.post(route('platform.tenants.domains.primary', [tenant.id, id]), {}, {
            onSuccess: () => toast.success('Primary domain updated'),
        });
    };

    const deleteDomain = (id) => {
        if (confirm('Are you sure you want to remove this domain?')) {
            router.delete(route('platform.tenants.domains.destroy', [tenant.id, id]), {
                onSuccess: () => toast.success('Domain removed'),
            });
        }
    };

    return (
        <PlatformLayout>
            <Head title={`Manage Domains - ${tenant.tenant_name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href={route('platform.tenants')}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            Domain Management
                            <span className="text-sm font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{tenant.tenant_name}</span>
                        </h2>
                        <p className="text-slate-500 font-medium">Configure custom hostnames, verification, and provision domains.</p>
                    </div>
                </div>

                <div className="flex gap-2 border-b border-slate-200 mb-8 pb-4">
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        Configured Domains
                    </button>
                    <button 
                        onClick={() => setActiveTab('buy')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'buy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-blue-600 hover:bg-slate-50'}`}
                    >
                        <span>🛒</span> Provision New Domain
                    </button>
                </div>

                {activeTab === 'manage' && (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Add Domain Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Register Existing Domain manually</h3>
                            <form onSubmit={handleAddDomain} className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="store.customdomain.com"
                                        value={data.domain}
                                        onChange={e => setData('domain', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                    />
                                    {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
                                </div>
                                <select 
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                                >
                                    <option value="website">Website</option>
                                    <option value="api">API / Backend</option>
                                    <option value="other">Other</option>
                                </select>
                                <button 
                                    disabled={processing}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {processing ? 'Adding...' : 'Add Domain'}
                                </button>
                            </form>
                        </div>

                        {/* Domain List */}
                        <div className="space-y-4">
                            {domains.map((domain) => (
                                <div key={domain.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-500">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${domain.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    🌐
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{domain.domain}</h4>
                                                        {domain.is_primary && (
                                                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">Primary</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <DomainStatusBadge status={domain.status} />
                                                        <span className="text-xs text-slate-400 font-medium tracking-tight">Purpose: {domain.purpose}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button 
                                                    onClick={() => runDnsVerification(domain.id)}
                                                    disabled={verifying === domain.id}
                                                    className="px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {verifying === domain.id && <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>}
                                                    {domain.status === 'verified' ? 'Run Health Check' : 'Verify DNS'}
                                                </button>
                                                {!domain.is_verified && (
                                                    <button 
                                                        onClick={() => forceVerifyDomain(domain.id)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                                    >
                                                        Force Verify (Override)
                                                    </button>
                                                )}
                                                {!domain.is_primary && domain.status === 'verified' && (
                                                    <button 
                                                        onClick={() => setPrimary(domain.id)}
                                                        className="px-4 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                                                    >
                                                        Make Primary
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteDomain(domain.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remove Domain"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                                                </button>
                                            </div>
                                        </div>

                                        {domain.status !== 'verified' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                                                    <div className="text-xl">⚠️</div>
                                                    <div className="flex-1">
                                                        <h5 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Action Required: Verify Ownership</h5>
                                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                                            To connect your domain, instruct the merchant to add the following DNS records to their domain registrar.
                                                        </p>
                                                        {(domain.is_managed || true) && (
                                                            <button 
                                                                onClick={() => oneClickSetup(domain.id)}
                                                                disabled={oneClicking === domain.id}
                                                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                {oneClicking === domain.id ? 'Connecting...' : '🚀 Provision DNS Automatically'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <DnsRow 
                                                        type="TXT" 
                                                        host={domain.domain.split('.').slice(-2).join('.')} 
                                                        value={`platform-verification=${domain.verification_token}`} 
                                                        note="Verifies ownership"
                                                    />
                                                    <DnsRow 
                                                        type="A" 
                                                        host="@" 
                                                        value={platformIp || "Loading..."} 
                                                        note="Points root to platform"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {domain.status === 'verified' && (
                                            <div className="space-y-4 mt-4">
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs">🔒</div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">SSL Certificate</p>
                                                            <p className="text-[10px] text-green-600 font-bold">Active & Secured via Let's Encrypt</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400">Managed Automatically</div>
                                                </div>
                                                
                                                {healthReports[domain.id] && (
                                                    <HealthReportView report={healthReports[domain.id]} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {domains.length === 0 && (
                                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="text-4xl mb-4">☁️</div>
                                    <h5 className="text-slate-900 font-bold">No custom domains</h5>
                                    <p className="text-slate-500 text-sm mt-1">This tenant is currently using the default system domain.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'buy' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">🔍</span>
                                    Provision Domain for {tenant.tenant_name}
                                </h2>
                                <p className="text-slate-500 text-sm mb-6 max-w-lg">Search for a domain and automatically provision it to this tenant. A pending invoice will automatically be generated in their billing center.</p>
                                <form onSubmit={handleSearch} className="relative max-w-2xl">
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="tenant-awesome-store.com"
                                        className="w-full h-16 bg-white border-2 border-slate-200 rounded-2xl px-6 pr-40 text-lg font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                    />
                                    <button 
                                        disabled={searching}
                                        className="absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {searching && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>}
                                        {searching ? 'Checking...' : 'Check'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {searchResults && (
                            <div className="space-y-6">
                                {/* Main Result */}
                                <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm max-w-2xl ${searchResults.main.available ? 'border-green-400 bg-green-50/50' : 'border-slate-200 bg-white opacity-70'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{searchResults.main.domain}</h3>
                                            <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${searchResults.main.available ? 'text-green-600' : 'text-slate-400'}`}>
                                                {searchResults.main.available ? '✓ Available for Provisioning' : '✕ Already Taken'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-slate-900">${searchResults.main.price} <span className="text-[10px] text-slate-400 uppercase tracking-widest block mt-0.5">/ year</span></div>
                                            {searchResults.main.available && (
                                                <button 
                                                    onClick={() => purchaseDomain(searchResults.main.domain)}
                                                    disabled={purchasing === searchResults.main.domain}
                                                    className="mt-3 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                >
                                                    {purchasing === searchResults.main.domain ? 'Provisioning...' : 'Provision Now'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest pt-4">Alternative Suggestions</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.suggestions.slice(0, 6).map((s, i) => (
                                        <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all group">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{s.domain}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-slate-500">${s.price}</span>
                                                <button 
                                                    onClick={() => purchaseDomain(s.domain)}
                                                    disabled={purchasing === s.domain}
                                                    className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                >
                                                    Buy
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PlatformLayout>
    );
}
