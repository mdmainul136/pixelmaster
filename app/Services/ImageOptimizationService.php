<?php

namespace App\Services;

use Intervention\Image\Facades\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizationService
{
    /**
     * Max width for product images.
     */
    protected const MAX_WIDTH = 1200;

    /**
     * Standard quality for WebP.
     */
    protected const QUALITY = 80;

    /**
     * Optimize an uploaded image and store it.
     *
     * @param UploadedFile $file
     * @param string $directory Directory inside the disk (e.g. 'product-gallery/1')
     * @param string $disk Disk name (default 'public')
     * @return array Metadata about the stored file
     */
    public function optimizeAndStore(UploadedFile $file, string $directory, string $disk = 'public'): array
    {
        // 1. Create unique filename with .webp extension
        $filename = Str::random(40) . '.webp';
        $path = $directory . '/' . $filename;

        // 2. Initialize Intervention Image
        $img = Image::make($file->getRealPath());

        // 3. Resize if too large (maintain aspect ratio)
        if ($img->width() > self::MAX_WIDTH) {
            $img->resize(self::MAX_WIDTH, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        // 4. Convert and get stream
        $content = $img->encode('webp', self::QUALITY)->stream();

        // 5. Save to disk
        Storage::disk($disk)->put($path, $content->__toString());

        return [
            'path'      => $path,
            'file_size' => strlen($content->__toString()),
            'width'     => $img->width(),
            'height'    => $img->height(),
            'mime_type' => 'image/webp',
        ];
    }

    /**
     * Re-optimize an existing file on disk and convert to WebP.
     */
    public function reoptimizeExisting(string $path, string $disk = 'public'): array
    {
        if (!Storage::disk($disk)->exists($path)) {
            throw new \Exception("File not found: {$path}");
        }

        $content = Storage::disk($disk)->get($path);
        $img = Image::make($content);

        if ($img->width() > self::MAX_WIDTH) {
            $img->resize(self::MAX_WIDTH, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }

        $optimized = $img->encode('webp', self::QUALITY)->stream();
        
        return [
            'content'   => $optimized->__toString(),
            'file_size' => strlen($optimized->__toString()),
            'width'     => $img->width(),
            'height'    => $img->height(),
            'mime_type' => 'image/webp',
        ];
    }

    /**
     * Clean up a path and return its base relative path.
     */
    public function getCleanPath(string $path): string
    {
        return str_replace(['\\', '//'], '/', $path);
    }
}
