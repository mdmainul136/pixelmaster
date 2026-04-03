<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class AssetCdnService
{
    /**
     * Upload and optimize image to Cloudflare R2 / S3
     */
    public function uploadImage($file, string $path): string
    {
        if (!$file) return '';

        // Optimization logic placeholder (requires Intervention/Image)
        // For now, storing directly
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $fullPath = "themes/{$path}/{$filename}";
        
        Storage::disk('cloudflare')->put($fullPath, file_get_contents($file));
        
        return Storage::disk('cloudflare')->url($fullPath);
    }
    
    /**
     * Purge CDN cache via Cloudflare API
     */
    public function purgeCdnCache(array $urls): void
    {
        // Placeholder for Cloudflare API call
        // Would use Guzzle to hit /zones/:id/purge_cache
    }
}
