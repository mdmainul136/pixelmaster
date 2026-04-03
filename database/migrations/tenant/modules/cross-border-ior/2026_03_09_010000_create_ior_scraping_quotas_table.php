<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * IOR Scraping Quotas — credit-based system.
     */
    public function up(): void
    {
        $connection = 'tenant_dynamic';
        
        // 1. Scraping Quotas
        Schema::connection($connection)->dropIfExists('ior_scraping_quotas');
        Schema::connection($connection)->create('ior_scraping_quotas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('credits_purchased')->default(1000);
            $table->unsignedBigInteger('credits_used')->default(0);
            $table->unsignedBigInteger('credits_remaining')->default(1000);
            $table->decimal('cost_per_1k', 10, 2)->default(120.00); 
            $table->string('payment_reference')->nullable();         
            $table->string('status')->default('active');             
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 2. Refunds
        Schema::connection($connection)->dropIfExists('ior_refunds');
        Schema::connection($connection)->create('ior_refunds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('order_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); 
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('order_id');
        });

        // 3. Customs Documents
        Schema::connection($connection)->dropIfExists('ior_customs_documents');
        Schema::connection($connection)->create('ior_customs_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->string('document_type')->default('invoice'); // invoice|packing_list|customs_declaration|certificate_of_origin
            $table->string('file_path')->nullable();
            $table->string('status')->default('pending'); // pending|approved|rejected
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        $connection = 'tenant_dynamic';
        Schema::connection($connection)->dropIfExists('ior_scraping_quotas');
        Schema::connection($connection)->dropIfExists('ior_refunds');
        Schema::connection($connection)->dropIfExists('ior_customs_documents');
    }
};
