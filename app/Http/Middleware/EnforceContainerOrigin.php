<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tracking\TrackingContainer;
use App\Modules\Tracking\Services\SgtmContainerService;
use Illuminate\Support\Facades\Log;

/**
 * Enforce Container Origin (CORS & Theft Protection)
 *
 * Ensures that if a GTM script or event payload is sent from a browser (has Origin or Referer),
 * that origin MUST exactly match the container's configured domain or extra_domains.
 * Drops the request immediately with a 403 Forbidden if someone stole snippet `GTM-XXXX`.
 */
class EnforceContainerOrigin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin') ?? $request->headers->get('Referer');
        
        // If it's a pure Backend/Server-to-Server API call (WP Plugin, Node Server) 
        // lacking Origin headers, allow it. It's authenticated via Bearer token anyway.
        if (!$origin) {
            return $next($request);
        }

        // Clean and extract root host from origin string
        $parsed = parse_url($origin);
        $host = $parsed['host'] ?? null;
        if (!$host) {
            return $next($request);
        }
        
        // Standardize: lowecase and strip 'www.' for strict comparisons
        $host = strtolower(preg_replace('/^www\./', '', $host));

        // Try to identify which container is being hit
        $container = null;
        
        // Scenario 1: WordPress/Shopify Plugin API sends events via fetch() with a token
        $apiKey = $request->bearerToken() ?? $request->header('X-PM-Api-Key');
        if ($apiKey) {
            $container = TrackingContainer::where('api_secret', $apiKey)->where('is_active', true)->first();
        } 
        
        // Scenario 2: Browser loads gtm.js script (GET /tracking/gtm.js?id=GTM-XXXX)
        if (!$container && $request->query('id')) {
            $gtmId = $request->query('id');
            // Assuming the container_id column holds 'GTM-...' or 'G-...'. 
            // In SaaS architecture, measurement IDs map back to a specific container.
            $container = TrackingContainer::where('container_id', $gtmId)->orWhere('properties->measurement_id', $gtmId)->where('is_active', true)->first();
        }

        // Scenario 3: Global/Subdomain resolution (Stancl Tenancy fallback)
        if (!$container) {
            try {
                $containerService = app(SgtmContainerService::class);
                $container = $containerService->getPrimaryContainer();
            } catch (\Exception $e) {
                // Not in a tenant context, that's fine.
            }
        }

        // If we found the specific container being targeted: Compare Origins
        if ($container) {
            // Build whitelist
            $whitelist = array_map(function($d) { 
                return strtolower(preg_replace('/^www\./', '', $d)); 
            }, $container->extra_domains ?? []);
            
            if ($container->domain) {
                $whitelist[] = strtolower(preg_replace('/^www\./', '', $container->domain));
            }

            // Exclude localhost/127.0.0.1 for local testing, or check whitelist
            if (!in_array($host, ['localhost', '127.0.0.1']) && !in_array($host, $whitelist)) {
                
                // Threat Detected! User copied script to unauthorized domain.
                Log::warning("🚨 Unauthorized Snippet Hijack Attempt Prevented", [
                    'hacker_origin'  => $host,
                    'container_name' => $container->name,
                    'container_id'   => $container->container_id,
                    'allowed_list'   => $whitelist
                ]);

                // Return generic JS comment so it doesn't break the browser, but denies payload.
                return response('console.error("PixelMaster Security: Access Denied. Snippet domain mismatch.");', 403)
                        ->header('Content-Type', 'application/javascript');
            }
        }

        return $next($request);
    }
}
