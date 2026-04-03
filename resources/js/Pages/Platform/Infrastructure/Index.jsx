import React, { useState } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

const FormSection = ({ title, description, badge, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-gray-100 last:border-0">
        <div className="md:col-span-1">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-indigo-100 text-indigo-700">{badge}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="md:col-span-2 space-y-4">
            {children}
        </div>
    </div>
);

const InputGroup = ({ label, children, helper }) => (
    <div className="space-y-1.5 mt-4">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
        {children}
        {helper && <p className="text-[10px] text-slate-400 font-medium">{helper}</p>}
    </div>
);

const ToggleSwitch = ({ label, description, checked, onChange, icon }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${checked ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-gray-100'}`}>
        <div className="flex items-center gap-3">
            {icon && (
                <div className={`p-2 rounded-lg ${checked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {icon}
                </div>
            )}
            <div>
                <p className={`text-sm font-bold ${checked ? 'text-indigo-900' : 'text-slate-800'}`}>{label}</p>
                <p className="text-[11px] text-slate-500">{description}</p>
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
    </div>
);

export default function InfrastructureIndex({ settings }) {
    const [activeTab, setActiveTab] = useState('redis');
    const [isTestingK8s, setIsTestingK8s] = useState(false);
    const [k8sTestResult, setK8sTestResult] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        // ... (existing form data remains)
        tracking_dedup_store: settings.tracking_dedup_store || 'redis',
        redis_queue_connection: settings.redis_queue_connection || 'default',
        
        upstash_redis_url: settings.upstash_redis_url || '',
        upstash_redis_host: settings.upstash_redis_host || '',
        upstash_redis_password: settings.upstash_redis_password || '',
        
        aws_redis_url: settings.aws_redis_url || '',
        aws_redis_host: settings.aws_redis_host || '',
        aws_redis_password: settings.aws_redis_password || '',
        
        kafka_enabled: settings.kafka_enabled || false,
        kafka_brokers: settings.kafka_brokers || '127.0.0.1:9092',
        kafka_topic_events: settings.kafka_topic_events || 'tracking-events',
        
        clickhouse_enabled: settings.clickhouse_enabled || false,
        clickhouse_host: settings.clickhouse_host || '127.0.0.1',
        clickhouse_port: settings.clickhouse_port || 8123,
        clickhouse_database: settings.clickhouse_database || 'tracking',
        clickhouse_user: settings.clickhouse_user || 'default',
        clickhouse_password: settings.clickhouse_password || '',

        tracking_orchestrator: settings.tracking_orchestrator || 'docker',
        eks_cluster_name: settings.eks_cluster_name || 'sgtm-tracking',
        aws_default_region: settings.aws_default_region || 'ap-southeast-1',
        k8s_namespace_prefix: settings.k8s_namespace_prefix || 'tracking-',
        kubectl_timeout: settings.kubectl_timeout || 60,
    });

    const handleTestK8s = async () => {
        setIsTestingK8s(true);
        setK8sTestResult(null);
        try {
            const response = await axios.post(route('platform.infrastructure.test-k8s'), {
                eks_cluster_name: data.eks_cluster_name,
                aws_default_region: data.aws_default_region,
                kubectl_timeout: data.kubectl_timeout,
            });
            setK8sTestResult({ success: true, message: response.data.message });
        } catch (err) {
            setK8sTestResult({ 
                success: false, 
                message: err.response?.data?.message || 'Cluster connection failed. Check AWS credentials.' 
            });
        } finally {
            setIsTestingK8s(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (confirm("Warning: Saving these settings will momentarily restart the background queues & clear cache to apply new connections. Continue?")) {
            post(route('platform.infrastructure.update'), {
                preserveScroll: true,
            });
        }
    };

    const tabs = [
        { id: 'redis', label: 'Cache & Redis', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
        )},
        { id: 'kafka', label: 'Kafka Broker', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        )},
        { id: 'clickhouse', label: 'ClickHouse Analytics', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        )},
        { id: 'kubernetes', label: 'Kubernetes Cluster', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        )},
    ];

    return (
        <PlatformLayout>
            <Head title="Infrastructure & DBs - Platform Admin" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Infrastructure & Databases</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage core system `.env` connections dynamically. Changes apply immediately.</p>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={processing}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-indigo-500 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 inline-flex items-center gap-2"
                >
                    {processing ? 'Applying Architecture...' : 'Save & Reload Engine'}
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-gray-200 p-4 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-indigo-900 shadow-sm border border-gray-200' 
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    
                    <div className="mt-8 pt-8 border-t border-gray-200 px-3">
                        <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <p className="text-[10px] text-amber-700 font-bold leading-tight">These settings edit .env files and restart background cache immediately.</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        
                        {/* REDIS TAB */}
                        {activeTab === 'redis' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <FormSection 
                                    title="Cache Storage Routing" 
                                    description="Determines which Redis cluster powers specific Laravel cache facades."
                                >
                                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-6">
                                        <InputGroup label="Event Deduplication Store" helper="Used in EventDeduplicationService">
                                            <select 
                                                value={data.tracking_dedup_store}
                                                onChange={e => setData('tracking_dedup_store', e.target.value)}
                                                className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            >
                                                <option value="redis">Local Node Redis</option>
                                                <option value="upstash">Upstash (Serverless)</option>
                                                <option value="aws">AWS ElastiCache</option>
                                            </select>
                                        </InputGroup>
                                        
                                        <InputGroup label="Background Queues Store" helper="Used for tracking-logs jobs">
                                            <select 
                                                value={data.redis_queue_connection}
                                                onChange={e => setData('redis_queue_connection', e.target.value)}
                                                className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            >
                                                <option value="default">Local Node Redis (Default)</option>
                                                <option value="upstash">Upstash (Serverless)</option>
                                                <option value="aws">AWS ElastiCache</option>
                                            </select>
                                        </InputGroup>
                                    </div>
                                </FormSection>

                                <FormSection 
                                    title="Upstash Serverless Redis" 
                                    description="High-availability managed Redis for global locking and cross-node deduplication."
                                >
                                    <InputGroup label="Upstash URL">
                                        <input type="text" value={data.upstash_redis_url} onChange={e => setData('upstash_redis_url', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" placeholder="rediss://default:pwd@host..." />
                                    </InputGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Host">
                                            <input type="text" value={data.upstash_redis_host} onChange={e => setData('upstash_redis_host', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                        <InputGroup label="Password">
                                            <input type="password" value={data.upstash_redis_password} onChange={e => setData('upstash_redis_password', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                    </div>
                                </FormSection>

                                <FormSection 
                                    title="AWS ElastiCache Redis" 
                                    description="Enterprise scale Redis cluster configuration."
                                >
                                    <InputGroup label="AWS Redis URL">
                                        <input type="text" value={data.aws_redis_url} onChange={e => setData('aws_redis_url', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" placeholder="rediss://..." />
                                    </InputGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Host">
                                            <input type="text" value={data.aws_redis_host} onChange={e => setData('aws_redis_host', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                        <InputGroup label="Password">
                                            <input type="password" value={data.aws_redis_password} onChange={e => setData('aws_redis_password', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                    </div>
                                </FormSection>
                            </div>
                        )}

                        {/* KAFKA TAB */}
                        {activeTab === 'kafka' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <FormSection 
                                    title="Event Ingestion Pipeline" 
                                    description="Apache Kafka provides high-throughput, fault-tolerant event ingestion. Phase 2 of architecture."
                                >
                                    <ToggleSwitch 
                                        label="Enable Kafka Stream Ingestion" 
                                        description="If ON, incoming tracking events will be published to Kafka."
                                        checked={data.kafka_enabled}
                                        onChange={(val) => setData('kafka_enabled', val)}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                                    />

                                    {data.kafka_enabled && (
                                        <div className="mt-6 space-y-4 p-6 bg-slate-50 border border-gray-200 rounded-xl">
                                            <InputGroup label="Kafka Broker Addresses" helper="Comma separated list (e.g. host1:9092,host2:9092)">
                                                <input type="text" value={data.kafka_brokers} onChange={e => setData('kafka_brokers', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </InputGroup>
                                            <InputGroup label="Main Events Topic Name" helper="The Kafka topic name where tracking events are produced.">
                                                <input type="text" value={data.kafka_topic_events} onChange={e => setData('kafka_topic_events', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </InputGroup>
                                        </div>
                                    )}
                                </FormSection>
                            </div>
                        )}

                        {/* CLICKHOUSE TAB */}
                        {activeTab === 'clickhouse' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <FormSection 
                                    title="Analytical Database Migration" 
                                    description="ClickHouse handles billions of rows in milliseconds. Phase 3 of architecture."
                                >
                                    <ToggleSwitch 
                                        label="Enable ClickHouse Sync" 
                                        description="If ON, system will read marketing events from ClickHouse instead of MySQL."
                                        checked={data.clickhouse_enabled}
                                        onChange={(val) => setData('clickhouse_enabled', val)}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>}
                                    />

                                    {data.clickhouse_enabled && (
                                        <div className="mt-6 bg-slate-50 border border-gray-200 rounded-xl p-6">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <InputGroup label="Host Address">
                                                    <input type="text" value={data.clickhouse_host} onChange={e => setData('clickhouse_host', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </InputGroup>
                                                <InputGroup label="Port Number">
                                                    <input type="number" value={data.clickhouse_port} onChange={e => setData('clickhouse_port', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </InputGroup>
                                            </div>
                                            <InputGroup label="Database Name">
                                                <input type="text" value={data.clickhouse_database} onChange={e => setData('clickhouse_database', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </InputGroup>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <InputGroup label="Username">
                                                    <input type="text" value={data.clickhouse_user} onChange={e => setData('clickhouse_user', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </InputGroup>
                                                <InputGroup label="Password">
                                                    <input type="password" value={data.clickhouse_password} onChange={e => setData('clickhouse_password', e.target.value)} className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </InputGroup>
                                            </div>
                                        </div>
                                    )}
                                </FormSection>
                            </div>
                        )}

                        {/* KUBERNETES TAB */}
                        {activeTab === 'kubernetes' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <FormSection 
                                    title="Deployment Engine" 
                                    description="Determines how tracking containers are provisioned and scaled. AWS EKS is required for Kubernetes mode."
                                    badge="Infrastructure"
                                >
                                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                                        <InputGroup label="Active Orchestrator" helper="Switch cases for container lifecycle (suspend/resume/deploy).">
                                            <select 
                                                value={data.tracking_orchestrator}
                                                onChange={e => setData('tracking_orchestrator', e.target.value)}
                                                className="w-full bg-white text-slate-900 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            >
                                                <option value="docker">Standalone Docker (EC2/VPS)</option>
                                                <option value="kubernetes">Elastic Kubernetes Service (AWS EKS)</option>
                                            </select>
                                        </InputGroup>
                                    </div>
                                </FormSection>

                                <FormSection 
                                    title="AWS EKS Connectivity" 
                                    description="Configure the primary EKS cluster for high-scale multi-tenant deployments."
                                    badge="AWS"
                                >
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Cluster Service Name">
                                                <input type="text" value={data.eks_cluster_name} onChange={e => setData('eks_cluster_name', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </InputGroup>
                                            <InputGroup label="Target AWS Region">
                                                <input type="text" value={data.aws_default_region} onChange={e => setData('aws_default_region', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                            </InputGroup>
                                        </div>

                                        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${k8sTestResult?.success ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                                    {isTestingK8s ? (
                                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.959 11.959 0 01-1.25 12.154c-1.129 1.488-2.66 2.766-4.368 3.664a11.938 11.938 0 01-8.618 0 11.93 11.93 0 01-4.368-3.664 11.959 11.959 0 01-1.25-12.154m17.236 0l-8.618 3.04L3.382 6.016"></path></svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-indigo-900 tracking-tight">Verify Connectivity</p>
                                                    <p className="text-[10px] text-indigo-700/60 font-bold uppercase tracking-widest">Test kubectl cluster-info</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={handleTestK8s}
                                                disabled={isTestingK8s}
                                                className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-[11px] font-black hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm"
                                            >
                                                {isTestingK8s ? 'Connecting...' : 'Test Cluster Connection'}
                                            </button>
                                        </div>

                                        {k8sTestResult && (
                                            <div className={`p-4 rounded-xl text-xs font-bold animate-in zoom-in-95 duration-200 ${k8sTestResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                                <div className="flex gap-2">
                                                    <div className="mt-0.5">{k8sTestResult.success ? '✅' : '❌'}</div>
                                                    <p>{k8sTestResult.message}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormSection>

                                <FormSection 
                                    title="Deployment Defaults" 
                                    description="Global defaults for newly provisioned Kubernetes resources."
                                    badge="Presets"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Namespace Prefix" helper="Safe prefix for tenant isolation.">
                                            <input type="text" value={data.k8s_namespace_prefix} onChange={e => setData('k8s_namespace_prefix', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                        <InputGroup label="Command Timeout (Sec)" helper="Max wait for kubectl apply/delete.">
                                            <input type="number" value={data.kubectl_timeout} onChange={e => setData('kubectl_timeout', e.target.value)} className="w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </InputGroup>
                                    </div>
                                </FormSection>
                            </div>
                        )}
                        
                    </form>
                </div>
            </div>
        </PlatformLayout>
    );
}

