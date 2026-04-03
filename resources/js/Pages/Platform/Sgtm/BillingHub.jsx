import React, { useState, useEffect } from 'react';
import PlatformLayout from '@/Layouts/PlatformLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  BarChart3, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  History,
  Info
} from 'lucide-react';

const PlanCard = ({ plan, currentPlan, currency, onSelect }) => {
    const isCurrent = currentPlan?.plan_key === plan.plan_key;
    const price = plan.prices_ppp[currency] || plan.price_monthly;
    
    return (
        <div className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden flex flex-col h-full ${
            isCurrent ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
        }`}>
            {isCurrent && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
                    Current Plan
                </div>
            )}
            
            <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {currency === 'BDT' ? '৳' : currency === 'SAR' ? 'SR' : currency === 'AED' ? 'DH' : '$'}
                        {price}
                    </span>
                    <span className="text-xs font-bold text-slate-400 capitalize">/mo</span>
                </div>
                {currency !== 'USD' && (
                    <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                        <TrendingUp size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">PPP Applied</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                        <div className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Check size={10} strokeWidth={4} />
                        </div>
                        {feature}
                    </div>
                ))}
            </div>

            <button 
                onClick={() => onSelect(plan)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isCurrent 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl shadow-slate-200'
                }`}
            >
                {isCurrent ? 'Current Plan' : plan.price_monthly === 0 ? 'Downgrade to Free' : 'Choose Plan'}
            </button>
        </div>
    );
};

const BillingHub = ({ auth }) => {
    const [plans, setPlans] = useState([]);
    const [currentSub, setCurrentSub] = useState(null);
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(true);

    const currencies = [
        { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
        { code: 'SAR', label: 'Saudi Riyal', flag: '🇸🇦' },
        { code: 'AED', label: 'UAE Dirham', flag: '🇦🇪' },
        { code: 'BDT', label: 'Bangladeshi Taka', flag: '🇧🇩' },
    ];

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        setLoading(true);
        try {
            // Simulated multi-tier plan data based on SubscriptionPlanSeeder
            const mockPlans = [
                { id: 1, name: 'Free', plan_key: 'free', price_monthly: 0, description: 'Basic tracking for small stores.', features: ['10k Events/mo', 'Basic AI', 'Email Support'], prices_ppp: { USD: 0, SAR: 0, AED: 0, BDT: 0 } },
                { id: 2, name: 'Basic', plan_key: 'basic', price_monthly: 10, description: 'Perfect for established small businesses.', features: ['100k Events/mo', 'Full AI Advisor', 'Client Dashboard'], prices_ppp: { USD: 10, SAR: 30, AED: 30, BDT: 250 } },
                { id: 3, name: 'Pro', plan_key: 'pro', price_monthly: 20, description: 'The choice for high-performance pros.', features: ['500k Events/mo', 'MTA Attribution', 'Priority Support', 'Custom Domains'], prices_ppp: { USD: 20, SAR: 60, AED: 60, BDT: 500 } },
                { id: 4, name: 'Business', plan_key: 'business', price_monthly: 50, description: 'Scale with dedicated infrastructure.', features: ['2.5M Events/mo', 'Dedicated Cache', 'Success Manager'], prices_ppp: { USD: 50, SAR: 150, AED: 150, BDT: 1200 } },
                { id: 5, name: 'Enterprise', plan_key: 'enterprise', price_monthly: 100, description: 'Maximum power for global leaders.', features: ['10M Events/mo', 'K8s Auto-scaling', 'White-label Reports'], prices_ppp: { USD: 100, SAR: 300, AED: 300, BDT: 2500 } },
            ];
            
            setPlans(mockPlans);
            
            // Mocking current subscription as the 7-day Pro Trial
            setCurrentSub({
                plan_key: 'pro',
                status: 'trialing',
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                events_used: 4250,
                events_limit: 500000
            });
        } catch (error) {
            console.error('Failed to fetch plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        alert(`Initializing checkout for ${plan.name} at ${currency} ${plan.prices_ppp[currency]}...`);
    };

    const usagePercent = currentSub ? (currentSub.events_used / currentSub.events_limit) * 100 : 0;

    return (
        <PlatformLayout>
            <Head title="Billing & Subscriptions — PixelMaster" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl text-white">
                            <CreditCard size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Monetization</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        Globally accessible via <span className="text-slate-900 font-bold underline decoration-indigo-300 decoration-2">Purchasing Power Parity (PPP)</span> pricing.
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    {currencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => setCurrency(c.code)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                currency === c.code 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {c.flag} {c.code}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trial Warning */}
            {currentSub?.status === 'trialing' && (
                <div className="mb-10 p-6 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] flex items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-400 p-3 rounded-2xl text-white">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Active Pro Trial</h4>
                            <p className="text-[11px] text-amber-700 font-medium">Your free trial ends on <span className="font-bold underline">{new Date(currentSub.trial_ends_at).toLocaleDateString()}</span>. If no plan is selected, you'll be moved to the Free Tier.</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-amber-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-900/20">
                        Secure Pro Plan
                    </button>
                </div>
            )}

            {/* Usage Progress */}
            {currentSub && (
                <div className="mb-10 p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-10">
                    <div className="shrink-0 relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * usagePercent) / 100} className="text-indigo-600 transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-900">
                            {Math.round(usagePercent)}%
                        </div>
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Monthly Event Quota</h4>
                            <span className="text-[10px] font-bold text-slate-400 capitalize">Real-time Data Stream</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{currentSub.events_used.toLocaleString()}</span>
                            <span className="text-xs font-bold text-slate-400">/ {currentSub.events_limit.toLocaleString()} events used</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium mt-2 max-w-lg leading-relaxed uppercase tracking-tighter">
                            Once your quota hits 100%, data ingestion will temporarily pause on the server proxy until the next billing cycle.
                        </p>
                    </div>
                </div>
            )}

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {plans.map((plan) => (
                    <PlanCard 
                        key={plan.id} 
                        plan={plan} 
                        currentPlan={currentSub} 
                        currency={currency}
                        onSelect={handleSelectPlan}
                    />
                ))}
            </div>

            {/* Billing FAQ / History Area */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-tight mb-6">
                        <History size={16} className="text-indigo-600" /> Payment & History
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center opacity-70">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
                            <CreditCard size={24} />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">No past invoices</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Your historical billing data will appear here once you make your first payment.</p>
                    </div>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-tight mb-6">
                        <Shield size={16} className="text-indigo-600" /> Secure Billing
                    </h3>
                    <div className="space-y-6">
                        {[
                            { title: 'Encrypted Payments', icon: Lock, text: 'All transaction data is encrypted via 256-bit SSL directly with Stripe.' },
                            { title: 'Global Currency Support', icon: Globe, text: 'Pay in USD, SAR, AED, or BDT via local payment methods.' },
                            { title: 'Flexible Cancellations', icon: Zap, text: 'Cancel anytime. Your Pro features stay active until the period ends.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 h-fit">
                                    <Info size={14} />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
};

export default BillingHub;
