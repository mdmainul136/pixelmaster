/**
 * Cloudflare Worker — sGTM Edge Router (Phase 4.3)
 *
 * Routes tenant custom domains to their per-tenant sGTM cluster services
 * at the CDN edge — zero DNS lookup latency, global POP coverage.
 *
 * Route mapping:
 *   track.tenant.com         → sgtm-tenantid.cluster.internal:8080  (engine)
 *   track.tenant.com/cdn/*   → sgtm-tenantid.cluster.internal:8081  (sidecar)
 *   track.tenant.com/debug/* → sgtm-tenantid.cluster.internal:8081  (sidecar)
 *
 * Cloudflare Worker Setup:
 *   1. wrangler publish
 *   2. Add route: track.*.yourplatform.com/* → this worker
 *   3. KV namespace: SGTM_ROUTES  (tenant domain → cluster target mapping)
 *
 * KV Entry format:
 *   Key:   "track.tenant.com"
 *   Value: JSON { "engine": "https://...", "sidecar": "https://..." }
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const host = url.hostname;

        // ── 1. Look up tenant routing from KV store ──────────────────────────────
        const routeJson = await env.SGTM_ROUTES.get(host);

        if (!routeJson) {
            return new Response(
                JSON.stringify({ error: 'Tracking domain not configured', host }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const route = JSON.parse(routeJson);

        // ── 2. Route decision: Sidecar vs sGTM Engine ────────────────────────────
        const SIDECAR_PATHS = /^\/(cdn|assets|lib|static|res|pkg|debug|__debug|healthz)/;
        const isSidecar = SIDECAR_PATHS.test(url.pathname);

        const upstream = isSidecar ? route.sidecar : route.engine;

        if (!upstream) {
            return new Response(
                JSON.stringify({ error: 'Upstream not configured', type: isSidecar ? 'sidecar' : 'engine' }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // ── 3. Build upstream request ─────────────────────────────────────────────
        const targetUrl = upstream + url.pathname + url.search;

        const upstreamRequest = new Request(targetUrl, {
            method: request.method,
            headers: new Headers({
                ...Object.fromEntries(request.headers),
                'X-Forwarded-Host': host,
                'X-Forwarded-For': request.headers.get('CF-Connecting-IP') ?? '',
                'X-Real-IP': request.headers.get('CF-Connecting-IP') ?? '',
                'X-CF-Country': request.headers.get('CF-IPCountry') ?? '',
                'X-CF-Region': request.headers.get('CF-Region') ?? '',
                'X-Request-ID': crypto.randomUUID(),
            }),
            body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        });

        // ── 4. Forward and return response ───────────────────────────────────────
        try {
            const response = await fetch(upstreamRequest);

            // Add Edge metadata headers for debugging
            const newHeaders = new Headers(response.headers);
            newHeaders.set('X-Edge-Route', isSidecar ? 'sidecar' : 'engine');
            newHeaders.set('X-Edge-Colo', request.cf?.colo ?? 'unknown');
            newHeaders.set('X-Edge-Country', request.cf?.country ?? 'unknown');

            // Cache loader scripts at edge (30min)
            if (isSidecar && request.method === 'GET') {
                newHeaders.set('Cache-Control', 'public, max-age=1800');
                ctx.waitUntil(cache.put(request, response.clone()));
            }

            return new Response(response.body, {
                status: response.status,
                headers: newHeaders,
            });

        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'Upstream unreachable', upstream, message: err.message }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            );
        }
    },
};
