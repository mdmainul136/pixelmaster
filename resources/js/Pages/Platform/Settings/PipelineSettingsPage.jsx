import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { 
    Database, 
    RefreshCcw, 
    Zap, 
    ShieldCheck,
    AlertTriangle,
    Info
} from 'lucide-react';

export default function PipelineSettingsPage({ auth, settings }) {
    const { data, setData, post, processing, errors } = useForm({
        ingestion_mode: settings.ingestion_mode || 'direct',
        kafka_brokers: settings.kafka_brokers || 'localhost:9092',
        kafka_topic: settings.kafka_topic || 'tracking-events',
        kafka_client_id: settings.kafka_client_id || 'sgtm-sidecar-producer',
    });

    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('platform.settings.update'), {
            onSuccess: () => setStatus({ type: 'success', message: 'Pipeline configuration updated successfully.' }),
            onError: () => setStatus({ type: 'error', message: 'Failed to update pipeline configuration.' }),
        });
    };

    const testKafka = () => {
        post(route('platform.settings.test'), {
            data: { type: 'kafka', brokers: data.kafka_brokers },
            onSuccess: (resp) => setStatus({ type: 'success', message: 'Kafka configuration saved and marked for validation.' }),
        });
    };

    return (
        <PlatformLayout user={auth.user}>
            <Head title="Event Pipeline Settings" />

            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Event Ingestion Pipeline</h1>
                    <p className="text-gray-400">Configure how tracking events are ingested from the edge to your analytical storage.</p>
                </div>

                {status && (
                    <div className={`mb-6 p-4 rounded-xl border ${
                        status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    } flex items-center gap-3`}>
                        {status.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Strategy Selection */}
                    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <RefreshCcw className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Ingestion Strategy</h2>
                                    <p className="text-sm text-gray-400 mt-1">Choose between low-latency direct insertion or high-availability buffered streams.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setData('ingestion_mode', 'direct')}
                                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                                    data.ingestion_mode === 'direct' 
                                    ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                                    : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Zap className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    {data.ingestion_mode === 'direct' && (
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    )}
                                </div>
                                <h3 className="text-lg font-medium text-white">Direct Mode (Lite)</h3>
                                <p className="text-sm text-gray-400 mt-1">Sidecar pushes events directly to ClickHouse. Optimal for simple setups and low-to-medium scale.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setData('ingestion_mode', 'kafka')}
                                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                                    data.ingestion_mode === 'kafka' 
                                    ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                                    : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Database className="h-5 w-5 text-amber-400" />
                                    </div>
                                    {data.ingestion_mode === 'kafka' && (
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    )}
                                </div>
                                <h3 className="text-lg font-medium text-white">Kafka Stream (Enterprise)</h3>
                                <p className="text-sm text-gray-400 mt-1">Buffered ingestion via Apache Kafka. Fault-tolerant, highly scalable, and prevents data loss during DB downtime.</p>
                            </button>
                        </div>
                    </div>

                    {/* Kafka Configuration (Conditional) */}
                    {data.ingestion_mode === 'kafka' && (
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Database className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Kafka Broker Config</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={testKafka}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-sm font-medium border border-white/10"
                                >
                                    Verify Connectivity
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Bootstrap Brokers</label>
                                        <input
                                            type="text"
                                            value={data.kafka_brokers}
                                            onChange={e => setData('kafka_brokers', e.target.value)}
                                            placeholder="localhost:9092,host2:9092"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Comma-separated list of broker endpoints.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Destination Topic</label>
                                        <input
                                            type="text"
                                            value={data.kafka_topic}
                                            onChange={e => setData('kafka_topic', e.target.value)}
                                            placeholder="tracking-events"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-200/80">
                                        <p className="font-semibold text-amber-400 mb-1">Architecture requirements:</p>
                                        <ul className="list-disc list-inside space-y-1 opacity-80">
                                            <li>Ensure the Kafka theme is reachable from your Tracking Nodes.</li>
                                            <li>You must run the <code className="bg-black/40 px-1 rounded">php artisan tracking:kafka-consume</code> worker to drain the topic into ClickHouse.</li>
                                            <li>Enable "Auto-create topics" in Kafka or manually create <code className="bg-black/40 px-1 rounded">{data.kafka_topic}</code>.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl transition-all font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        >
                            {processing ? 'Saving Changes...' : 'Persist Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </PlatformLayout>
    );
}
