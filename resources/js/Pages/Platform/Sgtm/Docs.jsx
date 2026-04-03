import React from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';

const DocSection = ({ title, icon, color, children }) => (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 mb-8 shadow-sm hover:shadow-xl transition-all duration-500 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`} style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
                <div className="h-1 w-12 bg-slate-100 mt-1 rounded-full"></div>
            </div>
        </div>
        <div className="prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-strong:text-slate-900">
            {children}
        </div>
    </div>
);

const SubSection = ({ title, children }) => (
    <div className="mb-8 last:mb-0 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <h3 className="text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">{title}</h3>
        <div className="text-slate-600 leading-relaxed font-medium text-sm">
            {children}
        </div>
    </div>
);

const CodeBlock = ({ code }) => (
    <div className="relative group">
        <pre className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 mt-2 text-[12px] font-mono overflow-x-auto shadow-2xl">
            {code}
        </pre>
        <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Source: AWS SDK v3
        </div>
    </div>
);

const Docs = () => {
    return (
        <>
            <Head title="Infrastructure Architecture & Ops Manual" />

            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Infrastructure & Ops</h1>
                    <p className="text-slate-500 mt-2 font-medium max-w-xl text-sm italic">
                        The ultimate guide to server-side GTM orchestration. Managed Docker Pools, Autonomous Scaling, and Enterprise Kubernetes pods.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        Operational Safe
                    </div>
                </div>
            </div>

            <div className="max-w-5xl">
                <DocSection 
                    title="Phase 1: Regional Docker Pooling (VPS)" 
                    color="#6366f1"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
                >
                    <SubSection title="Core Scaling Strategy">
                        <p>Our architecture utilizes a <strong>Managed VPS Pool</strong> approach. Instead of scaling single containers vertically, we distribute tenants across a cluster of nodes. The orchestrator resolves the <code>least_loaded_node</code> within the tenant's chosen region (Global vs EU).</p>
                    </SubSection>
                    
                    <SubSection title="sGTM Environment Matrix">
                        <table className="min-w-full text-xs text-left border-collapse mt-4">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="pb-3 pt-0 text-slate-900 font-black uppercase">Variable</th>
                                    <th className="pb-3 pt-0 text-slate-900 font-black uppercase">Tagging Node</th>
                                    <th className="pb-3 pt-0 text-slate-900 font-black uppercase">Preview Node (Max 1)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3 font-mono text-indigo-600">CONTAINER_CONFIG</td>
                                    <td className="py-3">Required</td>
                                    <td className="py-3">Required</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-indigo-600">PREVIEW_SERVER_URL</td>
                                    <td className="py-3">Required (Points to Preview IP)</td>
                                    <td className="py-3"><strong>DO NOT SET</strong></td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-indigo-600">RUN_AS_PREVIEW_SERVER</td>
                                    <td className="py-3">False</td>
                                    <td className="py-3">True</td>
                                </tr>
                            </tbody>
                        </table>
                    </SubSection>
                </DocSection>

                <DocSection 
                    title="Phase 2: Autonomous Scaling Engine" 
                    color="#10b981"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                >
                    <SubSection title="The 85% Trigger Strategy">
                        <p>The <code>ScaleUpRegionJob</code> is triggered when the aggregate capacity utilization of a region exceeds 85%. This ensures we always have a 15% buffer for sudden traffic spikes before a new node joins the cluster.</p>
                    </SubSection>

                    <SubSection title="AWS SDK Integration (PHP)">
                        <p>To enable direct AWS scaling, configure your sGTM Scaling Webhook to point to your internal AWS bridge or use the SDK directly:</p>
                        <CodeBlock code={`// Example: Dispatching AWS ASG Update
use Aws\\AutoScaling\\AutoScalingClient;

$client = new AutoScalingClient([
    'region' => $node->region,
    'version' => 'latest'
]);

$client->updateAutoScalingGroup([
    'AutoScalingGroupName' => 'sGTM-Node-Pool-' . $region,
    'DesiredCapacity' => $currentCapacity + 1,
]);`} />
                    </SubSection>
                </DocSection>

                <DocSection 
                    title="Phase 3: Hybrid Kubernetes (Enterprise)" 
                    color="#0ea5e9"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                >
                    <SubSection title="EPS-Based Scaling (Recommended)">
                        <p>For Kubernetes (EKS), we recommend scaling using <strong>Custom Metrics</strong> (CloudWatch Metrics Adapter) specifically targeting <strong>Events Per Second (EPS)</strong>. Scaling by CPU/RAM alone is often too late for sGTM spikes.</p>
                        <div className="mt-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-sky-800 italic text-[11px]">
                            Target Threshold: <strong>500 EPS per Pod</strong>. When global EPS / Pods &gt; 500, HPA will scale out immediately.
                        </div>
                    </SubSection>
                    
                    <SubSection title="Resource Pinning Best Practices">
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>CPU:</strong> 1 vCPU (Requests) / 2 vCPU (Limits).</li>
                            <li><strong>Memory:</strong> 1GB RAM (Requests) / 3GB RAM (Limits).</li>
                            <li><strong>Isolation:</strong> Use Namespaces or dedicated Node Groups for sGTM to avoid Taint contamination.</li>
                        </ul>
                    </SubSection>
                </DocSection>

                <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between shadow-2xl overflow-hidden relative">
                    <div className="relative z-10">
                        <h4 className="text-xl font-black tracking-tight mb-2 uppercase italic">Status: System Operational</h4>
                        <p className="text-slate-400 text-sm max-w-md font-medium">
                            The sGTM orchestrator is currently operating in Phase 2a (Webhook Scaling). To enable Phase 2b (AWS Direct SDK), update your <code>TRACKING_ORCHESTRATOR_MODE</code> to <code>direct_sdk</code> in the platform settings.
                        </p>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 animate-ping opacity-20 absolute"></div>
                        <div className="h-12 w-12 rounded-full border-2 border-indigo-500 flex items-center justify-center relative bg-slate-900 shadow-lg shadow-indigo-500/50">
                            <div className="h-4 w-4 rounded-full bg-white animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

Docs.layout = (page) => <PlatformLayout children={page} />;
export default Docs;
