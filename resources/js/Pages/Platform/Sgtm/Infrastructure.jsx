import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Custom Modal Component
 */
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const FormSection = ({ title, description, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-gray-100 last:border-0 p-6">
        <div className="md:col-span-1">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="md:col-span-2 space-y-4">
            {children}
        </div>
    </div>
);

const InputGroup = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
        {children}
    </div>
);

const StatCard = ({ label, value, subtext, icon, color }) => (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-${color}-100 bg-${color}-500`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{subtext}</p>
        </div>
    </div>
);

const Infrastructure = ({ nodes, settings, stats }) => {
    const [activeTab, setActiveTab] = useState('nodes');
    const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
    const [isCheckingHealth, setIsCheckingHealth] = useState(false);
    const [isScalingUp, setIsScalingUp] = useState(false);
    const [clusterStatus, setClusterStatus] = useState(null);
    const [loadingCluster, setLoadingCluster] = useState(false);

    const { data: addNodeData, setData: setAddNodeData, post: postAddNode, processing: addNodeProcessing, reset: resetAddNode } = useForm({
        name: '',
        host: '',
        region: 'us-east-1',
        ssh_port: 22,
        max_containers: 50,
        cpu_cores: 2,
        memory_gb: 4,
    });

    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: settingsProcessing } = useForm({
        auto_scale_threshold: settings.auto_scale_threshold || 85,
        auto_scale_webhook: settings.auto_scale_webhook || '',
        kubernetes_api_key: settings.kubernetes_api_key || '',
        kubernetes_endpoint: settings.kubernetes_endpoint || 'https://api.eks.amazonaws.com',
    });

    useEffect(() => {
        if (activeTab === 'settings') {
            fetchClusterStatus();
        }
    }, [activeTab]);

    const fetchClusterStatus = async () => {
        setLoadingCluster(true);
        try {
            const res = await axios.get('/api/tracking/admin/cluster-status');
            setClusterStatus(res.data);
        } catch (error) {
            console.error('Failed to fetch cluster status');
        } finally {
            setLoadingCluster(false);
        }
    };

    const submitSettings = (e) => {
        e.preventDefault();
        postSettings(route('platform.sgtm.infra.settings'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Infrastructure settings updated'),
        });
    };

    const handleAddNode = (e) => {
        e.preventDefault();
        postAddNode(route('platform.sgtm.infra.nodes.store'), {
            onSuccess: () => {
                setIsAddNodeOpen(false);
                resetAddNode();
                toast.success('Node added to pool');
            },
        });
    };

    const handleHealthCheck = async () => {
        setIsCheckingHealth(true);
        try {
            await axios.post('/api/tracking/admin/health-check');
            toast.success('Global health check completed');
            router.reload({ preserveScroll: true });
        } catch (error) {
            toast.error('Health check failed');
        } finally {
            setIsCheckingHealth(false);
        }
    };

    const handleScaleUp = async (region = 'us-east-1') => {
        setIsScalingUp(true);
        try {
            await axios.post('/api/tracking/admin/nodes/scale-up', { region });
            toast.success(`Scaling up initiated for ${region}`);
            router.reload({ preserveScroll: true });
        } catch (error) {
            toast.error('Scaling up failed');
        } finally {
            setIsScalingUp(false);
        }
    };

    const handleDrain = (id) => {
        if (confirm('Are you sure you want to drain this node? No new containers will be assigned to it.')) {
            axios.post(`/api/tracking/admin/nodes/${id}/drain`).then(() => {
                toast.success('Node set to draining');
                router.reload({ preserveScroll: true });
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Permanently remove this node?')) {
            router.delete(`/api/tracking/admin/nodes/${id}`, {
                onSuccess: () => toast.success('Node removed from pool'),
            });
        }
    };

    return (
        <>
            <Head title="Infrastructure - sGTM Global Oversight" />

            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Infrastructure Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage EC2 Node Pools, Auto-Scaling thresholds, and Enterprise Kubernetes pods.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleHealthCheck}
                        disabled={isCheckingHealth}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border border-slate-200 hover:bg-slate-50 flex items-center gap-2 ${isCheckingHealth ? 'opacity-50' : ''}`}
                    >
                        <svg className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        {isCheckingHealth ? 'Checking...' : 'Run Global Health'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('nodes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'nodes' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        Node Pool
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                        Cluster Scaling
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    label="Current EPS" 
                    value={stats.eps_realtime || '0.00'} 
                    subtext="Events per second (60s avg)" 
                    color="indigo"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                />
                <StatCard 
                    label="Active Nodes" 
                    value={nodes.length} 
                    subtext={`${nodes.filter(n => n.healthy).length} Healthy / ${nodes.filter(n => !n.healthy).length} Warning`} 
                    color="emerald"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                />
                <StatCard 
                    label="Pool Capacity" 
                    value={`${stats.total_max_containers || 0}`} 
                    subtext={`${stats.total_containers || 0} slots used across all regions`} 
                    color="blue"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>}
                />
                <StatCard 
                    label="Infrastructure Cost" 
                    value={`$${(stats.cost_estimate || 0).toFixed(2)}`} 
                    subtext="Estimated daily AWS Opex" 
                    color="rose"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
            </div>

            {activeTab === 'nodes' ? (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 italic bg-slate-50/50">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Node Registry</h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleScaleUp()}
                                disabled={isScalingUp}
                                className={`text-[10px] font-bold text-indigo-600 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg hover:shadow-sm transition-all ${isScalingUp ? 'opacity-50' : ''}`}
                            >
                                <svg className={`w-3 h-3 ${isScalingUp ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                {isScalingUp ? 'Scaling...' : 'Auto-Scale Up (US)'}
                            </button>
                            <button 
                                onClick={() => setIsAddNodeOpen(true)}
                                className="text-[10px] font-bold text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Add New EC2 Node
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node / Region</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Host & IP / Stats</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resources</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {nodes.length > 0 ? nodes.map(node => (
                                    <tr key={node.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-bold text-slate-900 uppercase tracking-tight">{node.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">
                                                {node.region || 'US-EAST-1 (GLOBAL)'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mb-1.5">
                                                {node.host}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                                                <span className="flex items-center gap-1">
                                                    <div className={`w-1 h-1 rounded-full ${node.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    SSH {node.healthy ? 'OK' : 'ERR'}
                                                </span>
                                                <span>•</span>
                                                <span>v2.4.1</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5 w-32">
                                                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                                    <span>CPU</span>
                                                    <span>{node.cpu_percent || 0}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-400" style={{ width: `${node.cpu_percent || 0}%` }} />
                                                </div>
                                                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                                    <span>MEM</span>
                                                    <span>{node.memory_percent || 0}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-slate-400" style={{ width: `${node.memory_percent || 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    node.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                    node.status === 'provisioning' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' :
                                                    node.status === 'draining' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                    {node.status}
                                                </span>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                                    {node.containers} / {node.max_containers} Containers
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleDrain(node.id)}
                                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase"
                                                >
                                                    Drain
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(node.id)}
                                                    className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase"
                                                >
                                                    Kill
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-[0.2em] text-sm">
                                            No active nodes in pool. <br/>
                                            <span className="text-[10px] normal-case font-medium text-slate-400 block mt-2 tracking-normal">Registry is empty.</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Kubernetes Cluster Health Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${clusterStatus?.connected ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'} text-white shadow-lg`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Enterprise Kubernetes Cluster</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-tighter">
                                        {clusterStatus ? `${clusterStatus.cluster_name} • ${clusterStatus.region}` : 'Detecting Cluster...'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${clusterStatus?.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {clusterStatus?.connected ? 'Connected' : 'Disconnected'}
                                </span>
                                {clusterStatus?.simulated && (
                                    <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                                        Simulated
                                    </span>
                                )}
                                <button 
                                    onClick={fetchClusterStatus}
                                    disabled={loadingCluster}
                                    className={`p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all ${loadingCluster ? 'animate-spin' : ''}`}
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Provisioning Speed</p>
                                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">~45 Seconds / Namespace</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">EKS Auth Method</p>
                                <p className="text-sm font-bold text-slate-900">IAM Role Reflection</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orchestrator Mode</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <p className="text-sm font-bold text-slate-900">Hybrid (Docker + K8s)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <form onSubmit={submitSettings}>
                            <FormSection 
                                title="Auto-Scaling Thresholds" 
                                description="Configure the logic that triggers regional scale-up requests to AWS."
                            >
                                <InputGroup label="Capacity Threshold (%)">
                                    <input 
                                        type="number" 
                                        value={settingsData.auto_scale_threshold}
                                        onChange={e => setSettingsData('auto_scale_threshold', e.target.value)}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-slate-900 outline-none transition-all font-bold"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">System will dispatch ScaleUpRegionJob when regional capacity exceeds this percent.</p>
                                </InputGroup>
                                <InputGroup label="Provisioning Webhook URL">
                                    <input 
                                        type="url" 
                                        value={settingsData.auto_scale_webhook}
                                        onChange={e => setSettingsData('auto_scale_webhook', e.target.value)}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                        placeholder="https://aws-lambda.com/scale-up"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">AWS Lifecycle Hook or Lambda endpoint for EC2 provisioning.</p>
                                </InputGroup>
                            </FormSection>

                            <FormSection 
                                title="Enterprise Kubernetes (Phase 3)" 
                                description="Credentials for the hybrid orchestrator. Only used for containers marked as 'kubernetes'."
                            >
                                <InputGroup label="K8s Management API Key">
                                    <input 
                                        type="password" 
                                        value={settingsData.kubernetes_api_key}
                                        onChange={e => setSettingsData('kubernetes_api_key', e.target.value)}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                    />
                                </InputGroup>
                                <InputGroup label="EKS Cluster Endpoint">
                                    <input 
                                        type="text" 
                                        value={settingsData.kubernetes_endpoint}
                                        onChange={e => setSettingsData('kubernetes_endpoint', e.target.value)}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                                    />
                                </InputGroup>
                            </FormSection>

                            <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button 
                                    disabled={settingsProcessing}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                                >
                                    {settingsProcessing ? 'Synchronizing...' : 'Save Infra Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modals */}
            <Modal show={isAddNodeOpen} onClose={() => setIsAddNodeOpen(false)} title="Register New Docker Node">
                <form onSubmit={handleAddNode} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Node Name">
                            <input type="text" value={addNodeData.name} onChange={e => setAddNodeData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" placeholder="aws-us-east-1a" />
                        </InputGroup>
                        <InputGroup label="Region">
                            <input type="text" value={addNodeData.region} onChange={e => setAddNodeData('region', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" placeholder="us-east-1" />
                        </InputGroup>
                    </div>
                    <InputGroup label="Host (IP or Domain)">
                        <input type="text" value={addNodeData.host} onChange={e => setAddNodeData('host', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-slate-900" placeholder="10.0.0.1" />
                    </InputGroup>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Max Containers">
                            <input type="number" value={addNodeData.max_containers} onChange={e => setAddNodeData('max_containers', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                        </InputGroup>
                        <InputGroup label="SSH Port">
                            <input type="number" value={addNodeData.ssh_port} onChange={e => setAddNodeData('ssh_port', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                        </InputGroup>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsAddNodeOpen(false)} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase">Cancel</button>
                        <button disabled={addNodeProcessing} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50">
                            {addNodeProcessing ? 'Provisioning...' : 'Register Node'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Hybrid Orchestration Notice */}
            <div className="mt-8 bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-start gap-4 shadow-sm">
                <div className="bg-white p-2 rounded-xl border border-indigo-100 text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900">Hybrid Orchestration Active</h4>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed font-medium">
                        The platform is currently operating on Hybrid Mode (Docker Pool + Kubernetes EKS). Containers marked as "standard" are handled by Docker VPS nodes, while "enterprise" marked containers are automatically provisioned as Kubernetes Pods.
                    </p>
                </div>
            </div>
        </>
    );
};

Infrastructure.layout = (page) => <PlatformLayout children={page} />;
export default Infrastructure;
