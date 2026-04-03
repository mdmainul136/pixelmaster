<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Updates the themes table to support production/marketplace features.
     */
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            // Some fields might already exist from previous migrations, so we check
            if (!Schema::hasColumn('themes', 'version')) {
                $table->string('version')->default('1.0.0')->after('slug');
            }
            if (!Schema::hasColumn('themes', 'description')) {
                $table->text('description')->nullable()->after('version');
            }
            if (!Schema::hasColumn('themes', 'author')) {
                $table->string('author')->nullable()->after('description');
            }
            if (!Schema::hasColumn('themes', 'thumbnail')) {
                $table->string('thumbnail')->nullable()->after('author');
            }
            if (!Schema::hasColumn('themes', 'status')) {
                $table->enum('status', ['active', 'draft', 'archived'])->default('draft')->after('thumbnail');
            }
            if (!Schema::hasColumn('themes', 'is_marketplace')) {
                $table->boolean('is_marketplace')->default(false)->after('status');
            }
            if (!Schema::hasColumn('themes', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->after('is_marketplace');
            }
            if (!Schema::hasColumn('themes', 'compatibility')) {
                $table->json('compatibility')->nullable()->after('price');
            }
        });

        // 2. tenant_themes (Multi-tenant theme assignment)
        if (!Schema::hasTable('tenant_themes')) {
            Schema::create('tenant_themes', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index(); // Changed from foreignId for central DB compatibility if needed
                $table->foreignId('theme_id')->constrained()->onDelete('cascade');
                $table->json('settings'); 
                $table->boolean('is_active')->default(false);
                $table->timestamp('installed_at')->nullable();
                $table->unique(['tenant_id', 'theme_id']);
                $table->timestamps();
            });
        }

        // 3. theme_sections (Section registry)
        if (!Schema::hasTable('theme_sections')) {
            Schema::create('theme_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('theme_id')->constrained()->onDelete('cascade');
                $table->string('name'); 
                $table->string('component_path'); 
                $table->json('schema'); 
                $table->json('default_settings')->nullable();
                $table->integer('order')->default(0);
                $table->timestamps();
            });
        }

        // 4. page_layouts (Dynamic pages)
        if (!Schema::hasTable('page_layouts')) {
            Schema::create('page_layouts', function (Blueprint $table) {
                $table->id();
                $table->string('tenant_id')->index();
                $table->string('slug'); 
                $table->string('template')->default('default'); 
                $table->json('sections')->comment('Array of section identifiers with settings'); 
                $table->json('meta')->nullable(); 
                $table->timestamps();
                $table->unique(['tenant_id', 'slug']);
            });
        }

        // 5. theme_assets (CSS, JS, Images)
        if (!Schema::hasTable('theme_assets')) {
            Schema::create('theme_assets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('theme_id')->constrained()->onDelete('cascade');
                $table->enum('type', ['css', 'js', 'image', 'font']);
                $table->string('path');
                $table->bigInteger('size')->nullable();
                $table->string('cdn_url')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_assets');
        Schema::dropIfExists('page_layouts');
        Schema::dropIfExists('theme_sections');
        Schema::dropIfExists('tenant_themes');
        
        Schema::table('themes', function (Blueprint $table) {
            $table->dropColumn(['version', 'description', 'author', 'thumbnail', 'status', 'is_marketplace', 'price', 'compatibility']);
        });
    }
};
