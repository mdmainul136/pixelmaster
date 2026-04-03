<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class CompressApiResponse
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        if ($response instanceof Response && $this->shouldCompress($request, $response)) {
            $content = $response->getContent();
            $compressed = gzencode($content, 6);
            
            $response->setContent($compressed);
            $response->headers->set('Content-Encoding', 'gzip');
            $response->headers->set('Content-Length', strlen($compressed));
        }
        
        return $response;
    }
    
    private function shouldCompress($request, $response): bool
    {
        if (!str_contains($request->header('Accept-Encoding', ''), 'gzip')) {
            return false;
        }
        
        // Only compress JSON or large text responses
        $contentType = $response->headers->get('Content-Type');
        if (!str_contains($contentType, 'application/json') && !str_contains($contentType, 'text/html')) {
            return false;
        }
        
        return strlen($response->getContent()) > 2048; // > 2KB
    }
}
