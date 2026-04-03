import { usePage } from '@inertiajs/react';

/**
 * Plan tier order for display — cheapest to most expensive.
 */
const PLAN_HIERARCHY = ['free', 'pro', 'business', 'enterprise', 'custom'];

const PLAN_COLORS = {
    free:       { bg: '#1e293b', badge: '#475569', text: '#94a3b8' },
    pro:        { bg: '#1e1b4b', badge: '#6366f1', text: '#a5b4fc' },
    business:   { bg: '#1e3a1e', badge: '#16a34a', text: '#86efac' },
    enterprise: { bg: '#3b1a1a', badge: '#dc2626', text: '#fca5a5' },
    custom:     { bg: '#1a1a2e', badge: '#9333ea', text: '#d8b4fe' },
};

/**
 * UpgradeBanner
 *
 * Shown when a feature is locked on the current plan.
 * Displays the required plan and a CTA to upgrade.
 *
 * Props:
 *   feature      — feature key, e.g. 'monitoring'
 *   requiredPlan — human-readable plan name, e.g. 'Business'
 *   currentPlan  — current tenant plan key, e.g. 'pro'
 *   compact      — if true, shows a smaller inline badge instead of full card
 */
export default function UpgradeBanner({
    feature,
    requiredPlan = 'Pro',
    currentPlan,
    compact = false,
}) {
    const { plan: sharedPlan = 'free' } = usePage().props;
    const activePlan = currentPlan ?? sharedPlan;

    const colors = PLAN_COLORS[requiredPlan?.toLowerCase()] ?? PLAN_COLORS.pro;

    if (compact) {
        return (
            <span
                className="upgrade-badge-compact"
                title={`Requires ${requiredPlan} plan`}
                style={{
                    background: colors.badge,
                    color: '#fff',
                    fontSize: '0.65rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    verticalAlign: 'middle',
                    marginLeft: '6px',
                }}
            >
                {requiredPlan}
            </span>
        );
    }

    return (
        <div
            className="upgrade-banner"
            style={{
                background: colors.bg,
                border: `1px solid ${colors.badge}33`,
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                width: '100%',
            }}
        >
            {/* Lock icon */}
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔒</div>

            {/* Plan badge */}
            <span
                style={{
                    background: colors.badge,
                    color: '#fff',
                    padding: '3px 12px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                }}
            >
                {requiredPlan} Plan
            </span>

            {/* Message */}
            <div>
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#f1f5f9',
                    }}
                >
                    This feature requires the{' '}
                    <span style={{ color: colors.text }}>{requiredPlan}</span> plan
                </p>
                <p
                    style={{
                        margin: '4px 0 0',
                        fontSize: '0.82rem',
                        color: '#64748b',
                    }}
                >
                    You are currently on the{' '}
                    <strong style={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                        {activePlan}
                    </strong>{' '}
                    plan.
                </p>
            </div>

            {/* CTA */}
            <a
                href="/billing"
                style={{
                    background: colors.badge,
                    color: '#fff',
                    padding: '9px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.87rem',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginTop: '4px',
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
                Upgrade to {requiredPlan} →
            </a>
        </div>
    );
}
