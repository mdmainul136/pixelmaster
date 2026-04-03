import { usePage } from '@inertiajs/react';
import UpgradeBanner from './UpgradeBanner';

/**
 * FeatureGate
 *
 * Wraps any UI section that requires a specific plan feature.
 * Checks the globally shared `features` prop (injected by HandleInertiaRequests).
 *
 * Usage:
 *   <FeatureGate feature="logs" requiredPlan="Pro">
 *     <LogsPanel />
 *   </FeatureGate>
 *
 * Props:
 *   feature      — the feature key to check, e.g. 'cookie_keeper'
 *   requiredPlan — human-readable plan name for the upgrade message, e.g. 'Pro'
 *   children     — content to show when feature is unlocked
 *   fallback     — optional custom locked UI (overrides default UpgradeBanner)
 *   quiet        — if true, renders nothing instead of the upgrade banner
 *   showLock     — if true, renders children with a visual lock overlay (default: false)
 */
export default function FeatureGate({
    feature,
    requiredPlan = 'Pro',
    children,
    fallback = null,
    quiet = false,
    showLock = false,
}) {
    const { features = [], plan: serverPlan = 'free' } = usePage().props;

    // Load dev plan override
    const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const devPlan = isLocal ? localStorage.getItem('dev_plan_override') : null;
    const plan = devPlan || serverPlan;

    // Determine access
    const PLAN_RANK = { free: 0, pro: 1, business: 2, enterprise: 3, custom: 4 };
    const hasPlan = (PLAN_RANK[plan.toLowerCase()] ?? 0) >= (PLAN_RANK[requiredPlan.toLowerCase()] ?? 99);
    const hasFeature = features.includes(feature) || hasPlan;

    if (hasFeature) {
        return <>{children}</>;
    }

    // Quiet mode — render nothing when locked
    if (quiet) return null;

    // Lock overlay mode — show children behind a blur/lock overlay
    if (showLock) {
        return (
            <div className="feature-gate-lock-wrapper">
                <div className="feature-gate-blurred" aria-hidden="true">
                    {children}
                </div>
                <div className="feature-gate-lock-overlay">
                    <LockOverlay feature={feature} requiredPlan={requiredPlan} />
                </div>
            </div>
        );
    }

    // Custom fallback UI
    if (fallback) return <>{fallback}</>;

    // Default: full upgrade banner
    return (
        <UpgradeBanner
            feature={feature}
            requiredPlan={requiredPlan}
            currentPlan={plan}
        />
    );
}

/**
 * Lock Overlay — shown on top of blurred content in showLock mode.
 */
function LockOverlay({ feature, requiredPlan }) {
    return (
        <div className="feature-gate-lock-content">
            <div className="feature-gate-lock-icon">🔒</div>
            <p className="feature-gate-lock-label">
                Upgrade to <strong>{requiredPlan}</strong> to unlock this feature
            </p>
            <a
                href="/billing"
                className="feature-gate-lock-btn"
            >
                Upgrade Now
            </a>
        </div>
    );
}

/*
 * CSS — add to your global stylesheet or a FeatureGate.css file:
 *
 * .feature-gate-lock-wrapper  { position: relative; }
 * .feature-gate-blurred       { filter: blur(4px); pointer-events: none; user-select: none; }
 * .feature-gate-lock-overlay  {
 *     position: absolute; inset: 0; display: flex;
 *     align-items: center; justify-content: center;
 *     background: rgba(15,15,30,0.6); border-radius: 8px;
 * }
 * .feature-gate-lock-content  { text-align: center; color: #fff; }
 * .feature-gate-lock-icon     { font-size: 2rem; margin-bottom: 8px; }
 * .feature-gate-lock-label    { margin-bottom: 12px; font-size: 0.9rem; }
 * .feature-gate-lock-btn      {
 *     background: #6366f1; color: #fff; padding: 8px 20px;
 *     border-radius: 6px; text-decoration: none; font-size: 0.85rem;
 * }
 */
