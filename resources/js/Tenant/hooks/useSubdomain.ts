import { useState, useEffect } from "react";

/**
 * Hook to detect the current tenant's subdomain from the hostname.
 * Handles:
 * - tenant.localhost (Dev)
 * - tenant.zosair.com (Prod)
 * - www.zosair.com (Central)
 */
export function useSubdomain() {
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const host = window.location.hostname;
        const parts = host.split('.');

        let sub = '';
        // Localhost: tenant.localhost
        if (host.endsWith('.localhost')) {
            sub = parts.length > 1 ? parts[0] : '';
        }
        // Production: tenant.zosair.com
        else if (parts.length > 2) {
            sub = parts[0];
        }

        if (sub && sub !== 'localhost' && sub !== 'www') {
            setSubdomain(sub);
        } else {
            setSubdomain(null);
        }

        setIsReady(true);
    }, []);

    return { subdomain, isReady };
}
