<?php
/**
 * Create Central Tracking Containers Table (Consolidated)
 * 
 * Provides a global registry in the landlord database to track
 * container allocations across nodes for infrastructure management.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('ec_tracking_containers')) {
            Schema::create('ec_tracking_containers', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('container_id')->unique(); // GTM-XXXXXXX
                $table->string('domain')->nullable();
                $table->boolean('is_active')->default(true);
                
                // Infrastructure mapping
                $table->string('docker_status')->nullable();
                $table->integer('docker_port')->nullable();
                $table->integer('sidecar_port')->nullable();
                $table->foreignId('docker_node_id')
                      ->nullable()
                      ->constrained('docker_nodes')
                      ->nullOnDelete();

                $table->timestamp('provisioned_at')->nullable();
                $table->timestamps();
            });
        } else {
            // If table existed but missed columns
            Schema::table('ec_tracking_containers', function (Blueprint $table) {
                if (!Schema::hasColumn('ec_tracking_containers', 'docker_node_id')) {
                    $table->foreignId('docker_node_id')
                          ->nullable()
                          ->after('docker_port')
                          ->constrained('docker_nodes')
                          ->nullOnDelete();
                }
                if (!Schema::hasColumn('ec_tracking_containers', 'sidecar_port')) {
                    $table->integer('sidecar_port')
                          ->nullable()
                          ->after('docker_port');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ec_tracking_containers');
    }
};
