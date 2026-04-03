<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Centralized Media Library table.
     * Stores all uploaded files for the tenant — images, documents, videos.
     * Used across all modules (Ecommerce, CRM, Marketing, Storefront, etc.)
     */
    public function up(): void
    {
        Schema::create('tenant_media', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 100);           // Generated unique filename (e.g. abc123.webp)
            $table->string('original_name', 255);        // Original uploaded filename
            $table->string('mime_type', 100);             // image/webp, image/jpeg, application/pdf
            $table->string('disk', 20)->default('public');// Storage disk: public, s3, local
            $table->string('path', 500);                  // Full path on disk: media/images/abc123.webp
            $table->text('url');                           // Public accessible URL
            $table->unsignedBigInteger('size')->default(0); // File size in bytes
            $table->unsignedInteger('width')->nullable();   // Image width in pixels
            $table->unsignedInteger('height')->nullable();  // Image height in pixels
            $table->string('alt_text', 255)->nullable();     // SEO alt text
            $table->string('title', 255)->nullable();        // Display title
            $table->string('folder', 100)->default('/');     // Folder organization: /, products, banners
            $table->json('tags')->nullable();                 // ["product", "hero", "banner"]
            $table->string('type', 20)->default('image');    // image, video, document, other
            $table->json('metadata')->nullable();            // Extra data: { "source": "upload", "product_id": 5 }
            $table->unsignedBigInteger('uploaded_by')->nullable(); // User who uploaded
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('folder');
            $table->index('type');
            $table->index('mime_type');
            $table->index('created_at');
            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_media');
    }
};
