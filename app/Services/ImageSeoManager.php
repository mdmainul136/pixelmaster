<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ImageSeoManager
{
    /**
     * Rename and move a media file to a semantic SEO path.
     * Path pattern: products/{category}/{color}/{seo-filename}.webp
     */
    public function semantizeMedia(Media $media, array $context, bool $reoptimize = true): Media
    {
        if (!$media->is_image || $media->disk === 'external') {
            return $media;
        }

        $directory = $context['folder_path'] ?? 'products/general/default';
        $seoName   = Str::slug($context['filename'] ?? $media->title);

        if (!$seoName) {
            $seoName = Str::slug(pathinfo($media->original_name, PATHINFO_FILENAME));
        }

        // We force .webp for Google performance
        $newFilename = "{$seoName}.webp";
        $newPath = "{$directory}/{$newFilename}";

        // Ensure unique
        $newPath = $this->getUniquePath($newPath, $media->disk);
        $newFilename = basename($newPath);

        // Physical move + Optimize
        if (Storage::disk($media->disk)->exists($media->path)) {
            try {
                // Ensure directory exists
                Storage::disk($media->disk)->makeDirectory($directory);
                
                if ($reoptimize) {
                    $optimized = app(\App\Services\ImageOptimizationService::class)->reoptimizeExisting($media->path, $media->disk);
                    Storage::disk($media->disk)->put($newPath, $optimized['content']);
                    
                    // If path changed or we successfully optimized to same path, we update. 
                    // (Actually if same path, we just overwrite, if different we delete old)
                    if ($media->path !== $newPath) {
                        Storage::disk($media->disk)->delete($media->path);
                    }

                    $media->update([
                        'path' => $newPath,
                        'file_name' => $newFilename,
                        'url' => config('app.url') . "/api/ecommerce/assets/{$newPath}",
                        'folder' => $directory,
                        'mime_type' => 'image/webp',
                        'size' => $optimized['file_size'],
                        'width' => $optimized['width'],
                        'height' => $optimized['height']
                    ]);
                } else {
                    Storage::disk($media->disk)->move($media->path, $newPath);
                    $media->update([
                        'path' => $newPath,
                        'file_name' => $newFilename,
                        'url' => config('app.url') . "/api/ecommerce/assets/{$newPath}",
                        'folder' => $directory
                    ]);
                }
            } catch (\Exception $e) {
                Log::error("Failed to semantize media {$media->id}: " . $e->getMessage());
            }
        }

        return $media;
    }

    private function getUniquePath(string $path, string $disk = 'public'): string
    {
        if (!Storage::disk($disk)->exists($path)) {
            return $path;
        }

        $info = pathinfo($path);
        $dir = $info['dirname'];
        $base = $info['filename'];
        $ext = $info['extension'];

        $counter = 1;
        while (Storage::disk($disk)->exists("{$dir}/{$base}-{$counter}.{$ext}")) {
            $counter++;
        }

        return "{$dir}/{$base}-{$counter}.{$ext}";
    }
}
