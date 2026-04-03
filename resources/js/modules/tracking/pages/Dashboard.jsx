import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Tracking Dashboard — Main Component
// Tabs: Overview | Customers | Events | Platforms
// ─────────────────────────────────────────────────────────────────────────────

const API = '/api/tracking/dashboard';

const formatNumber = (n) => new Intl.NumberFormat().format(n ?? 0);
const formatCurrency = (v, currency = 'BDT') =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(v ?? 0);
const formatPercent = (v) => `${v ?? 0}%`;

const SEGMENT_COLORS = {
    vip: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    loyal: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    returning: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    new_customer: { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' },
    churned: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    prospect: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
};

const STATUS_COLORS = {
    processed: 'text-green-600',
    received: 'text-blue-600',
    deduped: 'text-yellow-600',
    failed: 'text-red-600',
};

// ─── Reusable Components ─────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = 'blue', icon }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            {icon && <span className={`text-2xl`}>{icon}</span>}
        </div>
        <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
);

const Badge = ({ segment }) => {
    const c = SEGMENT_COLORS[segment] || SEGMENT_COLORS.prospect;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {segment?.replace('_', ' ')}
        </span>
    );
};

const Spinner = () => (
    <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

// ─── TAB 1: Overview ─────────────────────────────────────────────────────────

const OverviewTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveEvents, setLiveEvents] = useState([]);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        fetch(`${API}/overview`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); });

        // SSE live events
        eventSourceRef.current = new EventSource(`${API}/events/live`);
        eventSourceRef.current.onmessage = (e) => {
            const event = JSON.parse(e.data);
            setLiveEvents(prev => [event, ...prev].slice(0, 30));
        };

        return () => eventSourceRef.current?.close();
    }, []);

    if (loading) return <Spinner />;

    const { containers, events_24h, top_events, hourly_sparkline } = data;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Active Containers" value={containers.active} sub={`${containers.total} total`} color="blue" icon="📦" />
                <StatCard label="Events (24h)" value={formatNumber(events_24h.total)} sub={`${events_24h.processed} processed`} color="green" icon="⚡" />
                <StatCard label="Error Rate" value={formatPercent(events_24h.error_rate)} sub={`${events_24h.failed} failed`} color={events_24h.error_rate > 5 ? 'red' : 'green'} icon="🎯" />
                <StatCard label="Revenue (24h)" value={formatCurrency(events_24h.total_value)} sub={`avg ${formatCurrency(events_24h.avg_value)}`} color="purple" icon="💰" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Events */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">🏆 Top Events (24h)</h3>
                    <div className="space-y-2">
                        {top_events?.map((ev, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="text-sm font-medium text-gray-700">{ev.event_name}</span>
                                <span className="text-sm font-bold text-blue-600">{formatNumber(ev.count)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Event Feed */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <h3 className="text-base font-semibold text-gray-800">Live Event Feed</h3>
                    </div>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {liveEvents.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-8">Waiting for events…</p>
                        )}
                        {liveEvents.map((ev) => (
                            <div key={ev.id} className="flex items-center gap-3 py-1.5 text-xs border-b border-gray-50 last:border-0">
                                <span className={`font-semibold ${STATUS_COLORS[ev.status] || 'text-gray-500'}`}>●</span>
                                <span className="font-semibold text-gray-700 w-28 truncate">{ev.event_name}</span>
                                <span className="text-gray-400">{ev.country || '—'}</span>
                                {ev.value && <span className="text-green-600 font-medium ml-auto">+{formatCurrency(ev.value)}</span>}
                                <span className="text-gray-300 ml-auto">{ev.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── TAB 2: Customers ────────────────────────────────────────────────────────

const CustomersTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/customers`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) return <Spinner />;

    const { segments, total_customers, repeat_customers, repeat_rate, cross_device, new_last_30_days, top_customers } = data;

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Customers" value={formatNumber(total_customers)} color="blue" icon="👥" />
                <StatCard label="Repeat Rate" value={formatPercent(repeat_rate)} sub={`${formatNumber(repeat_customers)} repeat buyers`} color="green" icon="🔁" />
                <StatCard label="New (30d)" value={formatNumber(new_last_30_days)} color="teal" icon="✨" />
                <StatCard label="Cross-device" value={formatNumber(cross_device)} sub="Mobile + Desktop" color="purple" icon="📱" />
            </div>

            {/* Segment Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Customer Segments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(segments || {}).map(([segment, stats]) => {
                        const c = SEGMENT_COLORS[segment] || SEGMENT_COLORS.prospect;
                        const pct = total_customers > 0 ? ((stats.count / total_customers) * 100).toFixed(1) : 0;
                        return (
                            <div key={segment} className={`rounded-xl p-4 ${c.bg}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge segment={segment} />
                                    <span className="text-xs text-gray-500">{pct}%</span>
                                </div>
                                <div className={`text-2xl font-bold ${c.text}`}>{formatNumber(stats.count)}</div>
                                <div className="text-xs text-gray-500 mt-1">Avg LTV: {formatCurrency(stats.avg_ltv)}</div>
                                <div className="mt-2 bg-white/50 rounded-full h-1.5">
                                    <div className={`${c.dot} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Customers by LTV */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-800 mb-4">💎 Top Customers by LTV</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-100">
                                <th className="text-left py-2">ID</th>
                                <th className="text-left py-2">Segment</th>
                                <th className="text-right py-2">Orders</th>
                                <th className="text-right py-2">Total LTV</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top_customers?.map((c, i) => (
                                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-2 font-mono text-gray-500 text-xs">#{c.id}</td>
                                    <td className="py-2"><Badge segment={c.customer_segment} /></td>
                                    <td className="py-2 text-right text-gray-700 font-medium">{c.order_count}</td>
                                    <td className="py-2 text-right font-bold text-green-600">{formatCurrency(c.total_spent)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── TAB 3: Events ───────────────────────────────────────────────────────────

const EventsTab = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ event_name: '', status: '', page: 1 });

    const load = () => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: 25, ...filters });
        fetch(`${API}/events/feed?${params}`)
            .then(r => r.json())
            .then(d => { setEvents(d); setLoading(false); });
    };

    useEffect(() => { load(); }, [filters.status, filters.page]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search event name…"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
                    value={filters.event_name}
                    onChange={e => setFilters(f => ({ ...f, event_name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && load()}
                />
                <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={filters.status}
                    onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
                    <option value="">All statuses</option>
                    <option value="processed">✅ Processed</option>
                    <option value="failed">❌ Failed</option>
                    <option value="deduped">⚠️ Deduped</option>
                    <option value="received">📥 Received</option>
                </select>
                <button onClick={load} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
                    Search
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? <Spinner /> : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-xs text-gray-500">
                                <th className="text-left px-4 py-3">Event</th>
                                <th className="text-left px-4 py-3">Country</th>
                                <th className="text-right px-4 py-3">Value</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events?.data?.map((ev) => (
                                <tr key={ev.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-gray-800">{ev.event_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{ev.country || '—'}</td>
                                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                                        {ev.value ? formatCurrency(ev.value, ev.currency) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold ${STATUS_COLORS[ev.status]}`}>
                                            ● {ev.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{ev.processed_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {/* Pagination */}
                {events?.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4">
                        {Array.from({ length: events.last_page }, (_, i) => i + 1).slice(0, 10).map(p => (
                            <button key={p}
                                className={`w-8 h-8 rounded-lg text-sm font-medium ${p === filters.page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                onClick={() => setFilters(f => ({ ...f, page: p }))}>
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── TAB 4: Platforms ────────────────────────────────────────────────────────

const PlatformsTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/platforms`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); });
    }, []);

    if (loading) return <Spinner />;

    const platformIcons = { facebook: '🔵', google: '🔴', tiktok: '⚫', snapchat: '💛', twitter: '🐦', ga4: '📊' };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.platforms?.map((p, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{platformIcons[p.type] || '📡'}</span>
                                <div>
                                    <div className="font-semibold text-gray-800 capitalize">{p.type}</div>
                                    <div className="text-xs text-gray-400">{p.container_name}</div>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'healthy' ? 'bg-green-100 text-green-700' :
                                    p.status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {p.status === 'healthy' ? '✅' : p.status === 'degraded' ? '⚠️' : '❌'} {p.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="font-bold text-gray-800">{p.success_rate ?? '—'}%</div>
                                <div className="text-gray-400">Success Rate</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="font-bold text-gray-800">{p.avg_latency_ms ?? '—'}ms</div>
                                <div className="text-gray-400">Avg Latency</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className={`font-bold ${p.error_count_24h > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {p.error_count_24h}
                                </div>
                                <div className="text-gray-400">Errors (24h)</div>
                            </div>
                        </div>
                        {p.last_error && (
                            <div className="mt-3 bg-red-50 rounded-lg p-2 text-xs text-red-600 font-mono truncate">
                                {p.last_error}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'customers', label: '👥 Customers' },
    { id: 'events', label: '⚡ Events' },
    { id: 'platforms', label: '📡 Platforms' },
];

export default function TrackingDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📊 Tracking Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Real-time sGTM event analytics & customer intelligence</p>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm w-fit mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'customers' && <CustomersTab />}
                    {activeTab === 'events' && <EventsTab />}
                    {activeTab === 'platforms' && <PlatformsTab />}
                </div>
            </div>
        </div>
    );
}
