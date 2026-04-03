<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\ImageOptimizationService;
use App\Modules\SeoManager\Services\AiSeoService;
use App\Services\ImageSeoManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class MediaController extends Controller
{
    protected ImageOptimizationService $optimizer;
    protected AiSeoService $aiSeo;
    protected ImageSeoManager $seoManager;

    public function __construct(
        ImageOptimizationService $optimizer,
        AiSeoService $aiSeo,
        ImageSeoManager $seoManager
    ) {
        $this->optimizer = $optimizer;
        $this->aiSeo = $aiSeo;
        $this->seoManager = $seoManager;
    }

    /**
     * GET /api/media
     * List media with pagination, search, filters
     *
     * Query params:
     *   search   — filter by filename, title, alt text
     *   type     — image, video, document, other
     *   folder   — folder path
     *   sort     — newest (default), oldest, name, size
     *   per_page — items per page (default 40)
     */
    public function index(Request $request)
    {
        $query = Media::query();

        // Search
        if ($search = $request->query('search')) {
            $query->search($search);
        }

        // Filter by type
        if ($type = $request->query('type')) {
            $query->ofType($type);
        }

        // Filter by folder
        if ($folder = $request->query('folder')) {
            $query->inFolder($folder);
        }

        // Filter by mime type (e.g. "image/webp")
        if ($mime = $request->query('mime_type')) {
            $query->where('mime_type', $mime);
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'name'   => $query->orderBy('original_name', 'asc'),
            'size'   => $query->orderBy('size', 'desc'),
            default  => $query->orderBy('created_at', 'desc'),
        };

        $perPage = min((int) $request->query('per_page', 40), 100);

        $media = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $media->items(),
            'meta'    => [
                'total'       => $media->total(),
                'per_page'    => $media->perPage(),
                'current_page'=> $media->currentPage(),
                'last_page'   => $media->lastPage(),
            ],
            'folders' => Media::getFolders(),
        ]);
    }

    /**
     * GET /api/media/{id}
     * Get single media item details
     */
    public function show($id)
    {
        $media = Media::findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $media,
        ]);
    }

    /**
     * POST /api/media/upload
     * Upload one or more files to the media library
     *
     * Body (multipart/form-data):
     *   files[]  — one or more files
     *   folder   — optional folder to organize into (default: "/")
     *   alt_text — optional alt text
     *   tags     — optional JSON array of tags
     */
    public function store(Request $request)
    {
        $request->validate([
            'files'    => 'required|array|min:1|max:20',
            'files.*'  => 'required|file|max:10240', // 10MB per file
            'folder'   => 'nullable|string|max:100',
            'alt_text' => 'nullable|string|max:255',
            'tags'     => 'nullable|json',
        ]);

        $folder  = $request->input('folder', '/');
        $altText = $request->input('alt_text');
        $tags    = $request->input('tags') ? json_decode($request->input('tags'), true) : null;
        $userId  = $request->user()?->id;

        $created = [];

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $mimeType     = $file->getMimeType();
            $fileType     = Media::resolveType($mimeType);

            // If it's an image, optimize and convert to WebP
            if (str_starts_with($mimeType, 'image/')) {
                $optimized = $this->optimizer->optimizeAndStore($file, "media/{$folder}");
                $path     = $optimized['path'];
                $url      = config('app.url') . "/api/ecommerce/assets/{$path}";
                $fileSize = $optimized['file_size'];
                $width    = $optimized['width'];
                $height   = $optimized['height'];
                $fileName = basename($path);
                $finalMime = 'image/webp';
            } else {
                // For non-image files, store directly
                $fileName = Str::random(40) . '.' . $file->getClientOriginalExtension();
                $path     = $file->storeAs("media/{$folder}", $fileName, 'public');
                $url      = config('app.url') . "/api/ecommerce/assets/{$path}";
                $fileSize = $file->getSize();
                $width    = null;
                $height   = null;
                $finalMime = $mimeType;
            }

            $media = Media::create([
                'file_name'     => $fileName,
                'original_name' => $originalName,
                'mime_type'     => $finalMime,
                'disk'          => 'public',
                'path'          => $path,
                'url'           => $url,
                'size'          => $fileSize,
                'width'         => $width,
                'height'        => $height,
                'alt_text'      => $altText,
                'title'         => pathinfo($originalName, PATHINFO_FILENAME),
                'folder'        => $folder,
                'tags'          => $tags,
                'type'          => $fileType,
                'uploaded_by'   => $userId,
            ]);

            $created[] = $media;
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' file(s) uploaded',
            'data'    => $created,
        ], 201);
    }

    /**
     * POST /api/media/upload-url
     * Add a file from a remote URL (no file upload needed)
     */
    public function storeFromUrl(Request $request)
    {
        $request->validate([
            'url'      => 'required|url|max:500',
            'folder'   => 'nullable|string|max:100',
            'alt_text' => 'nullable|string|max:255',
            'tags'     => 'nullable|json',
        ]);

        $url      = $request->input('url');
        $folder   = $request->input('folder', '/');
        $tags     = $request->input('tags') ? json_decode($request->input('tags'), true) : null;
        $userId   = $request->user()?->id;

        // Infer file info from URL
        $parsedPath = parse_url($url, PHP_URL_PATH);
        $originalName = $parsedPath ? basename($parsedPath) : 'external-file';
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);

        // Guess type
        $mimeMap = [
            'jpg'  => 'image/jpeg',  'jpeg' => 'image/jpeg',
            'png'  => 'image/png',   'gif'  => 'image/gif',
            'webp' => 'image/webp',  'svg'  => 'image/svg+xml',
            'mp4'  => 'video/mp4',   'pdf'  => 'application/pdf',
        ];
        $mimeType = $mimeMap[strtolower($extension)] ?? 'image/jpeg';
        $fileType = Media::resolveType($mimeType);

        $media = Media::create([
            'file_name'     => $originalName,
            'original_name' => $originalName,
            'mime_type'     => $mimeType,
            'disk'          => 'external',
            'path'          => null,
            'url'           => $url,
            'size'          => 0,
            'alt_text'      => $request->input('alt_text'),
            'title'         => pathinfo($originalName, PATHINFO_FILENAME),
            'folder'        => $folder,
            'tags'          => $tags,
            'type'          => $fileType,
            'uploaded_by'   => $userId,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $media,
        ], 201);
    }

    /**
     * PUT /api/media/{id}
     * Update media metadata (alt text, title, tags, folder)
     */
    public function update(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'title'    => 'nullable|string|max:255',
            'tags'     => 'nullable|array',
            'folder'   => 'nullable|string|max:100',
        ]);

        $media->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $media->fresh(),
        ]);
    }

    /**
     * DELETE /api/media/{id}
     * Soft-delete a media item (file stays on disk for recovery)
     */
    public function destroy($id)
    {
        $media = Media::findOrFail($id);
        $media->delete(); // Soft delete

        return response()->json([
            'success' => true,
            'message' => 'File moved to trash',
        ]);
    }

    /**
     * DELETE /api/media/{id}/permanent
     * Permanently delete a media item and its file from storage
     */
    public function permanentDestroy($id)
    {
        $media = Media::withTrashed()->findOrFail($id);

        // Delete from storage
        if ($media->disk !== 'external' && $media->path) {
            Storage::disk($media->disk)->delete($media->path);
        }

        $media->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'File permanently deleted',
        ]);
    }

    /**
     * POST /api/media/bulk-delete
     * Soft-delete multiple media items
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:tenant_media,id',
        ]);

        $count = Media::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} file(s) moved to trash",
        ]);
    }

    /**
     * GET /api/media/stats
     * Get media library statistics
     */
    public function stats()
    {
        $totalFiles  = Media::count();
        $totalImages = Media::images()->count();
        $totalSize   = Media::sum('size');
        $folders     = Media::getFolders();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_files'  => $totalFiles,
                'total_images' => $totalImages,
                'total_size'   => $totalSize,
                'total_size_human' => $this->humanSize($totalSize),
                'folders'      => $folders,
                'folder_count' => count($folders),
            ],
        ]);
    }

    /**
     * POST /api/media/bulk-optimize-seo
     * Rebuild selected media items with Google-first SEO (rename, move, alt text)
     */
    public function bulkOptimizeSeo(Request $request)
    {
        $request->validate([
            'ids'         => 'required|array|min:1',
            'ids.*'       => 'required|exists:tenant_media,id',
            'product_id'  => 'nullable|exists:ec_products,id'
        ]);

        $mediaItems = Media::whereIn('id', $request->ids)->get();
        $product = $request->product_id ? \App\Models\Ecommerce\Product::find($request->product_id) : null;

        $results = [];
        foreach ($mediaItems as $media) {
            $data = [
                'name'     => $product?->name ?? $media->title,
                'category' => $product?->category ?? 'general',
                'attributes'=> isset($media->metadata['attributes']) ? $media->metadata['attributes'] : [],
            ];

            // 1. Generate SEO
            $seo = $this->aiSeo->generateImageSeo($data);
            $folderPath = $this->aiSeo->generateSemanticPath($data);

            // 2. Update metadata
            $media->update([
                'alt_text' => $seo['alt_text'],
                'title'    => $seo['title'],
            ]);

            // 3. Physical Restructure
            $this->seoManager->semantizeMedia($media, [
                'filename'    => $seo['filename'],
                'folder_path' => $folderPath
            ]);

            $results[] = [
                'id' => $media->id,
                'new_url' => $media->url,
                'status' => 'optimized'
            ];
        }

        return response()->json([
            'success' => true,
            'message' => count($results) . ' image(s) optimized with Google-first logic.',
            'data'    => $results
        ]);
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes >= 1073741824) return round($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576)    return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024)       return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}
